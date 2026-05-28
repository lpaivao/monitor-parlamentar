import { useQuery } from "@tanstack/react-query";
import { getRemuneracao } from "../services/api";
import { queryKeys } from "../services/queryKeys";

export function useRemuneracaoQuery(apiId: number | undefined, ano?: number) {
  return useQuery({
    queryKey: queryKeys.remuneracao(apiId ?? 0, ano),
    queryFn: () => getRemuneracao(apiId!, ano),
    enabled: !!apiId && Number.isFinite(apiId),
    staleTime: 1000 * 60 * 60 * 24, // matches server 24h cache
  });
}
