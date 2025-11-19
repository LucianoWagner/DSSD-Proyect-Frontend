import createClient from "openapi-fetch";
import type { paths } from "@/types/openapi";

/**
 * Server-side API client
 * Used in Server Components and Server Actions
 */
export const apiServer = createClient<paths>({
	baseUrl: process.env.API_BASE_URL,
});

/**
 * Client-side API client
 * Used in Client Components
 * Automatically injects Authorization header from localStorage
 */
export const apiClient = createClient<paths>({
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
				console.log("[apiClient] Authorization header added to request:", request.url);
			} else {
				console.warn("[apiClient] No access token found in localStorage for request:", request.url);
			}
		}
		return request;
	},
});
