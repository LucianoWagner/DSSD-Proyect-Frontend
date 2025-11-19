"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileQuestion, Search, AlertCircle, CheckCircle } from "lucide-react";

interface EmptyStateObservacionesProps {
  type: "no-observaciones" | "no-results" | "no-urgentes" | "no-resueltas";
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyStateObservaciones({
  type,
  onAction,
  actionLabel,
}: EmptyStateObservacionesProps) {
  const configs = {
    "no-observaciones": {
      icon: <FileQuestion className="h-12 w-12 text-muted-foreground" />,
      title: "No hay observaciones",
      description:
        "Aún no hay observaciones registradas. Las observaciones aparecerán aquí cuando el consejo las cree para los proyectos en ejecución.",
    },
    "no-results": {
      icon: <Search className="h-12 w-12 text-muted-foreground" />,
      title: "No se encontraron resultados",
      description:
        "No hay observaciones que coincidan con tus filtros. Intentá ajustar los filtros o buscar por otros términos.",
    },
    "no-urgentes": {
      icon: <CheckCircle className="h-12 w-12 text-muted-foreground" />,
      title: "¡Excelente! No hay observaciones urgentes",
      description:
        "Todas las observaciones pendientes tienen tiempo suficiente para ser resueltas. No hay ninguna próxima a vencer en los próximos 2 días.",
    },
    "no-resueltas": {
      icon: <AlertCircle className="h-12 w-12 text-muted-foreground" />,
      title: "No hay observaciones resueltas",
      description:
        "Aún no hay observaciones resueltas. Las observaciones resueltas aparecerán aquí una vez que los ejecutores respondan.",
    },
  };

  const config = configs[type];

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        {config.icon}
        <h3 className="text-lg font-semibold mt-4">{config.title}</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          {config.description}
        </p>
        {onAction && actionLabel && (
          <Button onClick={onAction} className="mt-4">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
