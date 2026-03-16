import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // ── partidos ──────────────────────────────────────────
    this.schema.createTable('partidos', (table) => {
      table.increments('id')
      table.string('sigla', 20).notNullable().unique()
      table.string('nome', 200)
      table.timestamps(true, true)
    })

    // ── parlamentares ─────────────────────────────────────
    this.schema.createTable('parlamentares', (table) => {
      table.increments('id')
      table.integer('api_id').notNullable()
      table.string('nome', 300).notNullable()
      table.string('sigla_partido', 20)
      table.string('sigla_uf', 2)
      table.text('foto_url')
      table.enu('casa', ['camara']).notNullable()
      table.integer('legislatura').notNullable()
      table.timestamps(true, true)

      table.unique(['api_id', 'casa'])
      table.index(['sigla_partido'])
      table.index(['sigla_uf'])
      table.index(['casa'])
    })

    // ── despesas ──────────────────────────────────────────
    this.schema.createTable('despesas', (table) => {
      table.increments('id')
      table
        .integer('parlamentar_id')
        .notNullable()
        .references('id')
        .inTable('parlamentares')
        .onDelete('CASCADE')
      table.integer('ano').notNullable()
      table.integer('mes')
      table.string('tipo_despesa', 300)
      table.string('fornecedor', 300)
      table.string('cnpj_cpf', 20)
      table.decimal('valor_documento', 14, 2).defaultTo(0)
      table.decimal('valor_liquido', 14, 2).defaultTo(0)
      table.string('numero_documento', 100)
      table.text('url_documento')
      table.date('data_emissao')
      table.timestamps(true, true)

      table.index(['parlamentar_id'])
      table.index(['ano', 'mes'])
      table.index(['tipo_despesa'])
    })

    // ── sync_logs ─────────────────────────────────────────
    this.schema.createTable('sync_logs', (table) => {
      table.increments('id')
      table.enu('casa', ['camara']).notNullable()
      table.integer('ano').notNullable()
      table.enu('status', ['ok', 'erro']).notNullable()
      table.text('detalhes')
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTableIfExists('sync_logs')
    this.schema.dropTableIfExists('despesas')
    this.schema.dropTableIfExists('parlamentares')
    this.schema.dropTableIfExists('partidos')
  }
}
