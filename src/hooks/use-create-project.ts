"use client";

import { apiClient } from "@/lib/apiClient";
import { createApiError } from "@/lib/api-error";
import { paths } from "@/types/openapi";
import { useMutation } from "@tanstack/react-query";

type CreateProjectInput =
	paths["/api/v1/projects"]["post"]["requestBody"]["content"]["application/json"];
type CreateProjectOutput =
	paths["/api/v1/projects"]["post"]["responses"]["201"]["content"]["application/json"];

export function useCreateProject() {
	return useMutation({
		mutationFn: async (payload: CreateProjectInput) => {
			try {
				const { data, error, response } = await apiClient.POST(
					"/api/v1/projects",
					{
						body: payload,
					}
				);

				// Handle HTTP errors
				if (error) {
					const status = response?.status ?? 500;
					throw createApiError(error, status, response);
				}

				// Validate response data

				if (!data) {
					const status = 500;
					throw createApiError(
						{ message: "No data received from server" },
						status,
						response
					);
				}

				return data as CreateProjectOutput;
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
	});
}
