import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getParlamentares } from "../services/api";
import { queryKeys } from "../services/queryKeys";
import type { Filters } from "../types";

export function useParlamentaresQuery(filters: Filters) {
  return useQuery({
    queryKey: queryKeys.parlamentares(filters),
    queryFn: () => getParlamentares(filters),
    placeholderData: keepPreviousData,
  });
}
