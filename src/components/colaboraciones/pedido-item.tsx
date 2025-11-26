"use client";

/**
 * Item individual de pedido con botón para hacer oferta
 */

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Package, Users } from "lucide-react";

interface PedidoItemProps {
  pedido: {
    id: string;
    tipo: string;
    descripcion: string;
    estado: string;
    ya_oferto?: boolean;
    monto?: number | null;
    moneda?: string | null;
    cantidad?: number | null;
    unidad?: string | null;
  };
  onHacerOferta: () => void;
  showOfertaButton?: boolean;
}

export function PedidoItem({
  pedido,
  onHacerOferta,
  showOfertaButton = true,
}: PedidoItemProps) {
  // Estado badge color
  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "PENDIENTE":
        return "secondary";
      case "COMPROMETIDO":
        return "default";
      case "COMPLETADO":
        return "outline";
      default:
        return "secondary";
    }
  };

  // Icono según tipo de pedido
  const getTipoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case "monetario":
        return <DollarSign className="h-4 w-4" />;
      case "recurso":
        return <Package className="h-4 w-4" />;
      case "mano de obra":
        return <Users className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {getTipoIcon(pedido.tipo)}
            <span className="font-medium text-sm">{pedido.tipo}</span>
          </div>
          <Badge variant={getEstadoBadgeVariant(pedido.estado)}>
            {pedido.estado}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-3">
          {pedido.descripcion}
        </p>

        {/* Detalles del pedido */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {pedido.monto && (
            <span>
              {pedido.moneda} {pedido.monto.toLocaleString("es-AR")}
            </span>
          )}
          {pedido.cantidad && (
            <span>
              {pedido.cantidad} {pedido.unidad}
            </span>
          )}
        </div>
      </CardContent>

      {showOfertaButton && pedido.estado === "PENDIENTE" && (
        <CardFooter className="pt-0">
          <Button
            size="sm"
            className="w-full"
            onClick={onHacerOferta}
            disabled={pedido.ya_oferto}
          >
            {pedido.ya_oferto ? "Ya ofertaste" : "Hacer Oferta"}
          </Button>
        </CardFooter>
      )}

      {pedido.ya_oferto && pedido.estado === "PENDIENTE" && (
        <CardFooter className="pt-0">
          <p className="text-xs text-muted-foreground w-full text-center">
            Ya enviaste una oferta para este pedido.
          </p>
        </CardFooter>
      )}

      {pedido.estado === "COMPROMETIDO" && (
        <CardFooter className="pt-0">
          <p className="text-xs text-muted-foreground w-full text-center">
            Ya tiene una oferta aceptada
          </p>
        </CardFooter>
      )}

      {pedido.estado === "COMPLETADO" && (
        <CardFooter className="pt-0">
          <p className="text-xs text-green-600 w-full text-center">
            ✓ Completado
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
