"use client";

/**
 * Hook para listar proyectos con filtros y paginación
 * GET /api/v1/projects
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { createApiError } from "@/lib/api-error";
import type {
  ProjectListFilters,
  ProjectListResponse,
} from "@/types/colaboraciones";

/**
 * Listar proyectos con filtros y paginación
 */
export function useListProjects(filters: ProjectListFilters = {}) {
  return useQuery<ProjectListResponse>({
    queryKey: ["projects", "list", filters],
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET("/api/v1/projects", {
        params: {
          query: {
            page: filters.page,
            page_size: filters.page_size,
            estado: filters.estado,
            tipo: filters.tipo,
            pais: filters.pais,
            provincia: filters.provincia,
            ciudad: filters.ciudad,
            search: filters.search,
            my_projects: filters.my_projects,
            sort_by: filters.sort_by,
            sort_order: filters.sort_order,
          },
        },
      });

      if (error) {
        throw createApiError(error, response.status ?? 500, response);
      }

      return data as ProjectListResponse;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: true,
  });
}

/**
 * Hook para obtener count de proyectos con pedidos pendientes
 * Útil para badges en navegación
 */
export function useProjectsPendientesCount() {
  return useQuery({
    queryKey: ["projects", "pendientes-count"],
    queryFn: async (): Promise<number> => {
      const { data, error, response } = await apiClient.GET("/api/v1/projects", {
        params: {
          query: {
            page: 1,
            page_size: 1,
            estado: "pendiente",
            my_projects: false,
          },
        },
      });

      if (error) {
        throw createApiError(error, response.status ?? 500, response);
      }

      return (data as ProjectListResponse).total;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}
