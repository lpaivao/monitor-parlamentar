"""
Crawler - Câmara dos Deputados (apenas gastos / cota parlamentar)
Deputados: API REST
Despesas: arquivo anual JSON zipado (https://www.camara.leg.br/cotas/)
"""

import io
import zipfile
import time
import logging
import requests
import json
import importlib
import unicodedata
from datetime import date, datetime
from typing import Optional
from db import get_conn, upsert_parlamentar, insert_despesas_batch, log_sync

log = logging.getLogger(__name__)

BASE_URL = "https://dadosabertos.camara.leg.br/api/v2"
COTAS_ZIP_URL_TEMPLATE = "https://www.camara.leg.br/cotas/Ano-{ano}.json.zip"
HEADERS  = {"Accept": "application/json", "User-Agent": "MonitorParlamentar/1.0"}


# ──────────────────────────────────────────────
# HTTP
# ──────────────────────────────────────────────

def get(endpoint: str, params: dict = None, retries: int = 3) -> Optional[dict]:
    url = f"{BASE_URL}{endpoint}"
    for attempt in range(retries):
        try:
            r = requests.get(url, params=params, headers=HEADERS, timeout=30)
            r.raise_for_status()
            time.sleep(0.3)
            return r.json()
        except requests.HTTPError:
            if r.status_code == 429:
                log.warning("Rate limit, aguardando 10s...")
                time.sleep(10)
            else:
                log.warning(f"HTTP {r.status_code} em {url}")
        except Exception as e:
            log.error(f"Erro em {url}: {e}")
            time.sleep(2)
    return None


def get_all_pages(endpoint: str, params: dict = None) -> list:
    params = {**(params or {}), "itens": 100, "pagina": 1}
    results = []
    while True:
        data = get(endpoint, params)
        if not data or not data.get("dados"):
            break
        results.extend(data["dados"])
        links = {l["rel"]: l for l in data.get("links", [])}
        if "next" not in links:
            break
        params["pagina"] += 1
    return results


# ──────────────────────────────────────────────
# DEPUTADOS
# ──────────────────────────────────────────────

def fetch_deputados(legislatura: int) -> list:
    log.info(f"[Câmara] Buscando deputados da legislatura {legislatura}...")
    return get_all_pages("/deputados", {
        "idLegislatura": legislatura,
        "ordem": "ASC",
        "ordenarPor": "nome"
    })


# ──────────────────────────────────────────────
# DESPESAS
# ──────────────────────────────────────────────

def fetch_despesas(api_id: int, ano: int) -> list:
    return get_all_pages(f"/deputados/{api_id}/despesas", {"ano": ano})


def fetch_despesas_mes(api_id: int, ano: int, mes: int) -> list:
    return get_all_pages(f"/deputados/{api_id}/despesas", {"ano": ano, "mes": mes})


def _normalize_text(value: Optional[str]) -> str:
    if not value:
        return ""
    normalized = unicodedata.normalize("NFKD", value)
    return "".join(c for c in normalized if not unicodedata.combining(c)).strip().upper()


def _build_dep_key(nome: Optional[str], partido: Optional[str], uf: Optional[str]) -> str:
    return f"{_normalize_text(nome)}|{_normalize_text(partido)}|{_normalize_text(uf)}"


def _extract_api_id(item: dict) -> Optional[int]:
    for key in ("idDeputado", "ideCadastro", "id_deputado", "numeroDeputadoID"):
        raw = item.get(key)
        if raw is None:
            continue
        try:
            return int(raw)
        except (TypeError, ValueError):
            continue
    return None


def _to_float(value) -> float:
    if value in (None, ""):
        return 0.0
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def _normalize_despesa(item: dict, ano: int) -> dict:
    return {
        "ano": item.get("numAno") or item.get("ano") or ano,
        "mes": item.get("numMes") or item.get("mes"),
        "tipoDespesa": item.get("txtDescricao") or item.get("descricao") or item.get("tipoDespesa"),
        "nomeFornecedor": item.get("txtFornecedor") or item.get("fornecedor") or item.get("nomeFornecedor"),
        "cnpjCpfFornecedor": item.get("txtCNPJCPF") or item.get("cnpjCPF") or item.get("cnpjCpfFornecedor"),
        "valorDocumento": _to_float(item.get("vlrDocumento") or item.get("valorDocumento")),
        "valorLiquido": _to_float(item.get("vlrLiquido") or item.get("valorLiquido")),
        "numDocumento": item.get("numDocumento") or item.get("numero") or item.get("numeroDocumento"),
        "urlDocumento": item.get("urlDocumento"),
        "dataEmissao": item.get("datEmissao") or item.get("dataEmissao"),
    }


