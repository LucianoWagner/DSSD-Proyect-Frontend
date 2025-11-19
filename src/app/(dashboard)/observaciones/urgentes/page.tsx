"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Urgentes page - redirects to main page with urgentes tab active
 * This allows navigation from sidebar to work correctly
 */
export default function UrgentesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/observaciones?tab=urgentes");
  }, [router]);

  return null;
}
