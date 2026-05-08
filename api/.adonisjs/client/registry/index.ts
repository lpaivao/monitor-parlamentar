/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'parlamentares.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/parlamentares',
    tokens: [{"old":"/api/parlamentares","type":0,"val":"api","end":""},{"old":"/api/parlamentares","type":0,"val":"parlamentares","end":""}],
    types: placeholder as Registry['parlamentares.index']['types'],
  },
  'parlamentares.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/parlamentares/:id',
    tokens: [{"old":"/api/parlamentares/:id","type":0,"val":"api","end":""},{"old":"/api/parlamentares/:id","type":0,"val":"parlamentares","end":""},{"old":"/api/parlamentares/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['parlamentares.show']['types'],
  },
  'despesas.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/despesas',
    tokens: [{"old":"/api/despesas","type":0,"val":"api","end":""},{"old":"/api/despesas","type":0,"val":"despesas","end":""}],
    types: placeholder as Registry['despesas.index']['types'],
  },
  'despesas.by_parlamentar': {
    methods: ["GET","HEAD"],
    pattern: '/api/despesas/:parlamentarId',
    tokens: [{"old":"/api/despesas/:parlamentarId","type":0,"val":"api","end":""},{"old":"/api/despesas/:parlamentarId","type":0,"val":"despesas","end":""},{"old":"/api/despesas/:parlamentarId","type":1,"val":"parlamentarId","end":""}],
    types: placeholder as Registry['despesas.by_parlamentar']['types'],
  },
  'ranking.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/ranking',
    tokens: [{"old":"/api/ranking","type":0,"val":"api","end":""},{"old":"/api/ranking","type":0,"val":"ranking","end":""}],
    types: placeholder as Registry['ranking.index']['types'],
  },
  'ranking.por_categoria': {
    methods: ["GET","HEAD"],
    pattern: '/api/ranking/categorias',
    tokens: [{"old":"/api/ranking/categorias","type":0,"val":"api","end":""},{"old":"/api/ranking/categorias","type":0,"val":"ranking","end":""},{"old":"/api/ranking/categorias","type":0,"val":"categorias","end":""}],
    types: placeholder as Registry['ranking.por_categoria']['types'],
  },
  'ranking.por_partido': {
    methods: ["GET","HEAD"],
    pattern: '/api/ranking/partidos',
    tokens: [{"old":"/api/ranking/partidos","type":0,"val":"api","end":""},{"old":"/api/ranking/partidos","type":0,"val":"ranking","end":""},{"old":"/api/ranking/partidos","type":0,"val":"partidos","end":""}],
    types: placeholder as Registry['ranking.por_partido']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
