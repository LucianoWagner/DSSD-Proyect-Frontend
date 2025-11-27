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
      const { data, error, response } = await (apiClient.GET as any)(
        "/api/v1/users/me",
        {}
      );

      if (error) {
        throw createApiError(error, response?.status ?? 500, response);
      }

      return data as CurrentUser;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1, // Only retry once on failure
  });
}
