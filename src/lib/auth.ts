/**
 * Authentication API Client
 * Handles all authentication-related API calls
 */
import { createApiError } from "./api-error";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from "@/types/auth";

/**
 * Login user
 * POST /auth/login
 */
export async function login(
  credentials: LoginRequest
): Promise<LoginResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw createApiError(error, response.status, response);
  }

  return response.json();
}

/**
 * Register new user (MEMBER only)
 * POST /auth/register
 */
export async function register(
  userData: RegisterRequest
): Promise<RegisterResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw createApiError(error, response.status, response);
  }

  return response.json();
}

/**
 * Refresh access token
 * POST /auth/refresh
 */
export async function refreshToken(
  payload: RefreshTokenRequest
): Promise<RefreshTokenResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/refresh`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw createApiError(error, response.status, response);
  }

  return response.json();
}

/**
 * Decode JWT token to extract payload
 * Does NOT validate signature (backend does that)
 */
export function decodeJWT<T = Record<string, unknown>>(token: string): T | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT<{ exp: number }>(token);
  if (!payload || !payload.exp) return true;

  // Check if token expires in less than 30 seconds (buffer time)
  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const bufferTime = 30 * 1000; // 30 seconds

  return expirationTime - currentTime < bufferTime;
}
