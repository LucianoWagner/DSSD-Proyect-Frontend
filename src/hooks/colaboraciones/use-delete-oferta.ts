"use client";

/**
 * Hook para eliminar una oferta pendiente
 * DELETE /api/v1/ofertas/{oferta_id}
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { createApiError, getErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";

export function useDeleteOferta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ofertaId: string) => {
      const { error, response } = await apiClient.DELETE(
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

      return { success: true };
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["ofertas", "mis-ofertas"] });
      queryClient.invalidateQueries({ queryKey: ["ofertas", "activos-count"] });

      toast.success("Oferta eliminada", {
        description: "La oferta ha sido eliminada correctamente",
      });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error("Error al eliminar oferta", {
        description: message,
      });
    },
  });
}
