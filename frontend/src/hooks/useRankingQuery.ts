import { useQuery } from "@tanstack/react-query";
import { getRanking } from "../services/api";
import { queryKeys } from "../services/queryKeys";

export function useRankingQuery(params: {
  ano?: number;
  partido?: string;
  uf?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.ranking(params),
    queryFn: () => getRanking(params),
  });
}
