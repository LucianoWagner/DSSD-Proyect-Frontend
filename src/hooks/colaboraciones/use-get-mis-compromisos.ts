"use client";

/**
 * Hook para obtener mis compromisos (ofertas enviadas)
 * GET /api/v1/ofertas/mis-compromisos
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
 * Obtener mis compromisos (ofertas que he enviado)
 * Filtrable por estado del pedido
 */
export function useGetMisCompromisos(filters: CompromisosFilters = {}) {
  return useQuery({
    queryKey: ["ofertas", "mis-compromisos", filters],
    queryFn: async (): Promise<CompromisoWithPedido[]> => {
      const { data, error, response } = await apiClient.GET(
        "/api/v1/ofertas/mis-compromisos",
        {
          params: {
            query: {
              estado_pedido: filters.estado_pedido,
            },
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
 * Hook para obtener estadísticas de mis compromisos
 * Útil para badges y contadores
 */
export function useGetCompromisosStats() {
  const { data: allCompromisos } = useGetMisCompromisos();

  if (!allCompromisos) {
    return {
      total: 0,
      pendientes: 0,
      aceptadas: 0,
      completadas: 0,
      rechazadas: 0,
    };
  }

  const stats = {
    total: allCompromisos.length,
    pendientes: allCompromisos.filter((c) => c.estado === "pendiente").length,
    aceptadas: allCompromisos.filter(
      (c) => c.estado === "aceptada" && c.pedido.estado === "COMPROMETIDO"
    ).length,
    completadas: allCompromisos.filter(
      (c) => c.pedido.estado === "COMPLETADO"
    ).length,
    rechazadas: allCompromisos.filter((c) => c.estado === "rechazada").length,
  };

  return stats;
}

/**
 * Hook para filtrar compromisos por estado
 * Versión client-side del filtrado para tabs
 */
export function useFilteredCompromisos(
  estadoPedido?: EstadoPedido,
  estadoOferta?: "pendiente" | "aceptada" | "rechazada"
) {
  const { data: allCompromisos, ...rest } = useGetMisCompromisos();

  if (!allCompromisos) {
    return { data: [], ...rest };
  }

  let filtered = allCompromisos;

  // Filter by pedido estado
  if (estadoPedido) {
    filtered = filtered.filter((c) => c.pedido.estado === estadoPedido);
  }

  // Filter by oferta estado
  if (estadoOferta) {
    filtered = filtered.filter((c) => c.estado === estadoOferta);
  }

  return { data: filtered, ...rest };
}

/**
 * Hook para obtener count de compromisos pendientes de acción
 * Útil para badge en sidebar
 */
export function useCompromisosActivosCount() {
  return useQuery({
    queryKey: ["ofertas", "activos-count"],
    queryFn: async (): Promise<number> => {
      const { data, error, response } = await apiClient.GET(
        "/api/v1/ofertas/mis-compromisos",
        {
          params: {
            query: {
              estado_pedido: "COMPROMETIDO",
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
