"use client";

/**
 * Authentication Hooks
 * React Query hooks for authentication operations
 */

import { useMutation } from "@tanstack/react-query";
import { useAuth as useAuthContext } from "@/contexts/auth-context";
import type { LoginRequest, RegisterRequest } from "@/types/auth";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api-error";

/**
 * Access authentication context
 * Returns current user, auth state, and auth methods
 */
export function useAuth() {
  return useAuthContext();
}

/**
 * Login mutation hook
 * Handles user login with react-query
 */
export function useLogin() {
  const { login } = useAuthContext();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      await login(credentials);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error("Error al iniciar sesión", {
        description: message,
      });
    },
    onSuccess: () => {
      toast.success("Inicio de sesión exitoso", {
        description: "Bienvenido de vuelta",
      });
    },
  });
}

/**
 * Register mutation hook
 * Handles user registration with react-query
 */
export function useRegister() {
  const { register } = useAuthContext();

  return useMutation({
    mutationFn: async (userData: RegisterRequest) => {
      await register(userData);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error("Error al registrarse", {
        description: message,
      });
    },
    onSuccess: () => {
      toast.success("Registro exitoso", {
        description: "Ahora puedes iniciar sesión con tu cuenta",
      });
    },
  });
}

/**
 * Logout hook
 * Returns logout function from auth context
 */
export function useLogout() {
  const { logout } = useAuthContext();

  return () => {
    logout();
    toast.success("Sesión cerrada", {
      description: "Has cerrado sesión exitosamente",
    });
  };
}
