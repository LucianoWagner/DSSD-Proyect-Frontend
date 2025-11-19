"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertTriangle, Clock, CheckCircle2, FileText, User, Building2, Flame } from "lucide-react";
import type { ObservacionWithRelations, EstadoObservacion } from "@/types/observaciones";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ObservacionCardProps {
  observacion: ObservacionWithRelations;
  variant?: "compact" | "detailed";
  onResolve?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  showProject?: boolean;
  canResolve?: boolean;
}

// Get badge color and icon based on estado and urgency
function getEstadoConfig(estado: EstadoObservacion, urgency?: string) {
  // For pendientes with high urgency, use more aggressive colors
  if (estado === "pendiente" && urgency === "high") {
    return {
      badge: "bg-red-500 text-white border-red-600",
      border: "border-l-red-600",
      icon: AlertTriangle,
      label: "Pendiente",
    };
  }

  if (estado === "pendiente" && urgency === "medium") {
    return {
      badge: "bg-orange-500 text-white border-orange-600",
      border: "border-l-orange-500",
      icon: AlertTriangle,
      label: "Pendiente",
    };
  }

  // Default configs
  const configs = {
    pendiente: {
      badge: "bg-yellow-100 text-yellow-800 border-yellow-300",
      border: "border-l-yellow-500",
      icon: AlertTriangle,
      label: "Pendiente",
    },
    vencida: {
      badge: "bg-red-100 text-red-800 border-red-300",
      border: "border-l-red-500",
      icon: AlertTriangle,
      label: "Vencida",
    },
    resuelta: {
      badge: "bg-green-100 text-green-800 border-green-300",
      border: "border-l-green-500",
      icon: CheckCircle2,
      label: "Resuelta",
    },
  };
  return configs[estado];
}

// Get countdown info
function getCountdown(fecha_limite: string, estado: EstadoObservacion) {
  const days = differenceInDays(new Date(fecha_limite), new Date());

  if (estado === "vencida") {
    return {
      text: `Vencida hace ${Math.abs(days)} ${Math.abs(days) === 1 ? "día" : "días"}`,
      color: "text-red-600",
      urgency: "critical",
    };
  }

  if (days === 0) {
    return {
      text: "Vence hoy",
      color: "text-red-600",
      urgency: "high",
    };
  }

  if (days === 1) {
    return {
      text: "Vence mañana",
      color: "text-orange-600",
      urgency: "high",
    };
  }

  if (days === 2) {
    return {
      text: "Vence en 2 días",
      color: "text-orange-500",
      urgency: "medium",
    };
  }

  return {
    text: `Vence en ${days} ${days === 1 ? "día" : "días"}`,
    color: "text-muted-foreground",
    urgency: "low",
  };
}

export function ObservacionCard({
  observacion,
  variant = "compact",
  onResolve,
  onViewDetails,
  showProject = true,
  canResolve = false,
}: ObservacionCardProps) {
  const countdown = getCountdown(observacion.fecha_limite, observacion.estado);
  const estadoConfig = getEstadoConfig(observacion.estado, countdown.urgency);
  const Icon = estadoConfig.icon;

  // Get initials for avatar
  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all cursor-pointer relative",
        "border-l-4",
        estadoConfig.border
      )}
      onClick={() => onViewDetails?.(observacion.id)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Badge URGENTE para casos críticos (0-1 día) */}
            {countdown.urgency === "high" && observacion.estado === "pendiente" && (
              <Badge className="bg-red-600 text-white border-red-700 animate-pulse">
                <Flame className="h-3 w-3 mr-1" />
                URGENTE
              </Badge>
            )}
            <Icon className={cn("h-4 w-4", countdown.color)} />
            <Badge className={estadoConfig.badge} variant="outline">
              {estadoConfig.label}
            </Badge>
          </div>
          {observacion.estado !== "resuelta" && (
            <span className={cn("text-xs font-bold", countdown.color)}>
              {countdown.text}
            </span>
          )}
        </div>

        {/* Project title */}
        {showProject && (
          <div className="flex items-center gap-1.5 text-sm font-semibold mt-2">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="line-clamp-1">{observacion.proyecto.titulo}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <div>
          <p className="text-sm text-foreground line-clamp-3">
            {observacion.descripcion}
          </p>
        </div>

        {/* Council user info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs bg-muted">
              {getInitials(observacion.council_user.nombre)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-foreground">
              {observacion.council_user.nombre || observacion.council_user.email}
            </span>
            {observacion.council_user.ong && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {observacion.council_user.ong}
              </span>
            )}
          </div>
        </div>

        {/* Executor info (if showing project) */}
        {showProject && observacion.executor_user && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <User className="h-3.5 w-3.5" />
            <span>Responsable: {observacion.executor_user.nombre || observacion.executor_user.email}</span>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              Creada {formatDistanceToNow(new Date(observacion.created_at), { locale: es, addSuffix: true })}
            </span>
          </div>
          {observacion.estado === "resuelta" && observacion.fecha_resolucion && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              <span>
                Resuelta {formatDistanceToNow(new Date(observacion.fecha_resolucion), { locale: es, addSuffix: true })}
              </span>
            </div>
          )}
        </div>

        {/* Response (if resolved) */}
        {observacion.estado === "resuelta" && observacion.respuesta && variant === "detailed" && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-xs font-semibold mb-1">Respuesta:</p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {observacion.respuesta}
            </p>
          </div>
        )}
      </CardContent>

      {(canResolve || onViewDetails) && (
        <CardFooter className="gap-2">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(observacion.id);
              }}
            >
              Ver Detalles
            </Button>
          )}
          {/* Solo se puede resolver si está PENDIENTE (no vencida, no resuelta) */}
          {canResolve && observacion.estado === "pendiente" && onResolve && (
            <Button
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onResolve(observacion.id);
              }}
            >
              Resolver
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
