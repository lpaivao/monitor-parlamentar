import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class RankingController {
  /**
   * GET /api/ranking
   *
   * Top parlamentares por total gasto no ano.
   * Query params: ano, casa, partido, uf, limit (max 100)
   */
  async index({ request, response }: HttpContext) {
    const {
      ano     = new Date().getFullYear(),
      casa,
      partido,
      uf,
      limit   = 50,
    } = request.qs()

    const cap = Math.min(Number(limit), 100)

    const query = db
      .from('parlamentares as p')
      .join('despesas as d', 'd.parlamentar_id', 'p.id')
      .select(
        'p.id',
        'p.nome',
        'p.sigla_partido',
        'p.sigla_uf',
        'p.foto_url',
        'p.casa'
      )
      .sum('d.valor_liquido as total_gasto')
      .count('d.id as qtd_despesas')
      .where('d.ano', Number(ano))
      .groupBy('p.id', 'p.nome', 'p.sigla_partido', 'p.sigla_uf', 'p.foto_url', 'p.casa')
      .orderBy('total_gasto', 'desc')
      .limit(cap)

    if (casa)    query.where('p.casa', casa)
    if (partido) query.where('p.sigla_partido', partido.toUpperCase())
    if (uf)      query.where('p.sigla_uf', uf.toUpperCase())

    const rows = await query
    return response.ok({
      ano:  Number(ano),
      data: rows.map((r, i) => ({
        posicao:      i + 1,
        id:           r.id,
        nome:         r.nome,
        sigla_partido: r.sigla_partido,
        sigla_uf:     r.sigla_uf,
        foto_url:     r.foto_url,
        casa:         r.casa,
        total_gasto:  Number(r.total_gasto),
        qtd_despesas: Number(r.qtd_despesas),
      })),
    })
  }

  /**
   * GET /api/ranking/categorias
   *
   * Total gasto por categoria de despesa.
   * Query params: ano, casa, partido
   */
  async porCategoria({ request, response }: HttpContext) {
    const { ano = new Date().getFullYear(), casa, partido } = request.qs()

    const query = db
      .from('despesas as d')
      .join('parlamentares as p', 'p.id', 'd.parlamentar_id')
      .select('d.tipo_despesa')
      .sum('d.valor_liquido as total')
      .count('d.id as qtd')
      .where('d.ano', Number(ano))
      .whereNotNull('d.tipo_despesa')
      .groupBy('d.tipo_despesa')
      .orderBy('total', 'desc')

    if (casa)    query.where('p.casa', casa)
    if (partido) query.where('p.sigla_partido', partido.toUpperCase())

    const rows = await query
    return response.ok({
      ano:  Number(ano),
      data: rows.map((r) => ({
        categoria:    r.tipo_despesa,
        total:        Number(r.total),
        qtd_despesas: Number(r.qtd),
      })),
    })
  }

  /**
   * GET /api/ranking/partidos
   *
   * Total gasto por partido.
   * Query params: ano, casa
   */
  async porPartido({ request, response }: HttpContext) {
    const { ano = new Date().getFullYear(), casa } = request.qs()

    const query = db
      .from('despesas as d')
      .join('parlamentares as p', 'p.id', 'd.parlamentar_id')
      .select('p.sigla_partido')
      .sum('d.valor_liquido as total')
      .count('distinct p.id as qtd_parlamentares')
      .where('d.ano', Number(ano))
      .whereNotNull('p.sigla_partido')
      .groupBy('p.sigla_partido')
      .orderBy('total', 'desc')

    if (casa) query.where('p.casa', casa)

    const rows = await query
    return response.ok({
      ano:  Number(ano),
      data: rows.map((r) => ({
        partido:            r.sigla_partido,
        total:              Number(r.total),
        qtd_parlamentares:  Number(r.qtd_parlamentares),
        media_por_parlamentar: Number(r.total) / (Number(r.qtd_parlamentares) || 1),
      })),
    })
  }
}
