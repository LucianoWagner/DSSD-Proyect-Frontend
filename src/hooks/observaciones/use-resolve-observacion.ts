"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createApiError } from "@/lib/api-error";
import type { ResolveObservacionRequest, Observacion } from "@/types/observaciones";

/**
 * Hook to resolve an observation
 * Only PROJECT OWNER can resolve observations for their projects
 *
 * @param observacionId - ID of the observation to resolve
 * @param projectId - ID of the project (for cache invalidation)
 * @returns React Query mutation
 */
export function useResolveObservacion(observacionId: string, projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ResolveObservacionRequest): Promise<Observacion> => {
      // Use fetch directly since endpoint not in openapi types yet
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/observaciones/${observacionId}/resolve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Unknown error" }));
        throw createApiError(error, response.status, response);
      }

      const result = await response.json();
      return result as Observacion;
    },
    onSuccess: () => {
      // Invalidate all observations queries (with filters)
      queryClient.invalidateQueries({ queryKey: ["observaciones"], exact: false });

      // Invalidate project queries if projectId provided
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      }

      // Invalidate observation stats and metrics
      queryClient.invalidateQueries({ queryKey: ["observacion-stats"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
  });
}
