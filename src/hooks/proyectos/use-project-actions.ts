"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { createApiError, getErrorMessage, isApiError } from "@/lib/api-error";
import { toast } from "sonner";
import type { AppPaths } from "@/types/api-schema";

type StartProjectResponse = AppPaths["/api/v1/projects/{project_id}/start"]["post"]["responses"][200]["content"]["application/json"];
type CompleteProjectResponse =
	AppPaths["/api/v1/projects/{project_id}/complete"]["post"]["responses"][200]["content"]["application/json"];
type EtapaLifecycleResponse =
	AppPaths["/api/v1/etapas/{etapa_id}/start"]["post"]["responses"][200]["content"]["application/json"];

interface ProjectActionVariables {
	projectId: string;
}

interface EtapaActionVariables {
	projectId: string;
	etapaId: string;
}

const invalidateProjectQueries = (queryClient: ReturnType<typeof useQueryClient>, projectId: string) => {
	queryClient.invalidateQueries({ queryKey: ["projects"] });
	queryClient.invalidateQueries({ queryKey: ["projects", "detail", projectId] });
	queryClient.invalidateQueries({
		predicate: (query) =>
			Array.isArray(query.queryKey) &&
			(query.queryKey.includes(projectId) ||
				query.queryKey.join("-").includes(projectId)),
	});
};

const refetchProjectQueries = (queryClient: ReturnType<typeof useQueryClient>, projectId: string) => {
	queryClient.refetchQueries({ queryKey: ["projects", "detail", projectId] });
};

const getDetailDescription = (error: unknown): string | undefined => {
	if (!isApiError(error)) {
		return undefined;
	}

	const detail = (error.details as Record<string, unknown> | undefined)?.detail;
	if (!detail || typeof detail !== "object") {
		return undefined;
	}

	if ("pedidos_pendientes" in detail && Array.isArray(detail.pedidos_pendientes)) {
		const pending = detail.pedidos_pendientes as Array<{
			pedido_id: string;
			etapa_nombre: string;
			tipo: string;
			descripcion?: string;
		}>;
		if (pending.length > 0) {
			return `Pedidos pendientes: ${pending
				.map((pedido) => `${pedido.etapa_nombre} (${pedido.tipo})`)
				.join(", ")}`;
		}
	}

	if ("etapas_pendientes" in detail && Array.isArray(detail.etapas_pendientes)) {
		const pending = detail.etapas_pendientes as Array<{
			etapa_id: string;
			nombre?: string;
			estado: string;
		}>;
		if (pending.length > 0) {
			return `Etapas pendientes: ${pending
				.map((etapa) => `${etapa.nombre ?? etapa.etapa_id} (${etapa.estado})`)
				.join(", ")}`;
		}
	}

	if ("message" in detail && typeof detail.message === "string") {
		return detail.message;
	}

	return undefined;
};

export function useStartProject() {
	const queryClient = useQueryClient();

	return useMutation<StartProjectResponse, unknown, ProjectActionVariables>({
		mutationFn: async ({ projectId }) => {
			const { data, error, response } = await (apiClient.POST as any)(
				"/api/v1/projects/{project_id}/start",
				{
					params: {
						path: {
							project_id: projectId,
						},
					},
				}
			);

			if (error) {
				throw createApiError(error, response.status ?? 500, response);
			}

			return data as StartProjectResponse;
		},
		onSuccess: (data, variables) => {
			invalidateProjectQueries(queryClient, variables.projectId);
			toast.success("Proyecto en ejecución", {
				description: data?.message ?? "Se habilitó la ejecución del proyecto.",
			});
		},
		onError: (error) => {
			const description = getDetailDescription(error) ?? getErrorMessage(error);
			toast.error("No se pudo iniciar el proyecto", {
				description,
			});
		},
	});
}

export function useCompleteProject() {
	const queryClient = useQueryClient();

	return useMutation<CompleteProjectResponse, unknown, ProjectActionVariables>({
		mutationFn: async ({ projectId }) => {
			const { data, error, response } = await (apiClient.POST as any)(
				"/api/v1/projects/{project_id}/complete",
				{
					params: {
						path: {
							project_id: projectId,
						},
					},
				}
			);

			if (error) {
				throw createApiError(error, response.status ?? 500, response);
			}

			return data as CompleteProjectResponse;
		},
		onSuccess: (data, variables) => {
			invalidateProjectQueries(queryClient, variables.projectId);
			toast.success("Proyecto finalizado", {
				description: data?.message ?? "Todas las etapas quedaron completadas.",
			});
		},
		onError: (error) => {
			const description = getDetailDescription(error) ?? getErrorMessage(error);
			toast.error("No se pudo finalizar el proyecto", {
				description,
			});
		},
	});
}

export function useStartEtapa() {
	const queryClient = useQueryClient();

	return useMutation<EtapaLifecycleResponse, unknown, EtapaActionVariables>({
		mutationFn: async ({ etapaId }) => {
			const { data, error, response } = await (apiClient.POST as any)(
				"/api/v1/etapas/{etapa_id}/start",
				{
					params: {
						path: {
							etapa_id: etapaId,
						},
					},
				}
			);

			if (error) {
				throw createApiError(error, response.status ?? 500, response);
			}

			return data as EtapaLifecycleResponse;
		},
		onSuccess: (data, variables) => {
			refetchProjectQueries(queryClient, variables.projectId);
			toast.success("Etapa en ejecución", {
				description: data?.message ?? "Ya podés registrar avances en esta etapa.",
			});
		},
		onError: (error) => {
			const description = getDetailDescription(error) ?? getErrorMessage(error);
			toast.error("No se pudo iniciar la etapa", {
				description,
			});
		},
	});
}

export function useCompleteEtapa() {
	const queryClient = useQueryClient();

	return useMutation<EtapaLifecycleResponse, unknown, EtapaActionVariables>({
		mutationFn: async ({ etapaId }) => {
			const { data, error, response } = await (apiClient.POST as any)(
				"/api/v1/etapas/{etapa_id}/complete",
				{
					params: {
						path: {
							etapa_id: etapaId,
						},
					},
				}
			);

			if (error) {
				throw createApiError(error, response.status ?? 500, response);
			}

			return data as EtapaLifecycleResponse;
		},
		onSuccess: (data, variables) => {
			refetchProjectQueries(queryClient, variables.projectId);
			toast.success("Etapa completada", {
				description:
					data?.message ??
					"Se registró la fecha de completitud para esta etapa.",
			});
		},
		onError: (error) => {
			const description = getDetailDescription(error) ?? getErrorMessage(error);
			toast.error("No se pudo completar la etapa", {
				description,
			});
		},
	});
}
