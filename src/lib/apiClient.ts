import createClient from "openapi-fetch";
import type { AppPaths } from "@/types/api-schema";

/**
 * Server-side API client
 * Used in Server Components and Server Actions
 */
export const apiServer = createClient<AppPaths>({
	baseUrl: process.env.API_BASE_URL,
});

/**
 * Client-side API client
 * Used in Client Components
 * Automatically injects Authorization header from localStorage
 */
export const apiClient = createClient<AppPaths>({
	baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
});

/**
 * Add Authorization header to all requests
 * Reads access token from localStorage
 */
apiClient.use({
	onRequest({ request }) {
		// Check if running in browser
		if (typeof window !== "undefined") {
			const accessToken = localStorage.getItem("access_token");
			if (accessToken) {
				request.headers.set("Authorization", `Bearer ${accessToken}`);
			}
		}
		return request;
	},
});
