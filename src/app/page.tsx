"use client";

/**
 * Root Page
 * Redirects to dashboard if authenticated, otherwise to login
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-muted-foreground">Cargando...</div>
    </div>
  );
}
