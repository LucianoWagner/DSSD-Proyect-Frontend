"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { createApiError } from "@/lib/api-error";
import type { ProjectListFilters, ProjectListResponse } from "@/types/colaboraciones";

interface ProjectsForObservationsFilters extends ProjectListFilters {
  search?: string;
}

/**
 * Hook to fetch projects in 'en_ejecucion' state for observations creation
 * Only COUNCIL members can create observations for projects in this state
 *
 * @param filters - Optional filters (search, pagination)
 * @returns React Query result with projects data
 */
export function useListProjectsForObservations(filters?: ProjectsForObservationsFilters) {
  return useQuery<ProjectListResponse>({
    queryKey: ["projects", "for-observations", filters],
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET("/api/v1/projects", {
        params: {
          query: {
            page: filters?.page || 1,
            page_size: filters?.page_size || 50,
            estado: "en_ejecucion",
            search: filters?.search,
            sort_by: filters?.sort_by || "updated_at",
            sort_order: filters?.sort_order || "desc",
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
