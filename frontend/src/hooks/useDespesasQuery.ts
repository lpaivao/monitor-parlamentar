import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getDespesas } from "../services/api";
import type { Filters } from "../types";

type DespesasFilters = Filters & {
  tipo_despesa?: string;
  fornecedor?: string;
  mes?: number;
};

export function useDespesasQuery(filters: DespesasFilters) {
  return useQuery({
    queryKey: ["despesas", filters] as const,
    queryFn: () => getDespesas(filters),
    placeholderData: keepPreviousData,
  });
}
