"use client";

/**
 * Hook para actualizar una oferta pendiente
 * PATCH /api/v1/ofertas/{oferta_id}
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { createApiError, getErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";

interface UpdateOfertaRequest {
  descripcion?: string;
  monto_ofrecido?: number;
}

interface UpdateOfertaParams {
  ofertaId: string;
  data: UpdateOfertaRequest;
}

export function useUpdateOferta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ofertaId, data }: UpdateOfertaParams) => {
      const { data: responseData, error, response } = await apiClient.PATCH(
        "/api/v1/ofertas/{oferta_id}",
        {
          params: {
            path: {
              oferta_id: ofertaId,
            },
          },
          body: data,
        }
      );

      if (error) {
        throw createApiError(error, response.status ?? 500, response);
      }

      return responseData;
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["ofertas", "mis-ofertas"] });
      queryClient.invalidateQueries({ queryKey: ["ofertas", "activos-count"] });

      toast.success("Oferta actualizada con éxito", {
        description: "Los cambios se han guardado correctamente",
      });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error("Error al actualizar oferta", {
        description: message,
      });
    },
  });
}
