import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Despesa from './despesa.js'

export default class Parlamentar extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare apiId: number

  @column()
  declare nome: string

  @column()
  declare siglaPartido: string | null

  @column()
  declare siglaUf: string | null

  @column()
  declare fotoUrl: string | null

  @column()
  declare casa: 'camara' | 'senado'

  @column()
  declare legislatura: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Despesa)
  declare despesas: HasMany<typeof Despesa>
}
