"use client";

import { apiClient } from "@/lib/apiClient";
import { createApiError } from "@/lib/api-error";
import { paths } from "@/types/openapi";
import { useQuery } from "@tanstack/react-query";

type GetProjectOutput =
	paths["/api/v1/projects/{project_id}"]["get"]["responses"]["200"]["content"]["application/json"];

/**
 * Hook para obtener los detalles de un proyecto por ID
 */
export function useGetProject(projectId: string) {
	return useQuery({
		queryKey: ["project", projectId],
		queryFn: async () => {
			try {
				const { data, error, response } = await apiClient.GET(
					"/api/v1/projects/{project_id}",
					{
						params: {
							path: {
								project_id: projectId,
							},
						},
					}
				);

				// Handle HTTP errors
				if (error) {
					throw createApiError(
						error,
						response.status ?? 500,
						response
					);
				}

				// Validate response data
				if (!data) {
					throw createApiError(
						{ message: "No data received from server" },
						500,
						response
					);
				}

				return data as GetProjectOutput;
			} catch (error) {
				// Re-throw ApiErrors as-is
				if (error instanceof Error && error.name === "ApiError") {
					throw error;
				}

				// Handle network errors
				if (error instanceof TypeError) {
					throw createApiError(
						{
							message:
								"Error de red. Verifica tu conexión a internet.",
						},
						0,
						undefined
					);
				}

				// Handle unexpected errors
				throw createApiError(
					{
						message:
							error instanceof Error
								? error.message
								: "Error inesperado",
					},
					500,
					undefined
				);
			}
		},
		enabled: !!projectId,
		retry: 1,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

/**
 * Función para fetch server-side (para usar en Server Components)
 */
export async function getProject(projectId: string): Promise<GetProjectOutput> {
	const { data, error, response } = await apiClient.GET(
		"/api/v1/projects/{project_id}",
		{
			params: {
				path: {
					project_id: projectId,
				},
			},
		}
	);

	if (error) {
		throw createApiError(error, response.status, response);
	}

	if (!data) {
		throw createApiError({ message: "Project not found" }, 404, response);
	}

	return data as GetProjectOutput;
}
