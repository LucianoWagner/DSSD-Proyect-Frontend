"use client";

/**
 * Card para mostrar un compromiso (oferta enviada)
 */

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, CheckCircle2, XCircle, AlertCircle, Edit, Trash2 } from "lucide-react";
import type { CompromisoWithPedido } from "@/types/colaboraciones";
import { formatRelativeTime } from "@/lib/utils";
import { canConfirmRealizacion } from "@/hooks/colaboraciones/use-confirmar-realizacion";
import { EditOfertaDialog } from "./edit-oferta-dialog";
import { DeleteOfertaDialog } from "./delete-oferta-dialog";

interface CompromisoCardProps {
  compromiso: CompromisoWithPedido;
  onConfirmar?: () => void;
}

export function CompromisoCard({
  compromiso,
  onConfirmar,
}: CompromisoCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const canConfirm = canConfirmRealizacion(
    compromiso.estado,
    compromiso.pedido.estado
  );

  // Icono según estado
  const getEstadoIcon = () => {
    switch (compromiso.estado) {
      case "pendiente":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "aceptada":
        return compromiso.pedido.estado === "COMPLETADO" ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4 text-blue-600" />
        );
      case "rechazada":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Badge variant según estado
  const getEstadoBadgeVariant = () => {
    switch (compromiso.estado) {
      case "pendiente":
        return "secondary";
      case "aceptada":
        return compromiso.pedido.estado === "COMPLETADO" ? "outline" : "default";
      case "rechazada":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Texto del estado
  const getEstadoText = () => {
    if (compromiso.estado === "aceptada") {
      return compromiso.pedido.estado === "COMPLETADO"
        ? "Completado"
        : "Aceptada - En proceso";
    }
    return compromiso.estado.charAt(0).toUpperCase() + compromiso.estado.slice(1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {getEstadoIcon()}
            <CardTitle className="text-base">
              {compromiso.pedido.etapa.nombre}
            </CardTitle>
          </div>
          <Badge variant={getEstadoBadgeVariant()}>
            {getEstadoText()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Información del pedido */}
        <div>
          <p className="text-sm font-medium mb-1">Pedido:</p>
          <p className="text-sm text-muted-foreground">
            {compromiso.pedido.tipo} - {compromiso.pedido.descripcion}
          </p>
          <div className="mt-1">
            <Badge variant="outline" className="text-xs">
              Estado del pedido: {compromiso.pedido.estado}
            </Badge>
          </div>
        </div>

        {/* Estado de la etapa */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Estado de etapa: {compromiso.pedido.etapa.estado}</span>
        </div>

        {/* Tu oferta */}
        <div>
          <p className="text-sm font-medium mb-1">Tu oferta:</p>
          <p className="text-sm text-muted-foreground">
            {compromiso.descripcion}
          </p>
          {compromiso.monto_ofrecido && (
            <p className="text-sm font-medium text-green-600 mt-1">
              ARS {compromiso.monto_ofrecido.toLocaleString("es-AR")}
            </p>
          )}
        </div>

        {/* Fecha */}
        <p className="text-xs text-muted-foreground">
          Enviada {formatRelativeTime(compromiso.created_at)}
        </p>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        {/* Botones de editar y eliminar para ofertas pendientes */}
        {compromiso.estado === "pendiente" && (
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(true)}
              className="flex-1"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              className="flex-1"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        )}

        {/* Botón confirmar realización */}
        {canConfirm && onConfirmar && (
          <Button onClick={onConfirmar} className="w-full">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Confirmar Realización
          </Button>
        )}

        {/* Mensaje cuando está completado */}
        {compromiso.pedido.estado === "COMPLETADO" && (
          <div className="w-full text-center text-sm text-green-600">
            ✓ Has completado este compromiso exitosamente
          </div>
        )}

        {/* Mensaje cuando está rechazado */}
        {compromiso.estado === "rechazada" && (
          <div className="w-full text-center text-sm text-muted-foreground">
            Esta oferta fue rechazada por el dueño del proyecto
          </div>
        )}
      </CardFooter>

      {/* Dialogs */}
      <EditOfertaDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        compromiso={compromiso}
      />
      <DeleteOfertaDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        compromiso={compromiso}
      />
    </Card>
  );
}
