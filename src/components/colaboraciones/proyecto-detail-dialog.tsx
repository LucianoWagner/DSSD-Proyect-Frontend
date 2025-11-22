"use client";

/**
 * Diálogo para mostrar detalle de un proyecto con sus etapas y pedidos
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Folder, Calendar, AlertCircle } from "lucide-react";
import { useGetProjectDetail } from "@/hooks/colaboraciones/use-get-project-detail";
import { PedidoItem } from "./pedido-item";
import { CrearOfertaDialog } from "./crear-oferta-dialog";
import { formatDate } from "@/lib/utils";
import type { PedidoBasic } from "@/types/colaboraciones";

interface ProyectoDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | null;
}

export function ProyectoDetailDialog({
  open,
  onOpenChange,
  projectId,
}: ProyectoDetailDialogProps) {
  const { data: proyecto, isLoading, error } = useGetProjectDetail(projectId);
  const [selectedPedido, setSelectedPedido] = useState<PedidoBasic | null>(
    null
  );
  const [ofertaDialogOpen, setOfertaDialogOpen] = useState(false);

  const handleHacerOferta = (pedido: PedidoBasic) => {
    setSelectedPedido(pedido);
    setOfertaDialogOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error al cargar el proyecto. Intenta de nuevo.
              </AlertDescription>
            </Alert>
          )}

          {proyecto && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-2">
                  <DialogTitle className="text-xl">
                    {proyecto.titulo}
                  </DialogTitle>
                  <Badge>{proyecto.estado.replace("_", " ")}</Badge>
                </div>
                <DialogDescription asChild>
                  <div className="space-y-2 text-sm">
                    <p>{proyecto.descripcion}</p>
                    <div className="flex flex-wrap gap-3 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {proyecto.ciudad}, {proyecto.provincia}
                      </span>
                      <span className="flex items-center gap-1">
                        <Folder className="h-3 w-3" />
                        {proyecto.tipo}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(proyecto.created_at)}
                      </span>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="pedidos" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
                  <TabsTrigger value="etapas">Etapas</TabsTrigger>
                </TabsList>

                {/* Tab de Pedidos */}
                <TabsContent value="pedidos" className="space-y-4 mt-4">
                  {proyecto.etapas.length === 0 && (
                    <Alert>
                      <AlertDescription>
                        Este proyecto aún no tiene etapas definidas.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {proyecto.etapas.map((etapa: any) => (
                    <div key={etapa.id} className="space-y-3">
                      <h3 className="font-medium text-sm flex items-center gap-2">
                        <span className="text-primary">●</span>
                        {etapa.nombre}
                      </h3>

                      {etapa.pedidos.length === 0 ? (
                        <p className="text-sm text-muted-foreground pl-4">
                          No hay pedidos en esta etapa
                        </p>
                      ) : (
                        <div className="grid gap-3 pl-4">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {etapa.pedidos.map((pedido: any) => (
                            <PedidoItem
                              key={pedido.id}
                              pedido={pedido}
                              onHacerOferta={() => handleHacerOferta(pedido)}
                              showOfertaButton={pedido.estado === "PENDIENTE"}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {proyecto.etapas.every((e: any) => e.pedidos.length === 0) && (
                    <Alert>
                      <AlertDescription>
                        Este proyecto no tiene pedidos pendientes en este
                        momento.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                {/* Tab de Etapas */}
                <TabsContent value="etapas" className="space-y-4 mt-4">
                  {proyecto.etapas.length === 0 ? (
                    <Alert>
                      <AlertDescription>
                        Este proyecto aún no tiene etapas definidas.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    proyecto.etapas.map((etapa: any, index: number) => (
                      <div
                        key={etapa.id}
                        className="rounded-lg border p-4 space-y-2"
                      >
                        <div>
                          <h3 className="font-medium">
                            {index + 1}. {etapa.nombre}
                          </h3>
                        </div>

                        {etapa.descripcion && (
                          <p className="text-sm text-muted-foreground">
                            {etapa.descripcion}
                          </p>
                        )}

                        <div className="flex gap-4 text-xs text-muted-foreground">
                          {etapa.fecha_inicio && (
                            <span>
                              Inicio: {formatDate(etapa.fecha_inicio)}
                            </span>
                          )}
                          {etapa.fecha_fin && (
                            <span>Fin: {formatDate(etapa.fecha_fin)}</span>
                          )}
                        </div>

                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Pedidos:
                          </span>{" "}
                          {etapa.pedidos.length}
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de crear oferta */}
      {selectedPedido && (
        <CrearOfertaDialog
          open={ofertaDialogOpen}
          onOpenChange={setOfertaDialogOpen}
          pedido={selectedPedido}
          proyectoTitulo={proyecto?.titulo}
        />
      )}
    </>
  );
}
