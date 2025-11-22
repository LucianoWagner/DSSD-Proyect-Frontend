"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Clock, CheckCircle2, FileText, User, Building2, Calendar } from "lucide-react";
import type { ObservacionWithRelations } from "@/types/observaciones";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ObservacionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  observacion: ObservacionWithRelations | null;
  onResolve?: () => void;
  canResolve?: boolean;
}

export function ObservacionDetailDialog({
  open,
  onOpenChange,
  observacion,
  onResolve,
  canResolve,
}: ObservacionDetailDialogProps) {
  if (!observacion) return null;

  const getEstadoBadge = (estado: string) => {
    const configs: Record<string, { bg: string; text: string; icon: any }> = {
      pendiente: { bg: "bg-yellow-100", text: "text-yellow-800", icon: AlertTriangle },
      vencida: { bg: "bg-red-100", text: "text-red-800", icon: AlertTriangle },
      resuelta: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle2 },
    };
    return configs[estado] || configs.pendiente;
  };

  const estadoConfig = getEstadoBadge(observacion.estado);
  const Icon = estadoConfig.icon;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="flex-1">Detalle de Observación</DialogTitle>
            <Badge className={cn(estadoConfig.bg, estadoConfig.text)} variant="outline">
              <Icon className="h-3 w-3 mr-1" />
              {observacion.estado.charAt(0).toUpperCase() + observacion.estado.slice(1)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project info */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>Proyecto</span>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{observacion.proyecto.titulo}</p>
              <p className="text-sm text-muted-foreground">Estado: {observacion.proyecto.estado}</p>
            </div>
          </div>

          <Separator />

          {/* Council user */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold mb-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Creada por (Consejo)</span>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {getInitials(observacion.council_user.nombre)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {observacion.council_user.nombre || observacion.council_user.email}
                </p>
                {observacion.council_user.ong && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {observacion.council_user.ong}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Executor user */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold mb-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Responsable (Ejecutor)</span>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {getInitials(observacion.executor_user.nombre)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {observacion.executor_user.nombre || observacion.executor_user.email}
                </p>
                {observacion.executor_user.ong && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {observacion.executor_user.ong}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Fecha de Creación</span>
              </div>
              <p className="text-sm">{format(new Date(observacion.created_at), "dd/MM/yyyy HH:mm", { locale: es })}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(observacion.created_at), { locale: es, addSuffix: true })}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Fecha Límite</span>
              </div>
              <p className="text-sm">{format(new Date(observacion.fecha_limite), "dd/MM/yyyy", { locale: es })}</p>
            </div>
          </div>

          {observacion.fecha_resolucion && (
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Fecha de Resolución</span>
              </div>
              <p className="text-sm">{format(new Date(observacion.fecha_resolucion), "dd/MM/yyyy HH:mm", { locale: es })}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(observacion.fecha_resolucion), { locale: es, addSuffix: true })}
              </p>
            </div>
          )}

          <Separator />

          {/* Description */}
          <div>
            <h4 className="font-semibold mb-2">Observación</h4>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{observacion.descripcion}</p>
            </div>
          </div>

          {/* Response (if resolved) */}
          {observacion.estado === "resuelta" && observacion.respuesta && (
            <div>
              <h4 className="font-semibold mb-2">Respuesta</h4>
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                <p className="text-sm whitespace-pre-wrap">{observacion.respuesta}</p>
              </div>
            </div>
          )}

          {/* Resolve button - Solo para observaciones PENDIENTES */}
          {canResolve && observacion.estado === "pendiente" && onResolve && (
            <div className="pt-4">
              <Button onClick={onResolve} className="w-full">
                Resolver Observación
              </Button>
            </div>
          )}

          {/* Warning for expired observations */}
          {observacion.estado === "vencida" && (
            <div className="pt-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Esta observación venció el {format(new Date(observacion.fecha_limite), "dd/MM/yyyy", { locale: es })}.
                  Ya no es posible resolverla después de los 5 días establecidos.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
