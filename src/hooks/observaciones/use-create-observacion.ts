"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createApiError } from "@/lib/api-error";
import type { Observacion } from "@/types/observaciones";

export interface CreateObservacionRequest {
  proyecto_id: string;
  descripcion: string;
}

/**
 * Hook to create an observation for a project
 * Only COUNCIL members can create observations
 *
 * @returns React Query mutation
 */
export function useCreateObservacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateObservacionRequest): Promise<Observacion> => {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/projects/${data.proyecto_id}/observaciones`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            descripcion: data.descripcion,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Unknown error" }));
        throw createApiError(error, response.status, response);
      }

      const result = await response.json();
      return result as Observacion;
    },
    onSuccess: (data) => {
      // Invalidate any observation list (with filters) to refresh
      queryClient.invalidateQueries({ queryKey: ["observaciones"], exact: false });
      // Invalidate project-related caches
      queryClient.invalidateQueries({ queryKey: ["projects", data.proyecto_id] });
      queryClient.invalidateQueries({ queryKey: ["observacion-stats"], exact: false });
    },
  });
}
