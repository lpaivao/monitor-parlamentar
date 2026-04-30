const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Monitor Parlamentar API',
    version: '1.0.0',
    description: 'Documentacao da API de parlamentares, despesas e rankings.',
  },
  servers: [
    {
      url: '/api',
      description: 'API local',
    },
  ],
  tags: [{ name: 'Parlamentares' }, { name: 'Despesas' }, { name: 'Ranking' }],
  paths: {
    '/parlamentares': {
      get: {
        tags: ['Parlamentares'],
        summary: 'Lista parlamentares com filtros e paginacao',
        parameters: [
          { name: 'nome', in: 'query', schema: { type: 'string' } },
          { name: 'partido', in: 'query', schema: { type: 'string' } },
          { name: 'uf', in: 'query', schema: { type: 'string' } },
          { name: 'legislatura', in: 'query', schema: { type: 'integer' } },
          { name: 'ano', in: 'query', schema: { type: 'integer' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'perPage', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
        ],
        responses: {
          '200': {
            description: 'Lista paginada de parlamentares',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  additionalProperties: true,
                },
              },
            },
          },
        },
      },
    },
    '/parlamentares/{id}': {
      get: {
        tags: ['Parlamentares'],
        summary: 'Detalhes de um parlamentar',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'ano', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          '200': {
            description: 'Detalhes do parlamentar e agregacoes',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  additionalProperties: true,
                },
              },
            },
          },
          '404': {
            description: 'Parlamentar nao encontrado',
          },
        },
      },
    },
    '/despesas': {
      get: {
        tags: ['Despesas'],
        summary: 'Lista despesas com filtros',
        parameters: [
          { name: 'ano', in: 'query', schema: { type: 'integer' } },
          { name: 'mes', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 12 } },
          { name: 'tipo_despesa', in: 'query', schema: { type: 'string' } },
          { name: 'fornecedor', in: 'query', schema: { type: 'string' } },
          { name: 'partido', in: 'query', schema: { type: 'string' } },
          { name: 'uf', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'perPage', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
        ],
        responses: {
          '200': {
            description: 'Lista paginada de despesas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  additionalProperties: true,
                },
              },
            },
          },
        },
      },
    },
    '/despesas/{parlamentarId}': {
      get: {
        tags: ['Despesas'],
        summary: 'Lista despesas de um parlamentar',
        parameters: [
          { name: 'parlamentarId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'ano', in: 'query', schema: { type: 'integer' } },
          { name: 'mes', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 12 } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'perPage', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
        ],
        responses: {
          '200': {
            description: 'Lista paginada de despesas por parlamentar',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  additionalProperties: true,
                },
              },
            },
          },
        },
      },
    },
    '/ranking': {
      get: {
        tags: ['Ranking'],
        summary: 'Top parlamentares por gastos',
        parameters: [
          { name: 'ano', in: 'query', schema: { type: 'integer' } },
          { name: 'partido', in: 'query', schema: { type: 'string' } },
          { name: 'uf', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
        ],
        responses: {
          '200': {
            description: 'Ranking de parlamentares',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  additionalProperties: true,
                },
              },
            },
          },
        },
      },
    },
    '/ranking/categorias': {
      get: {
        tags: ['Ranking'],
        summary: 'Ranking por categoria de despesa',
        parameters: [
          { name: 'ano', in: 'query', schema: { type: 'integer' } },
          { name: 'partido', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Ranking de categorias',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  additionalProperties: true,
                },
              },
            },
          },
        },
      },
    },
    '/ranking/partidos': {
      get: {
        tags: ['Ranking'],
        summary: 'Ranking por partidos',
        parameters: [{ name: 'ano', in: 'query', schema: { type: 'integer' } }],
        responses: {
          '200': {
            description: 'Ranking de partidos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  additionalProperties: true,
                },
              },
            },
          },
        },
      },
    },
  },
}

export default openApiSpec
