import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'parlamentares.index': { paramsTuple?: []; params?: {} }
    'parlamentares.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'despesas.index': { paramsTuple?: []; params?: {} }
    'despesas.by_parlamentar': { paramsTuple: [ParamValue]; params: {'parlamentarId': ParamValue} }
    'ranking.index': { paramsTuple?: []; params?: {} }
    'ranking.por_categoria': { paramsTuple?: []; params?: {} }
    'ranking.por_partido': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'parlamentares.index': { paramsTuple?: []; params?: {} }
    'parlamentares.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'despesas.index': { paramsTuple?: []; params?: {} }
    'despesas.by_parlamentar': { paramsTuple: [ParamValue]; params: {'parlamentarId': ParamValue} }
    'ranking.index': { paramsTuple?: []; params?: {} }
    'ranking.por_categoria': { paramsTuple?: []; params?: {} }
    'ranking.por_partido': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'parlamentares.index': { paramsTuple?: []; params?: {} }
    'parlamentares.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'despesas.index': { paramsTuple?: []; params?: {} }
    'despesas.by_parlamentar': { paramsTuple: [ParamValue]; params: {'parlamentarId': ParamValue} }
    'ranking.index': { paramsTuple?: []; params?: {} }
    'ranking.por_categoria': { paramsTuple?: []; params?: {} }
    'ranking.por_partido': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}