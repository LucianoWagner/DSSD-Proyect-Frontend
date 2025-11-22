"use client";

/**
 * Hook para crear una oferta en un pedido
 * POST /api/v1/pedidos/{pedido_id}/ofertas
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { createApiError, getErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";
import type { CreateOfertaRequest, Oferta, OfertaWithUser } from "@/types/colaboraciones";

interface CreateOfertaParams {
  pedidoId: string;
  data: CreateOfertaRequest;
}

/**
 * Crear oferta para un pedido
 */
export function useCreateOferta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pedidoId, data }: CreateOfertaParams): Promise<Oferta> => {
      const { data: responseData, error, response } = await apiClient.POST(
        "/api/v1/pedidos/{pedido_id}/ofertas",
        {
          params: {
            path: {
              pedido_id: pedidoId,
            },
          },
          body: data,
        }
      );

      if (error) {
        throw createApiError(error, response.status ?? 500, response);
      }

      return responseData as Oferta;
    },
    onSuccess: (data, variables) => {
      // Invalidate queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["ofertas", "mis-ofertas"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["pedidos", variables.pedidoId, "ofertas"] });

      toast.success("Oferta enviada con éxito", {
        description: "El dueño del proyecto revisará tu oferta pronto",
      });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error("Error al enviar oferta", {
        description: message,
      });
    },
  });
}

/**
 * Hook para obtener ofertas de un pedido
 * GET /api/v1/pedidos/{pedido_id}/ofertas
 * Solo el dueño del proyecto puede ver las ofertas
 */
export function useGetPedidoOfertas(pedidoId: string | null) {
  return useQuery<OfertaWithUser[]>({
    queryKey: ["pedidos", pedidoId, "ofertas"],
    enabled: Boolean(pedidoId),
    staleTime: 1000 * 60,
    queryFn: async () => {
      if (!pedidoId) {
        return [];
      }

      const { data, error, response } = await apiClient.GET(
        "/api/v1/pedidos/{pedido_id}/ofertas",
        {
          params: {
            path: {
              pedido_id: pedidoId,
            },
          },
        }
      );

      if (error) {
        throw createApiError(error, response.status ?? 500, response);
      }

      return (data ?? []) as OfertaWithUser[];
    },
  });
}

/**
 * Hook para evaluar una oferta (aceptar o rechazar) usando Bonita BPM
 * POST /api/v1/ofertas/{oferta_id}/evaluate
 * Solo el dueño del proyecto puede evaluar
 *
 * Nuevo flujo con Bonita:
 * Frontend → Proxy API → Bonita BPM → Cloud API accept/reject → Frontend
 */
export function useEvaluateOferta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ofertaId,
      decision
    }: {
      ofertaId: string;
      decision: "accept" | "reject"
    }) => {
      const { data, error, response } = await apiClient.POST(
        "/api/v1/ofertas/{oferta_id}/evaluate",
        {
          params: {
            path: {
              oferta_id: ofertaId,
            },
          },
          body: {
            decision,
          },
        }
      );

      if (error) {
        throw createApiError(error, response.status ?? 500, response);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["ofertas"] });

      const actionText = variables.decision === "accept" ? "aceptada" : "rechazada";
      toast.success(`Oferta ${actionText}`, {
        description: `La oferta ha sido ${actionText} exitosamente`,
      });
    },
    onError: (error) => {
      const message = getErrorMessage(error);

      // Manejo de errores específicos de Bonita
      let errorDescription = message;
      if (message.includes("not associated with a Bonita process")) {
        errorDescription = "Este proyecto no está asociado a un proceso Bonita";
      } else if (message.includes("Only the project owner")) {
        errorDescription = "Solo el dueño del proyecto puede evaluar ofertas";
      } else if (message.includes("No pending")) {
        errorDescription = "No hay una tarea pendiente de evaluación en Bonita para este proyecto";
      }

      toast.error("Error al evaluar oferta", {
        description: errorDescription,
      });
    },
  });
}

/**
 * Hook para aceptar una oferta
 * POST /api/v1/ofertas/{oferta_id}/accept
 * Solo el dueño del proyecto puede aceptar
 *
 * @deprecated Use useEvaluateOferta instead. This endpoint bypasses Bonita workflow.
 */
export function useAcceptOferta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ofertaId: string) => {
      const { data, error, response } = await apiClient.POST(
        "/api/v1/ofertas/{oferta_id}/accept",
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
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["ofertas"] });

      toast.success("Oferta aceptada", {
        description: "La oferta ha sido aceptada exitosamente",
      });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error("Error al aceptar oferta", {
        description: message,
      });
    },
  });
}

/**
 * Hook para rechazar una oferta
 * POST /api/v1/ofertas/{oferta_id}/reject
 * Solo el dueño del proyecto puede rechazar
 *
 * @deprecated Use useEvaluateOferta instead. This endpoint bypasses Bonita workflow.
 */
export function useRejectOferta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ofertaId: string) => {
      const { data, error, response } = await apiClient.POST(
        "/api/v1/ofertas/{oferta_id}/reject",
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
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["ofertas"] });

      toast.success("Oferta rechazada", {
        description: "La oferta ha sido rechazada",
      });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error("Error al rechazar oferta", {
        description: message,
      });
    },
  });
}
