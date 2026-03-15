import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Parlamentar from './parlamentar.js'

export default class Despesa extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare parlamentarId: number

  @column()
  declare ano: number

  @column()
  declare mes: number | null

  @column()
  declare tipoDespesa: string | null

  @column()
  declare fornecedor: string | null

  @column()
  declare cnpjCpf: string | null

  @column()
  declare valorDocumento: number

  @column()
  declare valorLiquido: number

  @column()
  declare numeroDocumento: string | null

  @column()
  declare urlDocumento: string | null

  @column.date()
  declare dataEmissao: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Parlamentar)
  declare parlamentar: BelongsTo<typeof Parlamentar>
}
