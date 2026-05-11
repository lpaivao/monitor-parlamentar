-- V003: Remove escopo do Senado — limpa dados e adiciona constraints de validação
-- Equivalente à migration AdonisJS 20260316003000_remove_senado_scope
-- (já aplicada em instâncias existentes; segura para re-executar por causa dos IF NOT EXISTS)

-- Limpa registros do Senado (no-op se já foram removidos)
DELETE FROM sync_logs   WHERE casa = 'senado';
DELETE FROM parlamentares WHERE casa = 'senado';

-- Garante constraints de domínio (usa IF NOT EXISTS via DO block para idempotência)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'parlamentares_casa_camara_only'
          AND conrelid = 'parlamentares'::regclass
    ) THEN
        ALTER TABLE parlamentares
        ADD CONSTRAINT parlamentares_casa_camara_only CHECK (casa = 'camara');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'sync_logs_casa_camara_only'
          AND conrelid = 'sync_logs'::regclass
    ) THEN
        ALTER TABLE sync_logs
        ADD CONSTRAINT sync_logs_casa_camara_only CHECK (casa = 'camara');
    END IF;
END;
$$;
