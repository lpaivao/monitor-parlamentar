import { useQuery } from "@tanstack/react-query";
import { getParlamentar } from "../services/api";
import { queryKeys } from "../services/queryKeys";

export function useParlamentarQuery(parlamentarId: number, ano?: number) {
  return useQuery({
    queryKey: queryKeys.parlamentar(parlamentarId, ano),
    queryFn: () => getParlamentar(parlamentarId, ano),
    enabled: Number.isFinite(parlamentarId),
  });
}
