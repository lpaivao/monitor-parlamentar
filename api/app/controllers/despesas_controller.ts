import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class DespesasController {
  /**
   * GET /api/despesas
   *
   * Query params:
   *   ano, mes, tipo_despesa, fornecedor
   *   partido, uf, casa
   *   page, perPage
   */
  async index({ request, response }: HttpContext) {
    const {
      ano,
      mes,
      tipo_despesa,
      fornecedor,
      partido,
      uf,
      casa,
      page    = 1,
      perPage = 50,
    } = request.qs()

    const limit = Math.min(Number(perPage), 100)

    const query = db
      .from('despesas as d')
      .join('parlamentares as p', 'p.id', 'd.parlamentar_id')
      .select(
        'd.id',
        'd.parlamentar_id',
        'p.nome as parlamentar_nome',
        'p.sigla_partido',
        'p.sigla_uf',
        'p.casa',
        'd.ano',
        'd.mes',
        'd.tipo_despesa',
        'd.fornecedor',
        'd.cnpj_cpf',
        'd.valor_documento',
        'd.valor_liquido',
        'd.numero_documento',
        'd.url_documento',
        'd.data_emissao'
      )
      .orderBy('d.valor_liquido', 'desc')

    if (ano)          query.where('d.ano', Number(ano))
    if (mes)          query.where('d.mes', Number(mes))
    if (tipo_despesa) query.whereILike('d.tipo_despesa', `%${tipo_despesa}%`)
    if (fornecedor)   query.whereILike('d.fornecedor', `%${fornecedor}%`)
    if (partido)      query.where('p.sigla_partido', partido.toUpperCase())
    if (uf)           query.where('p.sigla_uf', uf.toUpperCase())
    if (casa)         query.where('p.casa', casa)

    const result = await query.paginate(Number(page), limit)
    return response.ok(result)
  }

  /**
   * GET /api/despesas/:parlamentarId
   *
   * Query params: ano, mes, page, perPage
   */
  async byParlamentar({ params, request, response }: HttpContext) {
    const { ano, mes, page = 1, perPage = 50 } = request.qs()
    const limit = Math.min(Number(perPage), 100)

    const query = db
      .from('despesas')
      .where('parlamentar_id', params.parlamentarId)
      .orderBy('data_emissao', 'desc')
      .orderBy('valor_liquido', 'desc')

    if (ano) query.where('ano', Number(ano))
    if (mes) query.where('mes', Number(mes))

    const result = await query.paginate(Number(page), limit)
    return response.ok(result)
  }
}
