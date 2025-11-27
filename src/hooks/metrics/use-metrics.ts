"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/apiClient";
import { createApiError } from "@/lib/api-error";

type PedidoTipo = "economico" | "materiales" | "mano_obra" | "transporte" | "equipamiento" | string;

type DashboardMetricsResponse = {
  proyectos_por_estado: Record<string, number>;
  total_proyectos: number;
  proyectos_activos: number;
  proyectos_listos_para_iniciar: number;
  tasa_exito: number;
  proyectos_en_riesgo?: number;
  velocidad_completacion?: number;
  observaciones_vencidas_total?: number;
};

type CommitmentsMetricsResponse = {
  total_pedidos: number;
  pedidos_con_ofertas: number;
  cobertura_ofertas_porcentaje: number;
  tasa_aceptacion_porcentaje: number;
  tiempo_respuesta_promedio_dias: number;
  pedidos_por_tipo?: Partial<Record<PedidoTipo, number>>;
  cobertura_por_tipo?: Partial<Record<PedidoTipo, number>>;
  top_contribuidores: {
    user_id: string;
    nombre: string;
    apellido: string;
    ong: string;
    tasa_aceptacion: number;
  }[];
  total_ofertas?: number;
  ofertas_aceptadas?: number;
  ofertas_pendientes?: number;
  valor_total_solicitado?: number;
  valor_total_comprometido?: number;
};

type PerformanceMetricsResponse = {
  tiempo_promedio_etapa_dias: number;
  semanas_promedio_etapa?: number;
  tiempo_inicio_promedio_dias: number;
  proyectos_pendientes_mas_30_dias: number;
  observaciones_total: number;
  observaciones_resueltas: number;
  observaciones_pendientes: number;
  observaciones_vencidas: number;
  tiempo_resolucion_observaciones_promedio_dias: number;
  tasa_cumplimiento_observaciones?: number;
  tiempo_respuesta_promedio_pedido_dias?: number;
  distribucion_pedidos_por_tipo?: Partial<Record<PedidoTipo, number>>;
};

type ProjectTrackingStage = {
  etapa_id: string;
  nombre: string;
  total_pedidos: number;
  pedidos_completados: number;
  pedidos_pendientes: number;
  progreso_porcentaje?: number;
  dias_planificados?: number;
  dias_transcurridos?: number;
  estado_salud?: string;
  dias_restantes?: number;
};

type ProjectTrackingMetricsResponse = {
  proyecto_id: string;
  titulo: string;
  estado: string;
  etapas: ProjectTrackingStage[];
  total_pedidos: number;
  pedidos_completados: number;
  pedidos_pendientes: number;
  progreso_global_porcentaje: number;
  observaciones_pendientes: number;
  observaciones_resueltas: number;
  observaciones_vencidas: number;
  puede_iniciar: boolean;
  estado_salud?: string;
  dias_restantes?: number;
};

const staleTime = 1000 * 60 * 5;

export function useDashboardMetrics() {
  return useQuery<DashboardMetricsResponse>({
    queryKey: ["metrics", "dashboard"],
    staleTime,
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET("/api/v1/metrics/dashboard", {});
      if (error) {
        const status = (response && 'status' in response) ? (response as { status?: number }).status ?? 500 : 500;
        throw createApiError(error, status, response);
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
        const status = (response && 'status' in response) ? (response as { status?: number }).status ?? 500 : 500;
        throw createApiError(error, status, response);
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
        const status = (response && 'status' in response) ? (response as { status?: number }).status ?? 500 : 500;
        throw createApiError(error, status, response);
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
        const status = (response && 'status' in response) ? (response as { status?: number }).status ?? 500 : 500;
        throw createApiError(error, status, response);
      }

      return data as ProjectTrackingMetricsResponse;
    },
  });
}
