"use client";

import { useQuery } from "@tanstack/react-query";
import type { ObservacionStats, ObservacionFilters } from "@/types/observaciones";
import { useListObservaciones } from "./use-list-observaciones";

/**
 * Hook to get observation statistics
 * Calculates stats from the observations list
 *
 * @returns React Query result with stats
 */
export function useObservacionStats(filters?: Partial<Pick<ObservacionFilters, "proyecto_id" | "council_user_id">>) {
  const baseFilters = filters ?? {};

  // Fetch counts with optional filters
  const { data: allData, isLoading: isLoadingAll } = useListObservaciones({ page_size: 1, ...baseFilters });
  const { data: pendientesData, isLoading: isLoadingPendientes } = useListObservaciones({
    estado: "pendiente",
    page_size: 1,
    ...baseFilters,
  });
  const { data: vencidasData, isLoading: isLoadingVencidas } = useListObservaciones({
    estado: "vencida",
    page_size: 1,
    ...baseFilters,
  });
  const { data: resueltasData, isLoading: isLoadingResueltas } = useListObservaciones({
    estado: "resuelta",
    page_size: 1,
    ...baseFilters,
  });

  return useQuery({
    queryKey: ["observaciones", "stats", baseFilters],
    queryFn: async (): Promise<ObservacionStats> => {
      return {
        total: allData?.total ?? 0,
        pendientes: pendientesData?.total ?? 0,
        vencidas: vencidasData?.total ?? 0,
        resueltas: resueltasData?.total ?? 0,
      };
    },
    enabled: !isLoadingAll && !isLoadingPendientes && !isLoadingVencidas && !isLoadingResueltas,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
