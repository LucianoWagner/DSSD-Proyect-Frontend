/**
 * Authentication Types
 * Domain types for authentication, user sessions, and JWT handling
 */

/**
 * User roles in the system
 * MEMBER: ONGs (can register and login)
 * COUNCIL: Directivos (can only login, pre-created accounts)
 */
export type Role = "MEMBER" | "COUNCIL";

/**
 * JWT Payload structure
 * Decoded from access_token
 */
export interface JWTPayload {
  sub: string; // User ID (UUID)
  email: string;
  role: Role;
  exp: number; // Expiration timestamp (Unix time)
}

/**
 * User entity
 * Represents the authenticated user
 */
export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  ong: string;
  role: Role;
  created_at?: string;
  updated_at?: string;
}

/**
 * Authentication tokens
 * Returned by login and refresh endpoints
 */
export interface AuthTokens {
  access_token: string; // Valid for 15 minutes
  refresh_token: string; // Valid for 24 hours
  token_type: "bearer";
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response
 * Same as AuthTokens
 */
export type LoginResponse = AuthTokens;

/**
 * Register request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  ong: string;
  role?: Role; // Optional, defaults to MEMBER
}

/**
 * Register response
 * Returns created user (without password)
 */
export type RegisterResponse = User;

/**
 * Refresh token request payload
 */
export interface RefreshTokenRequest {
  refresh_token: string;
}

/**
 * Refresh token response
 * Same as AuthTokens
 */
export type RefreshTokenResponse = AuthTokens;

/**
 * Auth state
 * Represents the current authentication status
 */
export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
