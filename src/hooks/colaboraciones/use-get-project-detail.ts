"use client";

/**
 * Hook para obtener detalle de un proyecto con etapas y pedidos
 * GET /api/v1/projects/{project_id}
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { createApiError } from "@/lib/api-error";
import type { paths } from "@/types/openapi";

/**
 * Obtener detalle completo de un proyecto
 * Incluye etapas y pedidos nested
 */
type ProjectDetailResponse = paths["/api/v1/projects/{project_id}"]["get"]["responses"][200]["content"]["application/json"];

export function useGetProjectDetail(projectId: string | null) {
  return useQuery<ProjectDetailResponse>({
    queryKey: ["projects", "detail", projectId],
    queryFn: async () => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      const { data, error, response} = await apiClient.GET("/api/v1/projects/{project_id}", {
        params: {
          path: {
            project_id: projectId,
          },
        },
      });

      if (error) {
        throw createApiError(error, response.status ?? 500, response);
      }

      return data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook para obtener etapas de un proyecto con filtros
 * GET /api/v1/projects/{project_id}/etapas
 */
export function useGetProjectEtapas(
  projectId: string | null,
  estado?: string
) {
  return useQuery({
    queryKey: ["projects", projectId, "etapas", estado],
    queryFn: async () => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      const { data, error, response } = await apiClient.GET(
        "/api/v1/projects/{project_id}/etapas",
        {
          params: {
            path: {
              project_id: projectId,
            },
            query: {
              estado,
            },
          },
        }
      );

      if (error) {
        throw createApiError(error, response.status ?? 500, response);
      }

      return data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

/**
 * Hook para obtener pedidos de un proyecto con filtros
 * GET /api/v1/projects/{project_id}/pedidos
 */
export function useGetProjectPedidos(
  projectId: string | null,
  estadoPedido?: "PENDIENTE" | "COMPROMETIDO" | "COMPLETADO"
) {
  return useQuery({
    queryKey: ["projects", projectId, "pedidos", estadoPedido],
    queryFn: async () => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      const { data, error, response } = await apiClient.GET(
        "/api/v1/projects/{project_id}/pedidos",
        {
          params: {
            path: {
              project_id: projectId,
            },
            query: {
              estado: estadoPedido,
            },
          },
        }
      );

      if (error) {
        throw createApiError(error, response.status ?? 500, response);
      }

      return data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}
