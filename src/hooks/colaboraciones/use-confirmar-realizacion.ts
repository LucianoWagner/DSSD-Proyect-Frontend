"use client";

/**
 * Hook para confirmar realización de un compromiso
 * POST /api/v1/ofertas/{oferta_id}/confirmar-realizacion
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { createApiError, getErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";

/**
 * Confirmar que se completó un compromiso
 * Solo el creador de la oferta puede confirmar
 * Precondiciones:
 * - La oferta debe estar en estado "aceptada"
 * - El pedido debe estar en estado "COMPROMETIDO"
 *
 * Efectos:
 * - Cambia el estado del pedido a "COMPLETADO"
 */
export function useConfirmarRealizacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ofertaId: string) => {
      const { data, error, response } = await apiClient.POST(
        "/api/v1/ofertas/{oferta_id}/confirmar-realizacion",
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

      return data;
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["ofertas", "mis-compromisos"] });
      queryClient.invalidateQueries({ queryKey: ["ofertas", "activos-count"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });

      toast.success("Compromiso completado", {
        description: "Has confirmado que completaste este compromiso exitosamente",
        duration: 5000,
      });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error("Error al confirmar realización", {
        description: message,
        duration: 5000,
      });
    },
  });
}

/**
 * Hook para verificar si un compromiso puede ser confirmado
 * Útil para mostrar/ocultar el botón de confirmación
 */
export function canConfirmRealizacion(
  estadoOferta: string,
  estadoPedido: string
): boolean {
  return estadoOferta === "aceptada" && estadoPedido === "COMPROMETIDO";
}
