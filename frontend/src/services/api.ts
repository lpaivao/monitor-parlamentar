import type {
  Despesa,
  Filters,
  Paginated,
  Parlamentar,
  ParlamentarDetalhe,
  RankingCategoria,
  RankingItem,
  RankingPartido,
} from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3333/api";

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

// ── Parlamentares ─────────────────────────────────────────
export function getParlamentares(filters: Filters) {
  return get<Paginated<Parlamentar>>(
    "/parlamentares",
    filters as Record<string, unknown>,
  );
}

export function getParlamentar(id: number, ano?: number) {
  return get<ParlamentarDetalhe>(`/parlamentares/${id}`, ano ? { ano } : {});
}

// ── Despesas ──────────────────────────────────────────────
export function getDespesas(
  filters: Filters & {
    tipo_despesa?: string;
    fornecedor?: string;
    mes?: number;
  },
) {
  return get<Paginated<Despesa>>(
    "/despesas",
    filters as Record<string, unknown>,
  );
}

export function getDespesasParlamentar(
  parlamentarId: number,
  params: { ano?: number; mes?: number; page?: number },
) {
  return get<Paginated<Despesa>>(
    `/despesas/${parlamentarId}`,
    params as Record<string, unknown>,
  );
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
}) {
  return get<{ ano: number; data: RankingCategoria[] }>(
    "/ranking/categorias",
    params as Record<string, unknown>,
  );
}

export function getRankingPartidos(params: { ano?: number }) {
  return get<{ ano: number; data: RankingPartido[] }>(
    "/ranking/partidos",
    params as Record<string, unknown>,
  );
}
