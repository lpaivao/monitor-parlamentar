import { useQuery } from "@tanstack/react-query";
import { getRankingCategorias } from "../services/api";
import { queryKeys } from "../services/queryKeys";

export function useRankingCategoriasQuery(params: {
  ano?: number;
  partido?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.rankingCategorias(params),
    queryFn: () => getRankingCategorias(params),
  });
}
