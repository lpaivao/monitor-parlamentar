"""
Conexão com PostgreSQL e funções de gravação.
"""

import os
import logging
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()
log = logging.getLogger(__name__)


def get_conn():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 5432)),
        dbname=os.getenv("DB_NAME", "monitor_parlamentar"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", ""),
    )


# ──────────────────────────────────────────────
# PARTIDOS
# ──────────────────────────────────────────────

def upsert_partido(conn, sigla: str, nome: str) -> int:
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO partidos (sigla, nome)
            VALUES (%s, %s)
            ON CONFLICT (sigla) DO UPDATE SET nome = EXCLUDED.nome
            RETURNING id
        """, (sigla, nome))
        return cur.fetchone()[0]


# ──────────────────────────────────────────────
# PARLAMENTARES
# ──────────────────────────────────────────────

def upsert_parlamentar(conn, data: dict) -> int:
    """
    data = {
        api_id, nome, sigla_partido, sigla_uf,
        foto_url, casa, legislatura
    }
    """
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO parlamentares
                (api_id, nome, sigla_partido, sigla_uf, foto_url, casa, legislatura)
            VALUES
                (%(api_id)s, %(nome)s, %(sigla_partido)s, %(sigla_uf)s,
                 %(foto_url)s, %(casa)s, %(legislatura)s)
            ON CONFLICT (api_id, casa) DO UPDATE SET
                nome          = EXCLUDED.nome,
                sigla_partido = EXCLUDED.sigla_partido,
                sigla_uf      = EXCLUDED.sigla_uf,
                foto_url      = EXCLUDED.foto_url,
                legislatura   = EXCLUDED.legislatura,
                updated_at    = NOW()
            RETURNING id
        """, data)
        return cur.fetchone()[0]


# ──────────────────────────────────────────────
# DESPESAS
# ──────────────────────────────────────────────

def _clean_str(value):
    if value is None:
        return None
    s = str(value).strip()
    return s if s else None


def _to_float(value):
    if value in (None, ""):
        return 0.0
    try:
        return float(str(value).replace(",", "."))
    except (ValueError, TypeError):
        return 0.0

def insert_despesas_batch(conn, parlamentar_id: int, despesas: list[dict]):
    """
    Insere lote de despesas ignorando duplicatas.
    Cada item do lote deve ter:
        ano, mes, tipo_despesa, fornecedor, cnpj_cpf,
        valor_documento, valor_liquido, numero_documento,
        url_documento, data_emissao
    """
    if not despesas:
        return

    rows = [
        (
            parlamentar_id,
            d.get("ano"),
            d.get("mes"),
            _clean_str(d.get("tipoDespesa") or d.get("tipo_despesa")),
            _clean_str(d.get("nomeFornecedor") or d.get("fornecedor")),
            _clean_str(d.get("cnpjCpfFornecedor") or d.get("cnpj_cpf")),
            _to_float(d.get("valorDocumento") or d.get("valor_documento")),
            _to_float(d.get("valorLiquido") or d.get("valor_liquido")),
            _clean_str(d.get("numDocumento") or d.get("numero_documento")),
            _clean_str(d.get("urlDocumento") or d.get("url_documento")),
            _clean_str(d.get("dataEmissao") or d.get("data_emissao")),
        )
        for d in despesas
    ]

    with conn.cursor() as cur:
        psycopg2.extras.execute_values(cur, """
            INSERT INTO despesas
                (parlamentar_id, ano, mes, tipo_despesa, fornecedor, cnpj_cpf,
                 valor_documento, valor_liquido, numero_documento, url_documento, data_emissao)
            VALUES %s
            ON CONFLICT DO NOTHING
        """, rows)
        inserted = cur.rowcount if cur.rowcount is not None and cur.rowcount >= 0 else 0

    ignored = len(rows) - inserted
    log.info(
        "  → "
        f"{inserted} despesas inseridas (parlamentar_id={parlamentar_id}; "
        f"{ignored} duplicadas ignoradas)"
    )


# ──────────────────────────────────────────────
# SYNC LOG
# ──────────────────────────────────────────────

def log_sync(conn, casa: str, ano: int, status: str, detalhes: str = None):
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO sync_logs (casa, ano, status, detalhes)
            VALUES (%s, %s, %s, %s)
        """, (casa, ano, status, detalhes))
