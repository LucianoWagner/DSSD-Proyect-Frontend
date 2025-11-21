export type TipoPedidoCobertura =
	| "economico"
	| "materiales"
	| "mano_obra"
	| "equipamiento"
	| "transporte";

export type PedidoCobertura = {
	id: string;
	tipo: string;
	descripcion: string;
	monto?: number;
	moneda?: string;
	cantidad?: number;
	unidad?: string;
};

export type EtapaProyecto = {
	id: string;
	nombre: string;
	descripcion: string;
	fecha_inicio: string;
	fecha_fin: string;
	estado?: string;
	fecha_completitud?: string | null;
	pedidos: PedidoCobertura[];
};

export type ProyectoFormData = {
	titulo: string;
	descripcion: string;
	tipo: string;
	pais: string;
	provincia: string;
	ciudad: string;
	barrio?: string;
	fecha_inicio: string;
	etapas: EtapaProyecto[];
};
