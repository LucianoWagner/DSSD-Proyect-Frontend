"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/apiClient";
import { createApiError } from "@/lib/api-error";
import type { paths } from "@/types/openapi";

type DashboardMetricsResponse =
  paths["/api/v1/metrics/dashboard"]["get"]["responses"]["200"]["content"]["application/json"];
type CommitmentsMetricsResponse =
  paths["/api/v1/metrics/commitments"]["get"]["responses"]["200"]["content"]["application/json"];
type PerformanceMetricsResponse =
  paths["/api/v1/metrics/performance"]["get"]["responses"]["200"]["content"]["application/json"];
type ProjectTrackingMetricsResponse =
  paths["/api/v1/metrics/projects/{project_id}/tracking"]["get"]["responses"]["200"]["content"]["application/json"];

const staleTime = 1000 * 60 * 5;

export function useDashboardMetrics() {
  return useQuery<DashboardMetricsResponse>({
    queryKey: ["metrics", "dashboard"],
    staleTime,
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET("/api/v1/metrics/dashboard", {});
      if (error) {
        throw createApiError(error, response.status ?? 500, response);
      }
      return data as DashboardMetricsResponse;
    },
  });
}

export function useCommitmentsMetrics() {
  return useQuery<CommitmentsMetricsResponse>({
    queryKey: ["metrics", "commitments"],
    staleTime,
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET("/api/v1/metrics/commitments", {});
      if (error) {
        throw createApiError(error, response.status ?? 500, response);
      }
      return data as CommitmentsMetricsResponse;
    },
  });
}

export function usePerformanceMetrics() {
  return useQuery<PerformanceMetricsResponse>({
    queryKey: ["metrics", "performance"],
    staleTime,
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET("/api/v1/metrics/performance", {});
      if (error) {
        throw createApiError(error, response.status ?? 500, response);
      }
      return data as PerformanceMetricsResponse;
    },
  });
}

export function useProjectTrackingMetrics(projectId: string | null) {
  return useQuery<ProjectTrackingMetricsResponse>({
    queryKey: ["metrics", "project-tracking", projectId],
    staleTime,
    enabled: Boolean(projectId),
    queryFn: async () => {
      if (!projectId) throw new Error("Project ID is required");

      const { data, error, response } = await apiClient.GET(
        "/api/v1/metrics/projects/{project_id}/tracking",
        {
          params: {
            path: { project_id: projectId },
          },
        }
      );

      if (error) {
        throw createApiError(error, response.status ?? 500, response);
      }

      return data as ProjectTrackingMetricsResponse;
    },
  });
}
