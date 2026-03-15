import router from '@adonisjs/core/services/router'

const ParlamentaresController = () => import('#controllers/parlamentares_controller')
const DespesasController       = () => import('#controllers/despesas_controller')
const RankingController        = () => import('#controllers/ranking_controller')

// ── Parlamentares ─────────────────────────────────────────────────────────────
// GET /api/parlamentares          lista com filtros e paginação
// GET /api/parlamentares/:id      detalhes + total de gastos
router.group(() => {
  router.get('/parlamentares',     [ParlamentaresController, 'index'])
  router.get('/parlamentares/:id', [ParlamentaresController, 'show'])

  // ── Despesas ───────────────────────────────────────────────────────────────
  // GET /api/despesas              lista geral com filtros
  // GET /api/despesas/:parlamentarId  despesas de um parlamentar
  router.get('/despesas',                        [DespesasController, 'index'])
  router.get('/despesas/:parlamentarId',         [DespesasController, 'byParlamentar'])

  // ── Rankings ──────────────────────────────────────────────────────────────
  // GET /api/ranking               top gastadores
  // GET /api/ranking/categorias    gasto total por categoria
  // GET /api/ranking/partidos      gasto total por partido
  router.get('/ranking',             [RankingController, 'index'])
  router.get('/ranking/categorias',  [RankingController, 'porCategoria'])
  router.get('/ranking/partidos',    [RankingController, 'porPartido'])

}).prefix('/api')