def _parse_data_emissao(raw: Optional[str]) -> Optional[date]:
    if not raw:
        return None

    value = str(raw).strip()
    if not value:
        return None

    candidates = [value]
    if "T" in value:
        candidates.append(value.split("T", 1)[0])
    if " " in value:
        candidates.append(value.split(" ", 1)[0])

    for candidate in candidates:
        for fmt in ("%Y-%m-%d", "%Y-%m-%d %H:%M:%S", "%d/%m/%Y"):
            try:
                return datetime.strptime(candidate, fmt).date()
            except ValueError:
                continue

    return None


def _is_despesa_do_dia(item: dict, alvo: date) -> bool:
    despesa_data = _parse_data_emissao(item.get("datEmissao") or item.get("dataEmissao"))
    return despesa_data == alvo


def fetch_despesas_zip_ano(ano: int, retries: int = 3) -> tuple[dict[int, list[dict]], dict[str, list[dict]]]:
    """
    Baixa o ZIP anual de despesas (JSON) e agrupa por:
      - id do deputado (quando existir e casar com id REST)
      - chave textual nome+partido+UF (fallback)
    O arquivo pode vir como array na raiz ou como objeto com chave "dados".
    """
    url = COTAS_ZIP_URL_TEMPLATE.format(ano=ano)
    grouped_by_id: dict[int, list[dict]] = {}
    grouped_by_key: dict[str, list[dict]] = {}
    ijson_parser = None
    try:
        ijson_parser = importlib.import_module("ijson")
    except ImportError:
        pass

    for attempt in range(retries):
        try:
            log.info(f"[Câmara] Baixando despesas anuais: {url}")
            with requests.get(url, headers=HEADERS, timeout=180) as r:
                r.raise_for_status()
                zip_bytes = io.BytesIO(r.content)

            with zipfile.ZipFile(zip_bytes) as zf:
                json_name = next((n for n in zf.namelist() if n.lower().endswith(".json")), None)
                if not json_name:
                    raise RuntimeError("ZIP da Câmara sem arquivo JSON")

                log.info(f"[Câmara] Processando arquivo {json_name}...")
                total = 0
                ignored = 0
                with zf.open(json_name) as json_file:
                    buffered = io.BufferedReader(json_file)
                    first_bytes = buffered.peek(2048).lstrip()
                    prefix = "dados.item" if first_bytes.startswith(b"{") else "item"

                    with io.TextIOWrapper(buffered, encoding="utf-8") as text_stream:
                        if ijson_parser:
                            iterator = ijson_parser.items(text_stream, prefix)
                        else:
                            log.warning("[Câmara] ijson não instalado; usando parser padrão (pode consumir mais memória)")
                            parsed = json.load(text_stream)
                            iterator = parsed.get("dados", []) if isinstance(parsed, dict) else parsed

                        for item in iterator:
                            despesa = _normalize_despesa(item, ano)
                            api_id = _extract_api_id(item)
                            if api_id is not None:
                                grouped_by_id.setdefault(api_id, []).append(despesa)

                            dep_key = _build_dep_key(
                                item.get("nomeParlamentar"),
                                item.get("siglaPartido"),
                                item.get("siglaUF"),
                            )
                            if dep_key != "||":
                                grouped_by_key.setdefault(dep_key, []).append(despesa)

                            if api_id is None and dep_key == "||":
                                ignored += 1

                            total += 1
                            if total % 100000 == 0:
                                log.info(f"[Câmara] {total} despesas processadas do ZIP...")

                log.info(
                    f"[Câmara] ZIP processado: {total} despesas válidas, "
                    f"{ignored} linhas sem id de deputado"
                )
                return grouped_by_id, grouped_by_key

        except requests.HTTPError as e:
            status = e.response.status_code if e.response is not None else "?"
            log.warning(f"HTTP {status} ao baixar ZIP anual ({url})")
        except Exception as e:
            log.warning(f"Falha ao processar ZIP anual ({url}): {e}")

        # Backoff incremental entre tentativas
        time.sleep(3 * (attempt + 1))

    raise RuntimeError(f"Não foi possível baixar/processar o ZIP anual da Câmara para {ano}")


# ──────────────────────────────────────────────
# EXECUÇÃO
# ──────────────────────────────────────────────

