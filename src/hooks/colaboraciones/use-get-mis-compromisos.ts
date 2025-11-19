"use client";

/**
 * Hook para obtener mis ofertas (ofertas enviadas)
 * GET /api/v1/ofertas/mis-ofertas
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { createApiError } from "@/lib/api-error";
import type {
  CompromisoWithPedido,
  CompromisosFilters,
  EstadoPedido,
} from "@/types/colaboraciones";

/**
 * Obtener mis ofertas (ofertas que he enviado)
 * Filtrable por estado de la oferta
 */
export function useGetMisCompromisos(filters: CompromisosFilters = {}) {
  return useQuery({
    queryKey: ["ofertas", "mis-ofertas", filters],
    queryFn: async (): Promise<CompromisoWithPedido[]> => {
      // Only include estado_oferta if it has a value
      const queryParams: { estado_oferta?: string } = {};
      if (filters.estado_oferta) {
        queryParams.estado_oferta = filters.estado_oferta;
      }

      const { data, error, response } = await apiClient.GET(
        "/api/v1/ofertas/mis-ofertas",
        {
          params: {
            query: queryParams,
          },
        }
      );

      if (error) {
        throw createApiError(error, response.status ?? 500, response);
      }

      return data as CompromisoWithPedido[];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 3, // Refetch every 3 minutes
  });
}

/**
 * Hook para obtener estadísticas de mis ofertas
 * Útil para badges y contadores
 */
export function useGetCompromisosStats() {
  const { data: allCompromisos } = useGetMisCompromisos();

  if (!allCompromisos) {
    return {
      total: 0,
      pendientes: 0,
      aceptadas: 0,
      rechazadas: 0,
    };
  }

  const stats = {
    total: allCompromisos.length,
    pendientes: allCompromisos.filter((c) => c.estado === "pendiente").length,
    aceptadas: allCompromisos.filter((c) => c.estado === "aceptada").length,
    rechazadas: allCompromisos.filter((c) => c.estado === "rechazada").length,
  };

  return stats;
}

/**
 * Hook para filtrar compromisos por estado
 * Usa filtrado server-side para estado_oferta y client-side para estado_pedido
 */
export function useFilteredCompromisos(
  estadoPedido?: EstadoPedido,
  estadoOferta?: "pendiente" | "aceptada" | "rechazada"
) {
  // Pass estado_oferta to the API for server-side filtering
  const { data: allCompromisos, ...rest } = useGetMisCompromisos({
    estado_oferta: estadoOferta,
  });

  if (!allCompromisos) {
    return { data: [], ...rest };
  }

  let filtered = allCompromisos;

  // Filter by pedido estado (client-side only if needed)
  if (estadoPedido) {
    filtered = filtered.filter((c) => c.pedido.estado === estadoPedido);
  }

  return { data: filtered, ...rest };
}

/**
 * Hook para obtener count de ofertas aceptadas activas
 * Útil para badge en sidebar
 */
export function useCompromisosActivosCount() {
  return useQuery({
    queryKey: ["ofertas", "activos-count"],
    queryFn: async (): Promise<number> => {
      const { data, error, response } = await apiClient.GET(
        "/api/v1/ofertas/mis-ofertas",
        {
          params: {
            query: {
              estado_oferta: "aceptada",
            },
          },
        }
      );

      if (error) {
        throw createApiError(error, response.status ?? 500, response);
      }

      const compromisos = data as CompromisoWithPedido[];

      // Count ofertas aceptadas que aún no están completadas
      return compromisos.filter(
        (c) => c.estado === "aceptada" && c.pedido.estado === "COMPROMETIDO"
      ).length;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}
