"use client";

/**
 * Card para mostrar un compromiso (oferta enviada)
 */

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, CheckCircle2, XCircle, AlertCircle, Edit, Trash2, Building2, Layers } from "lucide-react";
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

  const formatOfertaValor = () => {
    const tipo = (compromiso.pedido.tipo || "").toLowerCase();
    const monto = compromiso.monto_ofrecido;

    if (tipo === "economico") {
      if (monto === undefined || monto === null) return "Monto no especificado";
      const currency = (compromiso.pedido.moneda as string | undefined) || "ARS";
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(monto);
    }

    if (monto === undefined || monto === null) {
      return "Cantidad no especificada";
    }

    const unidad = compromiso.pedido.unidad ?? "";
    return `${monto}${unidad ? ` ${unidad}` : ""}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            {/* Título del proyecto - Más prominente */}
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                {compromiso.pedido.etapa.proyecto.titulo}
              </CardTitle>
            </div>
            {/* Ubicación del proyecto */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{compromiso.pedido.etapa.proyecto.ciudad}, {compromiso.pedido.etapa.proyecto.provincia}</span>
            </div>
          </div>
          <Badge variant={getEstadoBadgeVariant()}>
            {getEstadoText()}
          </Badge>
        </div>

        {/* Tipo de proyecto y estado */}
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {compromiso.pedido.etapa.proyecto.tipo}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Proyecto: {compromiso.pedido.etapa.proyecto.estado}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Información de la etapa */}
        <div className="border-l-2 border-primary/20 pl-3">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">Etapa: {compromiso.pedido.etapa.nombre}</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            Estado: {compromiso.pedido.etapa.estado}
          </Badge>
        </div>

        {/* Información del pedido */}
        <div className="border-l-2 border-muted pl-3">
          <p className="text-sm font-medium mb-1">Pedido solicitado:</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium capitalize">{compromiso.pedido.tipo}</span> - {compromiso.pedido.descripcion}
          </p>
          <Badge variant="outline" className="text-xs mt-1">
            Estado: {compromiso.pedido.estado}
          </Badge>
        </div>

        {/* Tu oferta */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm font-medium mb-1 flex items-center gap-2">
            {getEstadoIcon()}
            Tu oferta:
          </p>
          <p className="text-sm text-muted-foreground">
            {compromiso.descripcion}
          </p>
          <p className="text-sm font-medium text-green-600 mt-2">
            {formatOfertaValor()}
          </p>
        </div>

        {/* Fecha */}
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
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
