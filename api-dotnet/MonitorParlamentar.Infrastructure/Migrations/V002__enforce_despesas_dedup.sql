-- V002: Deduplicação de despesas — adiciona coluna de hash e constraint UNIQUE
-- Substitui a abordagem de índice funcional (que não é suportada em ON CONFLICT no Postgres)
-- por uma coluna calculada no lado da aplicação.

ALTER TABLE despesas ADD COLUMN dedupe_hash VARCHAR(32);

-- Atualiza registros existentes (se houver) para evitar quebrar a constraint
UPDATE despesas SET dedupe_hash = md5(
    coalesce(parlamentar_id::text, '') || '||' ||
    coalesce(ano::text,            '') || '||' ||
    coalesce(mes::text,            '') || '||' ||
    coalesce(tipo_despesa,         '') || '||' ||
    coalesce(fornecedor,           '') || '||' ||
    coalesce(cnpj_cpf,             '') || '||' ||
    coalesce(valor_documento::text,'') || '||' ||
    coalesce(valor_liquido::text,  '') || '||' ||
    coalesce(numero_documento,     '') || '||' ||
    coalesce(url_documento,        '') || '||' ||
    coalesce((data_emissao - DATE '1970-01-01')::text, '') || '||' ||
    coalesce(cod_documento::text,  '')
)
WHERE dedupe_hash IS NULL;

-- Se houver duplicatas pré-existentes, precisamos limpar antes da constraint
WITH ranked AS (
    SELECT id, row_number() OVER (PARTITION BY dedupe_hash ORDER BY id) as rn
    FROM despesas
)
DELETE FROM despesas d USING ranked r
WHERE d.id = r.id AND r.rn > 1;

-- Cria a constraint UNIQUE definitiva
ALTER TABLE despesas ADD CONSTRAINT despesas_dedupe_hash_unique UNIQUE (dedupe_hash);