def run(legislatura: int, ano: int):
    log.info("=" * 50)
    log.info(f"[Câmara] Iniciando coleta | Legislatura {legislatura} | Ano {ano}")
    log.info("=" * 50)

    conn = get_conn()
    try:
        deputados = fetch_deputados(legislatura)
        log.info(f"[Câmara] {len(deputados)} deputados encontrados")

        despesas_por_deputado = {}
        despesas_por_chave = {}
        usar_fallback_api = False
        try:
            despesas_por_deputado, despesas_por_chave = fetch_despesas_zip_ano(ano)
            log.info(
                "[Câmara] Despesas anuais carregadas para "
                f"{len(despesas_por_deputado)} ids e {len(despesas_por_chave)} chaves nominais"
            )
        except Exception as e:
            usar_fallback_api = True
            log.warning(
                "[Câmara] Falha no ZIP anual; voltando para API REST por deputado. "
                f"Motivo: {e}"
            )

        total_despesas = 0
        for i, dep in enumerate(deputados, 1):
            api_id = dep["id"]
            log.info(f"  [{i}/{len(deputados)}] {dep['nome']} ({dep.get('siglaPartido','?')}/{dep.get('siglaUf','?')})")

            # 1. Salva/atualiza parlamentar
            parlamentar_id = upsert_parlamentar(conn, {
                "api_id":       api_id,
                "nome":         dep["nome"],
                "sigla_partido": dep.get("siglaPartido"),
                "sigla_uf":     dep.get("siglaUf"),
                "foto_url":     dep.get("urlFoto"),
                "casa":         "camara",
                "legislatura":  legislatura,
            })

            # 2. Coleta e salva despesas
            if usar_fallback_api:
                despesas = fetch_despesas(api_id, ano)
            else:
                dep_key = _build_dep_key(dep.get("nome"), dep.get("siglaPartido"), dep.get("siglaUf"))
                despesas = despesas_por_deputado.get(api_id) or despesas_por_chave.get(dep_key, [])

            insert_despesas_batch(conn, parlamentar_id, despesas)
            total_despesas += len(despesas)
            conn.commit()

        log_sync(conn, "camara", ano, "ok", f"{len(deputados)} parlamentares, {total_despesas} despesas")
        conn.commit()
        log.info(f"[Câmara] Concluído. {total_despesas} despesas gravadas.")

    except Exception as e:
        conn.rollback()
        log_sync(conn, "camara", ano, "erro", str(e))
        conn.commit()
        log.error(f"[Câmara] Erro: {e}")
        raise
    finally:
        conn.close()


def run_atualizacao_diaria(legislatura: int, alvo: Optional[date] = None):
    alvo = alvo or date.today()

    log.info("=" * 50)
    log.info(
        f"[Câmara] Iniciando atualização diária via API | "
        f"Legislatura {legislatura} | Data {alvo.isoformat()}"
    )
    log.info("=" * 50)

    conn = get_conn()
    try:
        deputados = fetch_deputados(legislatura)
        log.info(f"[Câmara] {len(deputados)} deputados encontrados")

        total_despesas = 0
        for i, dep in enumerate(deputados, 1):
            api_id = dep["id"]
            log.info(
                f"  [{i}/{len(deputados)}] {dep['nome']} "
                f"({dep.get('siglaPartido','?')}/{dep.get('siglaUf','?')})"
            )

            parlamentar_id = upsert_parlamentar(conn, {
                "api_id": api_id,
                "nome": dep["nome"],
                "sigla_partido": dep.get("siglaPartido"),
                "sigla_uf": dep.get("siglaUf"),
                "foto_url": dep.get("urlFoto"),
                "casa": "camara",
                "legislatura": legislatura,
            })

            despesas_mes = fetch_despesas_mes(api_id, alvo.year, alvo.month)
            despesas_dia = [
                _normalize_despesa(item, alvo.year)
                for item in despesas_mes
                if _is_despesa_do_dia(item, alvo)
            ]

            insert_despesas_batch(conn, parlamentar_id, despesas_dia)
            total_despesas += len(despesas_dia)
            conn.commit()

        log_sync(
            conn,
            "camara",
            alvo.year,
            "ok",
            f"atualizacao diaria {alvo.isoformat()}: "
            f"{len(deputados)} parlamentares, {total_despesas} despesas",
        )
        conn.commit()
        log.info(
            f"[Câmara] Atualização diária concluída. "
            f"{total_despesas} despesas do dia processadas."
        )

    except Exception as e:
        conn.rollback()
        log_sync(conn, "camara", alvo.year, "erro", f"atualizacao diaria {alvo.isoformat()}: {e}")
        conn.commit()
        log.error(f"[Câmara] Erro na atualização diária: {e}")
        raise
    finally:
        conn.close()
