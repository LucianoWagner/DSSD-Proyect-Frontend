"use client";

/**
 * Página de Mis Compromisos (ofertas enviadas)
 * Solo visible para usuarios MEMBER (ONGs)
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFilteredCompromisos, useGetCompromisosStats } from "@/hooks/colaboraciones/use-get-mis-compromisos";
import { CompromisoCard } from "@/components/colaboraciones/compromiso-card";
import { ConfirmarRealizacionDialog } from "@/components/colaboraciones/confirmar-realizacion-dialog";
import { EmptyState } from "@/components/colaboraciones/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { EstadoPedido, EstadoOferta } from "@/types/colaboraciones";

type TabValue = "todos" | "pendientes" | "aceptadas" | "completadas" | "rechazadas";

export default function CompromisosPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabValue>("todos");
  const [selectedOfertaId, setSelectedOfertaId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPedidoDesc, setSelectedPedidoDesc] = useState("");

  // Get stats para badges
  const stats = useGetCompromisosStats();

  // Filters based on active tab
  const getFilters = (tab: TabValue): { estadoPedido?: EstadoPedido; estadoOferta?: EstadoOferta } => {
    switch (tab) {
      case "pendientes":
        return { estadoOferta: "pendiente" };
      case "aceptadas":
        return { estadoPedido: "COMPROMETIDO" as EstadoPedido };
      case "completadas":
        return { estadoPedido: "COMPLETADO" as EstadoPedido };
      case "rechazadas":
        return { estadoOferta: "rechazada" };
      default:
        return {};
    }
  };

  const filters = getFilters(activeTab);
  const { data: compromisos, isLoading, error } = useFilteredCompromisos(
    filters.estadoPedido,
    filters.estadoOferta
  );

  const handleConfirmar = (ofertaId: string, pedidoDesc: string) => {
    setSelectedOfertaId(ofertaId);
    setSelectedPedidoDesc(pedidoDesc);
    setConfirmDialogOpen(true);
  };

  const handleVerProyecto = (projectId: string) => {
    router.push(`/proyectos/${projectId}`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Mis Compromisos</h1>
        <p className="text-muted-foreground">
          Gestiona las ofertas que has enviado a otros proyectos
        </p>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar compromisos. Por favor, intenta de nuevo.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="todos">
            Todos
            {stats.total > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.total}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pendientes">
            Pendientes
            {stats.pendientes > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.pendientes}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="aceptadas">
            Aceptadas
            {stats.aceptadas > 0 && (
              <Badge variant="default" className="ml-2">
                {stats.aceptadas}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completadas">
            Completadas
            {stats.completadas > 0 && (
              <Badge variant="outline" className="ml-2">
                {stats.completadas}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rechazadas">
            Rechazadas
            {stats.rechazadas > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.rechazadas}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Loading state */}
        {isLoading && (
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[200px]" />
            ))}
          </div>
        )}

        {/* Tabs content */}
        {["todos", "pendientes", "aceptadas", "completadas", "rechazadas"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            {!isLoading && compromisos && compromisos.length === 0 && (
              <EmptyState
                type={tab === "todos" ? "no-compromisos" : "no-compromisos-filter"}
                onAction={
                  tab === "todos"
                    ? () => router.push("/colaboraciones")
                    : undefined
                }
                actionLabel={tab === "todos" ? "Explorar Proyectos" : undefined}
              />
            )}

            {!isLoading && compromisos && compromisos.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {compromisos.map((compromiso) => (
                  <CompromisoCard
                    key={compromiso.id}
                    compromiso={compromiso}
                    onConfirmar={
                      compromiso.estado === "aceptada" &&
                      compromiso.pedido.estado === "COMPROMETIDO"
                        ? () =>
                            handleConfirmar(
                              compromiso.id,
                              `${compromiso.pedido.tipo} - ${compromiso.pedido.descripcion}`
                            )
                        : undefined
                    }
                    onVerProyecto={
                      compromiso.pedido.proyecto
                        ? () =>
                            handleVerProyecto(compromiso.pedido.proyecto!.id)
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Diálogo de confirmación */}
      {selectedOfertaId && (
        <ConfirmarRealizacionDialog
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          ofertaId={selectedOfertaId}
          pedidoDescripcion={selectedPedidoDesc}
        />
      )}
    </div>
  );
}
