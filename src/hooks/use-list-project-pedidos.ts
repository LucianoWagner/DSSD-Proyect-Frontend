"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { createApiError } from "@/lib/api-error";
import { paths } from "@/types/openapi";

type ProjectPedidosResponse =
  paths["/api/v1/projects/{project_id}/pedidos"]["get"]["responses"]["200"]["content"]["application/json"];

export function useListProjectPedidos(projectId: string | null, estado?: string) {
  return useQuery<ProjectPedidosResponse>({
    queryKey: ["pedidos", "project", projectId, estado],
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 2,
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
            query: estado ? { estado } : undefined,
          },
        }
      );

      if (error) {
        throw createApiError(error, response.status ?? 500, response);
      }

      return data ?? [];
    },
  });
}
