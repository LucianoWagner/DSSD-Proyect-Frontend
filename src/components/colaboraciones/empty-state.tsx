"use client";

/**
 * Componente para estados vacíos
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileQuestion, Search, Heart, CheckCircle } from "lucide-react";

interface EmptyStateProps {
  type: "no-projects" | "no-results" | "no-compromisos" | "no-compromisos-filter";
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyState({ type, onAction, actionLabel }: EmptyStateProps) {
  const configs = {
    "no-projects": {
      icon: <Heart className="h-12 w-12 text-muted-foreground" />,
      title: "No hay proyectos disponibles",
      description:
        "No hay proyectos con pedidos pendientes en este momento. Vuelve más tarde para ver nuevas oportunidades de colaboración.",
    },
    "no-results": {
      icon: <Search className="h-12 w-12 text-muted-foreground" />,
      title: "No se encontraron resultados",
      description:
        "No hay proyectos que coincidan con tus filtros de búsqueda. Intenta ajustar los filtros o buscar por otros términos.",
    },
    "no-compromisos": {
      icon: <CheckCircle className="h-12 w-12 text-muted-foreground" />,
      title: "No tienes compromisos aún",
      description:
        "Aún no has enviado ninguna oferta. Explora proyectos y envía ofertas para ayudar a otras ONGs.",
    },
    "no-compromisos-filter": {
      icon: <FileQuestion className="h-12 w-12 text-muted-foreground" />,
      title: "No hay compromisos en este estado",
      description:
        "No tienes compromisos con este estado. Prueba seleccionar otra pestaña.",
    },
  };

  const config = configs[type];

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="mb-4">{config.icon}</div>
        <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          {config.description}
        </p>
        {onAction && actionLabel && (
          <Button onClick={onAction}>{actionLabel}</Button>
        )}
      </CardContent>
    </Card>
  );
}
