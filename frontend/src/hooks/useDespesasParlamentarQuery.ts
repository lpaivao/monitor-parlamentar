import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getDespesasParlamentar } from "../services/api";
import { queryKeys } from "../services/queryKeys";

export function useDespesasParlamentarQuery(
  parlamentarId: number,
  params: { ano?: number; mes?: number; page?: number; perPage?: number },
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.despesasParlamentar(parlamentarId, params),
    queryFn: () => getDespesasParlamentar(parlamentarId, params),
    enabled: enabled && Number.isFinite(parlamentarId),
    placeholderData: keepPreviousData,
  });
}
