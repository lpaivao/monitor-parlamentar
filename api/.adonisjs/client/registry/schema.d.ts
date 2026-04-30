/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'parlamentares.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/parlamentares'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/parlamentares_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/parlamentares_controller').default['index']>>>
    }
  }
  'parlamentares.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/parlamentares/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/parlamentares_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/parlamentares_controller').default['show']>>>
    }
  }
  'despesas.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/despesas'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/despesas_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/despesas_controller').default['index']>>>
    }
  }
  'despesas.by_parlamentar': {
    methods: ["GET","HEAD"]
    pattern: '/api/despesas/:parlamentarId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { parlamentarId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/despesas_controller').default['byParlamentar']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/despesas_controller').default['byParlamentar']>>>
    }
  }
  'ranking.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/ranking'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/ranking_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/ranking_controller').default['index']>>>
    }
  }
  'ranking.por_categoria': {
    methods: ["GET","HEAD"]
    pattern: '/api/ranking/categorias'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/ranking_controller').default['porCategoria']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/ranking_controller').default['porCategoria']>>>
    }
  }
  'ranking.por_partido': {
    methods: ["GET","HEAD"]
    pattern: '/api/ranking/partidos'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/ranking_controller').default['porPartido']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/ranking_controller').default['porPartido']>>>
    }
  }
}
