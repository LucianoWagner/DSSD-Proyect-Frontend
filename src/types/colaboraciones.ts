/**
 * Tipos para el sistema de intercambio entre ONGs
 * Manejo de ofertas, compromisos y colaboraciones
 */

/**
 * Estados posibles de un pedido
 */
export type EstadoPedido = "PENDIENTE" | "COMPROMETIDO" | "COMPLETADO";

/**
 * Estados posibles de una oferta
 */
export type EstadoOferta = "pendiente" | "aceptada" | "rechazada";

/**
 * Oferta básica (sin relaciones)
 */
export interface Oferta {
  id: string;
  pedido_id: string;
  user_id: string;
  descripcion: string;
  monto_ofrecido?: number;
  estado: EstadoOferta;
  created_at: string;
  updated_at: string;
}

/**
 * Oferta con información del usuario que la creó
 * Usada cuando el dueño del proyecto ve las ofertas
 */
export interface OfertaWithUser extends Oferta {
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    ong: string;
  };
}

/**
 * Pedido básico (subset de campos relevantes para ofertas)
 */
export interface PedidoBasic {
  id: string;
  etapa_id: string;
  tipo: string;
  descripcion: string;
  estado: string;
  ya_oferto?: boolean;
  monto?: number | null;
  moneda?: string | null;
  cantidad?: number | null;
  unidad?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Etapa básica (para nested en proyecto)
 */
export interface EtapaBasic {
  id: string;
  nombre: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: string;
  pedidos: PedidoBasic[];
}

/**
 * Proyecto básico (para listado)
 */
export interface ProyectoBasic {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  pais: string;
  provincia: string;
  ciudad: string;
  barrio?: string;
  estado: string;
  created_at: string;
  updated_at: string;
}

/**
 * Proyecto completo con etapas y pedidos
 * Usado en vista de detalle
 */
export interface ProyectoDetalle extends ProyectoBasic {
  etapas: EtapaBasic[];
  bonita_case_id?: string;
  bonita_process_instance_id?: number;
}

/**
 * Información del proyecto asociado a una oferta
 */
export interface ProyectoInfo {
  id: string;
  titulo: string;
  tipo: string;
  ciudad: string;
  provincia: string;
  estado: string;
}

/**
 * Compromiso (oferta con datos del pedido asociado)
 * Usado en página "Mis Compromisos"
 */
export interface CompromisoWithPedido extends Oferta {
  pedido: {
    id: string;
    tipo: string;
    descripcion: string;
    estado: EstadoPedido;
    monto?: number | null;
    moneda?: string | null;
    cantidad?: number | null;
    unidad?: string | null;
    etapa: {
      id: string;
      nombre: string;
      estado: string;
      proyecto: ProyectoInfo;
    };
  };
}

/**
 * Request para crear una oferta
 */
export interface CreateOfertaRequest {
  descripcion: string;
  monto_ofrecido?: number;
}

/**
 * Filtros para listar proyectos
 */
export interface ProjectListFilters {
  page?: number;
  page_size?: number;
  estado?: string;
  tipo?: string;
  pais?: string;
  provincia?: string;
  ciudad?: string;
  search?: string;
  my_projects?: boolean;
  exclude_my_projects?: boolean;
  sort_by?: "created_at" | "updated_at" | "titulo";
  sort_order?: "asc" | "desc";
}

/**
 * Respuesta paginada genérica
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Respuesta de listar proyectos
 */
export type ProjectListResponse = PaginatedResponse<ProyectoBasic>;

/**
 * Filtros para compromisos
 */
export interface CompromisosFilters {
  estado_oferta?: EstadoOferta;
}

/**
 * Estadísticas de compromisos (para badges)
 */
export interface CompromisosStats {
  total: number;
  pendientes: number;
  aceptadas: number;
  completadas: number;
  rechazadas: number;
}
