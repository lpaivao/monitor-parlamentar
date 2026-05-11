-- V001: Criação das tabelas base
-- Equivalente à migration AdonisJS 20240101000000_create_tables

-- ── parlamentares ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parlamentares (
    id            SERIAL PRIMARY KEY,
    api_id        INTEGER      NOT NULL,
    nome          VARCHAR(300) NOT NULL,
    sigla_partido VARCHAR(20),
    sigla_uf      VARCHAR(2),
    foto_url      TEXT,
    casa          VARCHAR(20)  NOT NULL DEFAULT 'camara',
    legislatura   INTEGER      NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT parlamentares_api_id_casa_unique UNIQUE (api_id, casa),
    CONSTRAINT parlamentares_casa_camara_only   CHECK  (casa = 'camara')
);

CREATE INDEX IF NOT EXISTS parlamentares_sigla_partido_index ON parlamentares (sigla_partido);
CREATE INDEX IF NOT EXISTS parlamentares_sigla_uf_index      ON parlamentares (sigla_uf);
CREATE INDEX IF NOT EXISTS parlamentares_casa_index          ON parlamentares (casa);

-- ── despesas ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS despesas (
    id               SERIAL PRIMARY KEY,
    parlamentar_id   INTEGER        NOT NULL REFERENCES parlamentares (id) ON DELETE CASCADE,
    ano              INTEGER        NOT NULL,
    mes              INTEGER,
    tipo_despesa     VARCHAR(300),
    fornecedor       VARCHAR(300),
    cnpj_cpf         VARCHAR(20),
    valor_documento  NUMERIC(14, 2) NOT NULL DEFAULT 0,
    valor_liquido    NUMERIC(14, 2) NOT NULL DEFAULT 0,
    numero_documento VARCHAR(100),
    url_documento    TEXT,
    data_emissao     DATE,
    cod_documento    BIGINT,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS despesas_parlamentar_id_index ON despesas (parlamentar_id);
CREATE INDEX IF NOT EXISTS despesas_ano_mes_index        ON despesas (ano, mes);
CREATE INDEX IF NOT EXISTS despesas_tipo_despesa_index   ON despesas (tipo_despesa);

-- ── sync_logs ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sync_logs (
    id         SERIAL PRIMARY KEY,
    casa       VARCHAR(20)  NOT NULL,
    ano        INTEGER      NOT NULL,
    status     VARCHAR(10)  NOT NULL,
    detalhes   TEXT,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT sync_logs_status_check CHECK (status IN ('ok', 'erro')),
    CONSTRAINT sync_logs_casa_camara_only CHECK (casa = 'camara')
);
