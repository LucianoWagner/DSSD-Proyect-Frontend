"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CreateObservacionForm } from "@/components/observaciones/create-observacion-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CrearObservacionPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Check authorization - only COUNCIL can create observations
  useEffect(() => {
    if (!isLoading && user?.role !== "COUNCIL") {
      router.push("/observaciones");
    }
  }, [user?.role, isLoading, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  // Check if user is not COUNCIL
  if (user?.role !== "COUNCIL") {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acceso denegado</AlertTitle>
          <AlertDescription>
            Solo los miembros del consejo pueden crear observaciones. Si crees que esto es un error,
            por favor contacta con el administrador.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Crear Observación</h1>
        <p className="text-muted-foreground">
          Registra una nueva observación sobre un proyecto en ejecución
        </p>
      </div>

      {/* Form */}
      <CreateObservacionForm />

      {/* Info Section */}
      <div className="rounded-lg border bg-slate-50 p-6 space-y-4">
        <h2 className="font-semibold text-lg">¿Cómo funciona?</h2>
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="flex-shrink-0 rounded-full bg-blue-100 w-6 h-6 flex items-center justify-center text-blue-700 font-semibold">
              1
            </span>
            <span>
              <strong>Selecciona un proyecto</strong> - Elige un proyecto que está en ejecución
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 rounded-full bg-blue-100 w-6 h-6 flex items-center justify-center text-blue-700 font-semibold">
              2
            </span>
            <span>
              <strong>Describe tu observación</strong> - Sé específico y constructivo sobre los puntos a mejorar
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 rounded-full bg-blue-100 w-6 h-6 flex items-center justify-center text-blue-700 font-semibold">
              3
            </span>
            <span>
              <strong>Envía la observación</strong> - Se notificará automáticamente al proyecto responsable
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 rounded-full bg-blue-100 w-6 h-6 flex items-center justify-center text-blue-700 font-semibold">
              4
            </span>
            <span>
              <strong>Espera la respuesta</strong> - El proyecto tendrá 5 días para responder a tu observación
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}
