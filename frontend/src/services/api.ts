import type {
  ApiPaginated,
  Despesa,
  Filters,
  Paginated,
  Parlamentar,
  ParlamentarDetalhe,
  RankingCategoria,
  RankingItem,
  RankingPartido,
  RemuneracaoAnual,
} from "../types";

const envApiUrl = (import.meta.env.VITE_API_URL ?? "").trim();
const BASE = envApiUrl || "/api";

async function get<T>(
  path: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  }

  const url = `${BASE}${path}${qs.size ? "?" + qs : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status} — ${url}`);
  return res.json();
}

function normalizePaginated<T>(payload: ApiPaginated<T>): Paginated<T> {
  const meta = payload.meta ?? {};

  return {
    data: payload.data ?? [],
    meta: {
      total: Number(meta.total ?? 0),
      perPage: Number(meta.perPage ?? meta.per_page ?? 0),
      currentPage: Number(meta.currentPage ?? meta.current_page ?? 1),
      lastPage: Number(meta.lastPage ?? meta.last_page ?? 1),
      firstPage: Number(meta.firstPage ?? meta.first_page ?? 1),
    },
  };
}

// ── Parlamentares ─────────────────────────────────────────
export async function getParlamentares(
  filters: Filters,
): Promise<Paginated<Parlamentar>> {
  const response = await get<ApiPaginated<Parlamentar>>(
    "/parlamentares",
    filters as Record<string, unknown>,
  );

  return normalizePaginated(response);
}

export function getParlamentar(id: number, ano?: number) {
  return get<ParlamentarDetalhe>(`/parlamentares/${id}`, ano ? { ano } : {});
}

// ── Despesas ──────────────────────────────────────────────
export async function getDespesas(
  filters: Filters & {
    tipo_despesa?: string;
    fornecedor?: string;
    mes?: number;
  },
): Promise<Paginated<Despesa>> {
  const response = await get<ApiPaginated<Despesa>>(
    "/despesas",
    filters as Record<string, unknown>,
  );

  return normalizePaginated(response);
}

export async function getDespesasParlamentar(
  parlamentarId: number,
  params: { ano?: number; mes?: number; page?: number; perPage?: number },
): Promise<Paginated<Despesa>> {
  const response = await get<ApiPaginated<Despesa>>(
    `/despesas/${parlamentarId}`,
    params as Record<string, unknown>,
  );

  return normalizePaginated(response);
}

// ── Ranking ───────────────────────────────────────────────
export function getRanking(params: {
  ano?: number;
  partido?: string;
  uf?: string;
  limit?: number;
}) {
  return get<{ ano: number; data: RankingItem[] }>(
    "/ranking",
    params as Record<string, unknown>,
  );
}

export function getRankingCategorias(params: {
  ano?: number;
  partido?: string;
  limit?: number;
}) {
  return get<{ ano: number; data: RankingCategoria[] }>(
    "/ranking/categorias",
    params as Record<string, unknown>,
  );
}

export function getRankingPartidos(params: { ano?: number; limit?: number }) {
  return get<{ ano: number; data: RankingPartido[] }>(
    "/ranking/partidos",
    params as Record<string, unknown>,
  );
}

// ── Remuneração ───────────────────────────────────────────
export function getRemuneracao(apiId: number, ano?: number) {
  return get<RemuneracaoAnual>(
    `/parlamentares/${apiId}/remuneracao`,
    ano ? { ano } : {},
  );
}
