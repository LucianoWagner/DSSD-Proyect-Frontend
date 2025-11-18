"use client";

/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import {
  login as apiLogin,
  register as apiRegister,
  refreshToken as apiRefreshToken,
  decodeJWT,
  isTokenExpired,
} from "@/lib/auth";
import type {
  AuthState,
  AuthTokens,
  User,
  LoginRequest,
  RegisterRequest,
  JWTPayload,
} from "@/types/auth";

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
} as const;

/**
 * Get user from JWT payload
 */
function getUserFromToken(accessToken: string): User | null {
  const payload = decodeJWT<JWTPayload>(accessToken);
  if (!payload) return null;

  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    nombre: "", // Will be populated from registration or API call
    apellido: "",
    ong: "",
  };
}

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
  });

  /**
   * Save tokens to localStorage
   */
  const saveTokens = useCallback((tokens: AuthTokens) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
  }, []);

  /**
   * Clear tokens from localStorage
   */
  const clearTokens = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }, []);

  /**
   * Save user to localStorage
   */
  const saveUser = useCallback((user: User) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, []);

  /**
   * Refresh access token using refresh token
   */
  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      // Check if refresh token is expired
      if (isTokenExpired(refreshToken)) {
        throw new Error("Refresh token expired");
      }

      const tokens = await apiRefreshToken({ refresh_token: refreshToken });
      saveTokens(tokens);

      const user = getUserFromToken(tokens.access_token);
      if (!user) {
        throw new Error("Invalid access token");
      }

      // Merge with stored user data (nombre, apellido, ong)
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const mergedUser = storedUser
        ? { ...JSON.parse(storedUser), ...user }
        : user;

      setState({
        user: mergedUser,
        tokens,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to refresh token:", error);
      clearTokens();
      setState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      });
      router.push("/login");
    }
  }, [saveTokens, clearTokens, router]);

  /**
   * Login user
   */
  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        const tokens = await apiLogin(credentials);
        saveTokens(tokens);

        const user = getUserFromToken(tokens.access_token);
        if (!user) {
          throw new Error("Invalid access token");
        }

        saveUser(user);

        setState({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        });

        router.push("/dashboard");
      } catch (error) {
        clearTokens();
        throw error;
      }
    },
    [saveTokens, saveUser, clearTokens, router]
  );

  /**
   * Register new user
   */
  const register = useCallback(
    async (userData: RegisterRequest) => {
      try {
        await apiRegister(userData);
        // After registration, redirect to login
        router.push("/login");
      } catch (error) {
        throw error;
      }
    },
    [router]
  );

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    clearTokens();
    setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.push("/login");
  }, [clearTokens, router]);

  /**
   * Initialize auth state from localStorage
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const refreshTokenStr = localStorage.getItem(
          STORAGE_KEYS.REFRESH_TOKEN
        );
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (!accessToken || !refreshTokenStr) {
          setState({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        // Check if access token is expired
        if (isTokenExpired(accessToken)) {
          // Try to refresh
          await refreshAccessToken();
          return;
        }

        // Valid access token
        const user = getUserFromToken(accessToken);
        if (!user) {
          throw new Error("Invalid access token");
        }

        // Merge with stored user data
        const mergedUser = storedUser
          ? { ...JSON.parse(storedUser), ...user }
          : user;

        setState({
          user: mergedUser,
          tokens: {
            access_token: accessToken,
            refresh_token: refreshTokenStr,
            token_type: "bearer",
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        clearTokens();
        setState({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, [clearTokens, refreshAccessToken]);

  /**
   * Auto-refresh token before expiry
   */
  useEffect(() => {
    if (!state.tokens?.access_token) return;

    const checkAndRefresh = async () => {
      if (isTokenExpired(state.tokens!.access_token)) {
        await refreshAccessToken();
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkAndRefresh, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [state.tokens, refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth hook
 * Access authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
