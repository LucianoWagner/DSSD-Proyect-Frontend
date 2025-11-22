"use client";

/**
 * Hook para obtener el perfil del usuario autenticado
 * GET /api/v1/users/me
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { createApiError } from "@/lib/api-error";

export interface CurrentUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  ong: string;
  role: "ADMIN" | "MEMBER" | "REVIEWER";
  created_at: string;
  updated_at: string;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: async (): Promise<CurrentUser> => {
      const result: any = await apiClient.GET("/api/v1/users/me");

      if (result.error) {
        throw createApiError(
          result.error,
          result.response?.status ?? 500,
          result.response
        );
      }

      return result.data as CurrentUser;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1, // Only retry once on failure
  });
}
