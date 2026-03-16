import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'despesas'

  private dedupeExpr = `md5(
    coalesce(parlamentar_id::text, '') || '||' ||
    coalesce(ano::text, '') || '||' ||
    coalesce(mes::text, '') || '||' ||
    coalesce(tipo_despesa, '') || '||' ||
    coalesce(fornecedor, '') || '||' ||
    coalesce(cnpj_cpf, '') || '||' ||
    coalesce(valor_documento::text, '') || '||' ||
    coalesce(valor_liquido::text, '') || '||' ||
    coalesce(numero_documento, '') || '||' ||
    coalesce(url_documento, '') || '||' ||
    coalesce((data_emissao - DATE '1970-01-01')::text, '')
  )`

  async up() {
    // Remove duplicatas historicas mantendo o menor id por chave de negocio.
    this.defer(async (db) => {
      await db.rawQuery(`
        WITH ranked AS (
          SELECT
            id,
            row_number() OVER (
              PARTITION BY ${this.dedupeExpr}
              ORDER BY id
            ) AS rn
          FROM despesas
        )
        DELETE FROM despesas d
        USING ranked r
        WHERE d.id = r.id
          AND r.rn > 1
      `)

      await db.rawQuery(`
        CREATE UNIQUE INDEX IF NOT EXISTS despesas_dedupe_key_unique
        ON despesas ((${this.dedupeExpr}))
      `)
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery('DROP INDEX IF EXISTS despesas_dedupe_key_unique')
    })
  }
}
