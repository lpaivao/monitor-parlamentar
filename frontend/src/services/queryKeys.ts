export const queryKeys = {
  parlamentares: (params: {
    nome?: string;
    partido?: string;
    uf?: string;
    ano?: number;
    page?: number;
    perPage?: number;
  }) => ["parlamentares", params] as const,
  parlamentar: (id: number, ano?: number) =>
    ["parlamentar", id, { ano }] as const,
  despesasParlamentar: (
    parlamentarId: number,
    params: { ano?: number; mes?: number; page?: number; perPage?: number },
  ) => ["despesasParlamentar", parlamentarId, params] as const,
  ranking: (params: {
    ano?: number;
    partido?: string;
    uf?: string;
    limit?: number;
  }) => ["ranking", params] as const,
  rankingPartidos: (params: { ano?: number }) =>
    ["rankingPartidos", params] as const,
  rankingCategorias: (params: { ano?: number; partido?: string }) =>
    ["rankingCategorias", params] as const,
};
