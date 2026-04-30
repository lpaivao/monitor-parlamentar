import openApiSpec from '#services/openapi'
import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return { status: 'ok' }
})

router.get('/docs/openapi.json', async ({ response }) => {
  return response.ok(openApiSpec)
})

router.get('/docs', async ({ response }) => {
  const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Monitor Parlamentar API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      html, body { margin: 0; background: #f7fafc; }
      .topbar { display: none; }
      #swagger-ui { max-width: 1200px; margin: 0 auto; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/docs/openapi.json',
        dom_id: '#swagger-ui',
      })
    </script>
  </body>
</html>`

  response.header('Content-Type', 'text/html; charset=utf-8')
  return response.send(html)
})

const ParlamentaresController = () => import('#controllers/parlamentares_controller')
const DespesasController = () => import('#controllers/despesas_controller')
const RankingController = () => import('#controllers/ranking_controller')

// ── Parlamentares ─────────────────────────────────────────────────────────────
// GET /api/parlamentares          lista com filtros e paginação
// GET /api/parlamentares/:id      detalhes + total de gastos
router
  .group(() => {
    router.get('/parlamentares', [ParlamentaresController, 'index'])
    router.get('/parlamentares/:id', [ParlamentaresController, 'show'])

    // ── Despesas ───────────────────────────────────────────────────────────────
    // GET /api/despesas              lista geral com filtros
    // GET /api/despesas/:parlamentarId  despesas de um parlamentar
    router.get('/despesas', [DespesasController, 'index'])
    router.get('/despesas/:parlamentarId', [DespesasController, 'byParlamentar'])

    // ── Rankings ──────────────────────────────────────────────────────────────
    // GET /api/ranking               top gastadores
    // GET /api/ranking/categorias    gasto total por categoria
    // GET /api/ranking/partidos      gasto total por partido
    router.get('/ranking', [RankingController, 'index'])
    router.get('/ranking/categorias', [RankingController, 'porCategoria'])
    router.get('/ranking/partidos', [RankingController, 'porPartido'])
  })
  .prefix('/api')
