"use client";

/**
 * Card para mostrar un proyecto en el grid
 * Soporta dos variantes: "owner" (mis proyectos) y "explore" (explorar proyectos)
 */

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Folder, Calendar, FolderOpen, Users, Package } from "lucide-react";
import type { ProyectoBasic } from "@/types/colaboraciones";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProyectoCardProps {
  proyecto: ProyectoBasic;
  onVerDetalles: () => void;
  variant?: "owner" | "explore";
  pedidosCount?: number;
  ownerName?: string;
}

export function ProyectoCard({
  proyecto,
  onVerDetalles,
  variant = "explore",
  pedidosCount = 0,
  ownerName
}: ProyectoCardProps) {
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

  const isOwner = variant === "owner";
  const buttonText = isOwner ? "Gestionar Proyecto" : "Colaborar";
  const buttonVariant = isOwner ? "default" : "outline";

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all cursor-pointer relative",
        isOwner && "border-primary/50 hover:border-primary"
      )}
      onClick={onVerDetalles}
    >
      {/* Badge de variante en esquina superior derecha */}
      {isOwner && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-primary text-primary-foreground shadow-sm">
            <FolderOpen className="h-3 w-3 mr-1" />
            Tu Proyecto
          </Badge>
        </div>
      )}

      {!isOwner && pedidosCount > 0 && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="shadow-sm">
            <Package className="h-3 w-3 mr-1" />
            {pedidosCount} {pedidosCount === 1 ? "pedido" : "pedidos"}
          </Badge>
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between gap-2 pr-24">
          <CardTitle className="text-lg line-clamp-2">{proyecto.titulo}</CardTitle>
          <Badge variant={getEstadoBadgeVariant(proyecto.estado)} className="shrink-0">
            {proyecto.estado.replace("_", " ")}
          </Badge>
        </div>

        {/* Mostrar dueño si es modo explore */}
        {!isOwner && ownerName && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <Users className="h-3 w-3" />
            <span>{ownerName}</span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {proyecto.descripcion}
        </p>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {proyecto.ciudad}, {proyecto.provincia}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 shrink-0" />
            <span className="truncate">{proyecto.tipo}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>Creado {formatDate(proyecto.created_at)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={buttonVariant}
          onClick={(e) => {
            e.stopPropagation();
            onVerDetalles();
          }}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
