"use client";

/**
 * Card para mostrar un proyecto en el grid de exploración
 */

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Folder, Calendar } from "lucide-react";
import type { ProyectoBasic } from "@/types/colaboraciones";
import { formatDate } from "@/lib/utils";

interface ProyectoCardProps {
  proyecto: ProyectoBasic;
  onVerDetalles: () => void;
}

export function ProyectoCard({ proyecto, onVerDetalles }: ProyectoCardProps) {
  // Estado badge color
  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "pendiente":
      case "planificacion":
        return "secondary";
      case "en_ejecucion":
      case "en ejecucion":
        return "default";
      case "completado":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onVerDetalles}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">{proyecto.titulo}</CardTitle>
          <Badge variant={getEstadoBadgeVariant(proyecto.estado)}>
            {proyecto.estado.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {proyecto.descripcion}
        </p>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>
              {proyecto.ciudad}, {proyecto.provincia}, {proyecto.pais}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            <span>{proyecto.tipo}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Creado {formatDate(proyecto.created_at)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onVerDetalles();
          }}
        >
          Ver Detalles
        </Button>
      </CardFooter>
    </Card>
  );
}
