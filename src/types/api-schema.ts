import type { paths as GeneratedPaths } from "./openapi";

type EtapaLifecycleResponse = {
	id: string;
	nombre: string;
	estado: string;
	message?: string;
	fecha_completitud?: string | null;
};

type ProjectLifecycleResponse = {
	id: string;
	titulo: string;
	estado: string;
	message?: string;
};

type AdditionalPaths = {
	"/api/v1/etapas/{etapa_id}/start": {
		parameters: {
			query?: never;
			header?: never;
			path: { etapa_id: string };
			cookie?: never;
		};
		get?: never;
		put?: never;
		post: {
			requestBody?: never;
			responses: {
				200: {
					content: {
						"application/json": EtapaLifecycleResponse;
					};
				};
			};
		};
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/v1/etapas/{etapa_id}/complete": {
		parameters: {
			query?: never;
			header?: never;
			path: { etapa_id: string };
			cookie?: never;
		};
		get?: never;
		put?: never;
		post: {
			requestBody?: never;
			responses: {
				200: {
					content: {
						"application/json": EtapaLifecycleResponse;
					};
				};
			};
		};
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/v1/projects/{project_id}/start": {
		parameters: {
			query?: never;
			header?: never;
			path: { project_id: string };
			cookie?: never;
		};
		get?: never;
		put?: never;
		post: {
			requestBody?: never;
			responses: {
				200: {
					content: {
						"application/json": ProjectLifecycleResponse;
					};
				};
			};
		};
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
	"/api/v1/projects/{project_id}/complete": {
		parameters: {
			query?: never;
			header?: never;
			path: { project_id: string };
			cookie?: never;
		};
		get?: never;
		put?: never;
		post: {
			requestBody?: never;
			responses: {
				200: {
					content: {
						"application/json": ProjectLifecycleResponse;
					};
				};
			};
		};
		delete?: never;
		options?: never;
		head?: never;
		patch?: never;
		trace?: never;
	};
};

export type AppPaths = GeneratedPaths & AdditionalPaths;
