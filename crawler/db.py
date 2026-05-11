"""
Conexão com PostgreSQL e funções de gravação.
"""

import os
import logging
import hashlib
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

# def upsert_partido(conn, sigla: str, nome: str) -> int:
#     with conn.cursor() as cur:
#         cur.execute("""
#             INSERT INTO partidos (sigla, nome)
#             VALUES (%s, %s)
#             ON CONFLICT (sigla) DO UPDATE SET nome = EXCLUDED.nome
#             RETURNING id
#         """, (sigla, nome))
#         return cur.fetchone()[0]


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
    Utiliza deduplicação em dois níveis:
      1. Em memória (before INSERT) — evita round-trips desnecessários.
      2. No banco via ON CONFLICT ON CONSTRAINT — garante integridade mesmo
         em execuções concorrentes ou re-execuções do crawler.
    """
    if not despesas:
        return

    # ── 1. Deduplicação em memória e cálculo do MD5 ──────────────────────
    seen: set = set()
    unique_despesas: list[dict] = []
    for d in despesas:
        # Extrai o cod_documento se existir
        raw_cod = d.get("codDocumento") or d.get("cod_documento")
        cod_doc = None
        if raw_cod:
            try:
                cod_doc = int(raw_cod)
            except (ValueError, TypeError):
                pass

        d["_cod_doc_parsed"] = cod_doc if cod_doc and cod_doc > 0 else None

        key_tuple = (
            str(parlamentar_id),
            str(d.get("ano") or ""),
            str(d.get("mes") or ""),
            _clean_str(d.get("tipoDespesa") or d.get("tipo_despesa")) or "",
            _clean_str(d.get("nomeFornecedor") or d.get("fornecedor")) or "",
            _clean_str(d.get("cnpjCpfFornecedor") or d.get("cnpj_cpf")) or "",
            str(_to_float(d.get("valorDocumento") or d.get("valor_documento"))),
            str(_to_float(d.get("valorLiquido") or d.get("valor_liquido"))),
            _clean_str(d.get("numDocumento") or d.get("numero_documento")) or "",
            _clean_str(d.get("urlDocumento") or d.get("url_documento")) or "",
            _clean_str(d.get("dataEmissao") or d.get("data_emissao")) or "",
            str(d["_cod_doc_parsed"] or "")
        )

        # Usando separador '||' para garantir mesma lógica de unicidade
        raw_key = "||".join(key_tuple)
        dedupe_hash = hashlib.md5(raw_key.encode("utf-8")).hexdigest()
        
        d["_dedupe_hash"] = dedupe_hash

        if dedupe_hash not in seen:
            seen.add(dedupe_hash)
            unique_despesas.append(d)

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
            d["_cod_doc_parsed"],
            d["_dedupe_hash"],
        )
        for d in unique_despesas
    ]

    # ── 2. INSERT com ON CONFLICT (dedupe_hash) ──────────────────────────
    with conn.cursor() as cur:
        result = psycopg2.extras.execute_values(
            cur, 
            """
                INSERT INTO despesas
                    (parlamentar_id, ano, mes, tipo_despesa, fornecedor, cnpj_cpf,
                     valor_documento, valor_liquido, numero_documento, url_documento, data_emissao, cod_documento, dedupe_hash)
                VALUES %s
                ON CONFLICT (dedupe_hash) DO NOTHING
                RETURNING id
            """, 
            rows,
            fetch=True
        )
        inserted = len(result) if result else 0

    skipped_mem = len(despesas) - len(unique_despesas)
    skipped_db  = len(unique_despesas) - inserted
    log.info(
        "  -> "
        f"{inserted} despesas inseridas (parlamentar_id={parlamentar_id}; "
        f"{skipped_mem} dedupadas em memória, {skipped_db} rejeitadas pelo banco)"
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
