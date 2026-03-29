import { useQuery } from "@tanstack/react-query";
import { getRankingPartidos } from "../services/api";
import { queryKeys } from "../services/queryKeys";

export function useRankingPartidosQuery(params: { ano?: number }) {
  return useQuery({
    queryKey: queryKeys.rankingPartidos(params),
    queryFn: () => getRankingPartidos(params),
  });
}
