/**
 * Domain types for Observaciones (Observations) feature
 */

// Estado de la observación
export type EstadoObservacion = "pendiente" | "resuelta" | "vencida";

// Observación base (solo datos de la observación)
export interface Observacion {
  id: string;
  proyecto_id: string;
  council_user_id: string;
  descripcion: string;
  estado: EstadoObservacion;
  fecha_limite: string; // ISO date string
  respuesta: string | null;
  fecha_resolucion: string | null; // ISO datetime string
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

// Usuario (council o executor)
export interface ObservacionUser {
  id: string;
  email: string;
  ong: string | null;
  nombre: string | null;
}

// Proyecto básico
export interface ObservacionProyecto {
  id: string;
  titulo: string;
  estado: string;
}

// Observación con relaciones (de la API GET /api/v1/observaciones)
export interface ObservacionWithRelations extends Observacion {
  proyecto: ObservacionProyecto;
  council_user: ObservacionUser;
  executor_user: ObservacionUser;
}

// Request para crear observación
export interface CreateObservacionRequest {
  descripcion: string;
}

// Request para resolver observación
export interface ResolveObservacionRequest {
  respuesta: string;
}

// Filtros para listar observaciones
export interface ObservacionFilters {
  estado?: EstadoObservacion;
  proyecto_id?: string;
  council_user_id?: string;
  search?: string;
  fecha_desde?: string; // YYYY-MM-DD
  fecha_hasta?: string; // YYYY-MM-DD
  sort_by?: "created_at" | "fecha_limite" | "fecha_resolucion" | "updated_at";
  sort_order?: "asc" | "desc";
  page?: number;
  page_size?: number;
}

// Response paginada de la API
export interface ObservacionListResponse {
  items: ObservacionWithRelations[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// Stats de observaciones
export interface ObservacionStats {
  total: number;
  pendientes: number;
  vencidas: number;
  resueltas: number;
  pendientes_trend?: number; // +3, -2, etc.
  vencidas_trend?: number;
}

// Nivel de urgencia (calculado en frontend)
export type UrgencyLevel = "critical" | "high" | "medium" | "low";

// Info de countdown (calculado en frontend)
export interface CountdownInfo {
  text: string;
  color: string;
  urgency: UrgencyLevel;
  days: number;
}
