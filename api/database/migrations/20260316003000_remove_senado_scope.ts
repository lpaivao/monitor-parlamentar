import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      await db.rawQuery("DELETE FROM sync_logs WHERE casa = 'senado'")
      await db.rawQuery("DELETE FROM parlamentares WHERE casa = 'senado'")

      await db.rawQuery(`
        ALTER TABLE parlamentares
        ADD CONSTRAINT parlamentares_casa_camara_only
        CHECK (casa = 'camara')
      `)

      await db.rawQuery(`
        ALTER TABLE sync_logs
        ADD CONSTRAINT sync_logs_casa_camara_only
        CHECK (casa = 'camara')
      `)
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery(
        'ALTER TABLE sync_logs DROP CONSTRAINT IF EXISTS sync_logs_casa_camara_only'
      )
      await db.rawQuery(
        'ALTER TABLE parlamentares DROP CONSTRAINT IF EXISTS parlamentares_casa_camara_only'
      )
    })
  }
}
