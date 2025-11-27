"use client";

import { useQuery } from "@tanstack/react-query";
import { createApiError } from "@/lib/api-error";
import type { ObservacionListResponse, ObservacionFilters } from "@/types/observaciones";

/**
 * Hook to fetch paginated list of observations
 * Uses the global GET /api/v1/observaciones endpoint
 *
 * @param filters - Optional filters (estado, proyecto_id, search, etc)
 * @returns React Query result with observations data
 */
export function useListObservaciones(filters?: ObservacionFilters) {
  return useQuery({
    queryKey: ["observaciones", filters],
    queryFn: async (): Promise<ObservacionListResponse> => {
      // Build query params (only include defined values)
      const queryParams: Record<string, string | number> = {};

      if (filters?.page) queryParams.page = filters.page;
      if (filters?.page_size) queryParams.page_size = filters.page_size;
      if (filters?.estado) queryParams.estado = filters.estado;
      if (filters?.proyecto_id) queryParams.proyecto_id = filters.proyecto_id;
      if (filters?.council_user_id) queryParams.council_user_id = filters.council_user_id;
      if (filters?.search) queryParams.search = filters.search;
      if (filters?.fecha_desde) queryParams.fecha_desde = filters.fecha_desde;
      if (filters?.fecha_hasta) queryParams.fecha_hasta = filters.fecha_hasta;
      if (filters?.sort_by) queryParams.sort_by = filters.sort_by;
      if (filters?.sort_order) queryParams.sort_order = filters.sort_order;

      // Use fetch directly since endpoint not in openapi types yet
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

      const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/observaciones`);
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Unknown error" }));
        throw createApiError(error, response.status, response);
      }

      const data = await response.json();
      return data as ObservacionListResponse;
    },
    staleTime: 0, // Always consider stale to refetch on mount/navigation
    refetchOnMount: "always",
    retry: 1,
  });
}
