import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class ParlamentaresController {
  /**
   * GET /api/parlamentares
   *
   * Query params:
   *   nome       – busca parcial no nome
   *   partido    – filtra por sigla do partido (ex: PT, PL)
   *   uf         – filtra por UF (ex: SP, BA)
   *   casa       – 'camara' | 'senado'
   *   legislatura
   *   page       – paginação (default 1)
   *   perPage    – itens por página (default 50, max 100)
   *   ano        – ano para calcular total_gasto
   */
  async index({ request, response }: HttpContext) {
    const {
      nome,
      partido,
      uf,
      casa,
      legislatura,
      page    = 1,
      perPage = 50,
      ano,
    } = request.qs()

    const anoFiltro = Number(ano) || new Date().getFullYear()
    const limit     = Math.min(Number(perPage), 100)

    const query = db
      .from('parlamentares as p')
      .select(
        'p.id',
        'p.api_id',
        'p.nome',
        'p.sigla_partido',
        'p.sigla_uf',
        'p.foto_url',
        'p.casa',
        'p.legislatura'
      )
      .select(
        db.raw(
          `COALESCE((
            SELECT SUM(d.valor_liquido)
            FROM despesas d
            WHERE d.parlamentar_id = p.id AND d.ano = ?
          ), 0) AS total_gasto`,
          [anoFiltro]
        )
      )

    if (nome)        query.whereILike('p.nome', `%${nome}%`)
    if (partido)     query.where('p.sigla_partido', partido.toUpperCase())
    if (uf)          query.where('p.sigla_uf', uf.toUpperCase())
    if (casa)        query.where('p.casa', casa)
    if (legislatura) query.where('p.legislatura', Number(legislatura))

    query.orderBy('total_gasto', 'desc')

    const result = await query.paginate(Number(page), limit)

    return response.ok(result)
  }

  /**
   * GET /api/parlamentares/:id
   *
   * Retorna os dados do parlamentar + resumo de gastos por categoria e por mês.
   * Query params: ano
   */
  async show({ params, request, response }: HttpContext) {
    const anoFiltro = Number(request.qs().ano) || new Date().getFullYear()

    const parlamentar = await db
      .from('parlamentares')
      .where('id', params.id)
      .first()

    if (!parlamentar) {
      return response.notFound({ message: 'Parlamentar não encontrado' })
    }

    // Total gasto no ano
    const [{ total_gasto }] = await db
      .from('despesas')
      .where('parlamentar_id', params.id)
      .where('ano', anoFiltro)
      .sum('valor_liquido as total_gasto')

    // Gasto por categoria
    const porCategoria = await db
      .from('despesas')
      .select('tipo_despesa')
      .sum('valor_liquido as total')
      .count('* as qtd')
      .where('parlamentar_id', params.id)
      .where('ano', anoFiltro)
      .groupBy('tipo_despesa')
      .orderBy('total', 'desc')

    // Gasto por mês
    const porMes = await db
      .from('despesas')
      .select('mes')
      .sum('valor_liquido as total')
      .where('parlamentar_id', params.id)
      .where('ano', anoFiltro)
      .groupBy('mes')
      .orderBy('mes', 'asc')

    return response.ok({
      ...parlamentar,
      ano:          anoFiltro,
      total_gasto:  Number(total_gasto) || 0,
      por_categoria: porCategoria.map((r) => ({ ...r, total: Number(r.total) })),
      por_mes:       porMes.map((r) => ({ ...r, total: Number(r.total) })),
    })
  }
}
