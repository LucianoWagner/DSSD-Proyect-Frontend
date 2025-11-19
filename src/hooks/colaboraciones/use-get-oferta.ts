"use client";

/**
 * Hook para obtener detalles de una oferta específica
 * GET /api/v1/ofertas/{oferta_id}
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { createApiError } from "@/lib/api-error";
import type { Oferta } from "@/types/colaboraciones";

export function useGetOferta(ofertaId: string | null) {
  return useQuery({
    queryKey: ["ofertas", ofertaId],
    queryFn: async (): Promise<Oferta> => {
      if (!ofertaId) {
        throw new Error("Oferta ID is required");
      }

      const { data, error, response } = await apiClient.GET(
        "/api/v1/ofertas/{oferta_id}",
        {
          params: {
            path: {
              oferta_id: ofertaId,
            },
          },
        }
      );

      if (error) {
        throw createApiError(error, response.status ?? 500, response);
      }

      return data as Oferta;
    },
    enabled: !!ofertaId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
