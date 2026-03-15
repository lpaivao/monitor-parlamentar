"""
Crawler - Senado Federal (apenas gastos / CEAPS)
API: https://legis.senado.leg.br/dadosabertos
"""

import time
import logging
import requests
from typing import Optional
from db import get_conn, upsert_parlamentar, insert_despesas_batch, log_sync

log = logging.getLogger(__name__)

BASE_URL = "https://legis.senado.leg.br/dadosabertos"
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
            time.sleep(0.4)
            return r.json()
        except requests.HTTPError:
            if r.status_code == 429:
                log.warning("Rate limit Senado, aguardando 10s...")
                time.sleep(10)
            else:
                log.warning(f"HTTP {r.status_code} em {url}")
        except Exception as e:
            log.error(f"Erro em {url}: {e}")
            time.sleep(2)
    return None


# ──────────────────────────────────────────────
# SENADORES
# ──────────────────────────────────────────────

def fetch_senadores(legislatura: int) -> list:
    log.info(f"[Senado] Buscando senadores da legislatura {legislatura}...")
    data = get(f"/senador/lista/legislatura/{legislatura}")
    if not data:
        return []

    try:
        parlamentares = (
            data
            .get("ListaParlamentarLegislatura", {})
            .get("Parlamentares", {})
            .get("Parlamentar", [])
        )
        return parlamentares if isinstance(parlamentares, list) else [parlamentares]
    except Exception as e:
        log.error(f"Erro ao parsear senadores: {e}")
        return []


def parse_senador(raw: dict) -> dict:
    """Normaliza estrutura da API do Senado."""
    id_parl = raw.get("IdentificacaoParlamentar", {})
    return {
        "api_id":        id_parl.get("CodigoParlamentar"),
        "nome":          id_parl.get("NomeParlamentar") or id_parl.get("NomeCompletoParlamentar"),
        "sigla_partido": id_parl.get("SiglaPartidoParlamentar"),
        "sigla_uf":      id_parl.get("UfParlamentar"),
        "foto_url":      id_parl.get("UrlFotoParlamentar"),
    }


# ──────────────────────────────────────────────
# CEAPS (Cota para Exercício da Atividade Parlamentar do Senado)
# ──────────────────────────────────────────────

def fetch_ceaps_senador(api_id: int, ano: int) -> list:
    """
    Busca gastos CEAPS de um senador.
    A API retorna por ano; iteramos mês a mês se necessário.
    """
    data = get(f"/senador/{api_id}/despesas", {"ano": ano})
    if not data:
        return []

    try:
        despesas_raw = (
            data
            .get("SenadorDespesas", {})
            .get("Despesas", {})
            .get("Despesa", [])
        )
        if not isinstance(despesas_raw, list):
            despesas_raw = [despesas_raw] if despesas_raw else []

        # Normaliza para o formato usado pelo db.py
        return [
            {
                "ano":              d.get("AnoDeExercicio") or d.get("Ano"),
                "mes":              d.get("MesDeExercicio") or d.get("Mes"),
                "tipo_despesa":     d.get("DescricaoTipoDespesa") or d.get("Natureza"),
                "fornecedor":       d.get("NomeFornecedor"),
                "cnpj_cpf":         d.get("CnpjCpfFornecedor"),
                "valor_documento":  _to_float(d.get("ValorDaDespesa")),
                "valor_liquido":    _to_float(d.get("ValorDaDespesa")),
                "numero_documento": d.get("NumeroDocumento"),
                "url_documento":    None,
                "data_emissao":     d.get("DataDoDia") or d.get("DataEmissao"),
            }
            for d in despesas_raw
        ]
    except Exception as e:
        log.error(f"Erro ao parsear CEAPS do senador {api_id}: {e}")
        return []


def _to_float(value) -> float:
    if value is None:
        return 0.0
    try:
        return float(str(value).replace(",", "."))
    except (ValueError, TypeError):
        return 0.0


# ──────────────────────────────────────────────
# EXECUÇÃO
# ──────────────────────────────────────────────

def run(legislatura: int, ano: int):
    log.info("=" * 50)
    log.info(f"[Senado] Iniciando coleta | Legislatura {legislatura} | Ano {ano}")
    log.info("=" * 50)

    conn = get_conn()
    try:
        senadores_raw = fetch_senadores(legislatura)
        log.info(f"[Senado] {len(senadores_raw)} senadores encontrados")

        total_despesas = 0
        for i, raw in enumerate(senadores_raw, 1):
            sen = parse_senador(raw)
            if not sen["api_id"]:
                continue

            log.info(f"  [{i}/{len(senadores_raw)}] {sen['nome']} ({sen.get('sigla_partido','?')}/{sen.get('sigla_uf','?')})")

            parlamentar_id = upsert_parlamentar(conn, {
                **sen,
                "casa":        "senado",
                "legislatura": legislatura,
            })

            despesas = fetch_ceaps_senador(sen["api_id"], ano)
            insert_despesas_batch(conn, parlamentar_id, despesas)
            total_despesas += len(despesas)
            conn.commit()

        log_sync(conn, "senado", ano, "ok", f"{len(senadores_raw)} parlamentares, {total_despesas} despesas")
        conn.commit()
        log.info(f"[Senado] Concluído. {total_despesas} despesas gravadas.")

    except Exception as e:
        conn.rollback()
        log_sync(conn, "senado", ano, "erro", str(e))
        conn.commit()
        log.error(f"[Senado] Erro: {e}")
        raise
    finally:
        conn.close()
