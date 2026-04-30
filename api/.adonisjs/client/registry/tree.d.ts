/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  parlamentares: {
    index: typeof routes['parlamentares.index']
    show: typeof routes['parlamentares.show']
  }
  despesas: {
    index: typeof routes['despesas.index']
    byParlamentar: typeof routes['despesas.by_parlamentar']
  }
  ranking: {
    index: typeof routes['ranking.index']
    porCategoria: typeof routes['ranking.por_categoria']
    porPartido: typeof routes['ranking.por_partido']
  }
}
