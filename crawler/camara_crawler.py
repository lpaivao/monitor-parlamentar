"""
Crawler - Câmara dos Deputados (apenas gastos / cota parlamentar)
API: https://dadosabertos.camara.leg.br/api/v2
"""

import time
import logging
import requests
from typing import Optional
from db import get_conn, upsert_parlamentar, insert_despesas_batch, log_sync

log = logging.getLogger(__name__)

BASE_URL = "https://dadosabertos.camara.leg.br/api/v2"
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
            despesas = fetch_despesas(api_id, ano)
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
