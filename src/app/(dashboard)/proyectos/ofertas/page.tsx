"use client";

import { useEffect, useMemo, useState } from "react";
import { useListProjects } from "@/hooks/colaboraciones/use-list-projects";
import type { ProjectListFilters, OfertaWithUser } from "@/types/colaboraciones";
import { useListProjectPedidos } from "@/hooks/use-list-project-pedidos";
import {
  useEvaluateOferta,
  useGetPedidoOfertas,
} from "@/hooks/colaboraciones/use-create-oferta";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

const pedidoEstadoOptions = [
  { label: "Todos los pedidos", value: "all" },
  { label: "Pendientes", value: "PENDIENTE" },
  { label: "Comprometidos", value: "COMPROMETIDO" },
  { label: "Completados", value: "COMPLETADO" },
];

export default function OfertasRecibidasPage() {
  const [projectFilters] = useState<ProjectListFilters>({
    page: 1,
    page_size: 50,
    my_projects: true,
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null);
  const [pedidoEstado, setPedidoEstado] = useState<string>("all");

  const { data: projectsData, isLoading: isProjectsLoading, error: projectsError } = useListProjects(
    projectFilters
  );
  const projects = useMemo(() => projectsData?.items ?? [], [projectsData?.items]);

  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const {
    data: pedidos,
    isLoading: isPedidosLoading,
    error: pedidosError,
  } = useListProjectPedidos(selectedProjectId, pedidoEstado === "all" ? undefined : pedidoEstado);

  useEffect(() => {
    if (pedidos && pedidos.length > 0) {
      const hasSelectedPedido = pedidos.some((pedido) => pedido.id === selectedPedidoId);
      if (!hasSelectedPedido) {
        setSelectedPedidoId(pedidos[0].id);
      }
    } else {
      setSelectedPedidoId(null);
    }
  }, [pedidos, selectedPedidoId]);

  const {
    data: ofertas,
    isLoading: isOfertasLoading,
    error: ofertasError,
    refetch: refetchOfertas,
  } = useGetPedidoOfertas(selectedPedidoId);

  const evaluateOferta = useEvaluateOferta();

  const selectedPedido = useMemo(
    () => pedidos?.find((pedido) => pedido.id === selectedPedidoId),
    [pedidos, selectedPedidoId]
  );

  const formatOfertaValor = (oferta: OfertaWithUser) => {
    if (!selectedPedido) {
      return oferta.monto_ofrecido ?? "Sin dato";
    }

    const tipo = (selectedPedido.tipo || "").toLowerCase();
    const monto = oferta.monto_ofrecido;

    if (tipo === "economico") {
      if (monto === undefined || monto === null) return "Monto no especificado";
      const currency = (selectedPedido.moneda as string | undefined) || "ARS";
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(monto);
    }

    if (monto === undefined || monto === null) {
      return "Cantidad no especificada";
    }

    const unidad = selectedPedido.unidad ?? "";
    return `${monto}${unidad ? ` ${unidad}` : ""}`;
  };

  const handleEvaluate = (ofertaId: string, decision: "accept" | "reject") => {
    evaluateOferta.mutate(
      { ofertaId, decision },
      {
        onSuccess: () => {
          refetchOfertas();
        },
      }
    );
  };

  const renderOfferActions = (oferta: OfertaWithUser) => {
    if (oferta.estado !== "pendiente") {
      return null;
    }

    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => handleEvaluate(oferta.id, "accept")}
          disabled={evaluateOferta.isPending}
        >
          {evaluateOferta.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2 h-4 w-4" />
          )}
          Aceptar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleEvaluate(oferta.id, "reject")}
          disabled={evaluateOferta.isPending}
        >
          {evaluateOferta.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="mr-2 h-4 w-4" />
          )}
          Rechazar
        </Button>
      </div>
    );
  };

  const renderOfferState = (estado: string) => {
    const normalized = estado.toLowerCase();
    let variant: "secondary" | "default" | "outline" = "secondary";
    if (normalized === "aceptada") variant = "default";
    if (normalized === "rechazada") variant = "outline";
    return <Badge variant={variant}>{estado}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ofertas Recibidas</h1>
        <p className="text-muted-foreground">
          Revisa y gestiona las ofertas que otras organizaciones han enviado a tus proyectos.
        </p>
      </div>

      {(projectsError || pedidosError || ofertasError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ocurrió un error al cargar la información. Refresca la página o inténtalo más tarde.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seleccioná un proyecto</CardTitle>
              <CardDescription>
                Tienes {projects.length} proyecto{projects.length === 1 ? "" : "s"} activos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isProjectsLoading ? (
                <div className="py-4 text-sm text-muted-foreground">Cargando proyectos...</div>
              ) : projects.length === 0 ? (
                <div className="py-4 text-sm text-muted-foreground">
                  Aún no tienes proyectos. Crea uno para recibir ofertas.
                </div>
              ) : (
                <Select
                  value={selectedProjectId ?? undefined}
                  onValueChange={setSelectedProjectId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Pedidos</CardTitle>
                  <CardDescription>Filtra por estado para priorizar</CardDescription>
                </div>
                <Select value={pedidoEstado} onValueChange={setPedidoEstado}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pedidoEstadoOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[420px] px-6">
                {isPedidosLoading ? (
                  <div className="py-6 text-sm text-muted-foreground">Cargando pedidos...</div>
                ) : !pedidos || pedidos.length === 0 ? (
                  <div className="py-6 text-sm text-muted-foreground">
                    {selectedProjectId
                      ? "Este proyecto no tiene pedidos con el estado seleccionado."
                      : "Selecciona un proyecto para ver sus pedidos."}
                  </div>
                ) : (
                  <div className="space-y-3 py-4">
                    {pedidos.map((pedido) => {
                      const isActive = pedido.id === selectedPedidoId;
                      return (
                        <button
                          key={pedido.id}
                          onClick={() => setSelectedPedidoId(pedido.id)}
                          className={`w-full rounded-lg border p-4 text-left transition ${
                            isActive
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium">{pedido.descripcion}</p>
                              <p className="text-xs text-muted-foreground">
                                {pedido.tipo} · Creado {pedido.created_at ? formatDate(pedido.created_at) : "sin fecha"}
                              </p>
                            </div>
                            <Badge variant="outline" className="uppercase">
                              {pedido.estado}
                            </Badge>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ofertas del pedido seleccionado</CardTitle>
              <CardDescription>
                {selectedPedido
                  ? `Gestiona las ofertas para "${selectedPedido.descripcion}"`
                  : "Selecciona un pedido para ver sus ofertas"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedPedidoId && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {selectedProjectId
                    ? "No hay pedidos disponibles con el estado seleccionado."
                    : "Comienza eligiendo un proyecto para ver sus ofertas."}
                </div>
              )}

              {selectedPedidoId && isOfertasLoading && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Cargando ofertas...
                </div>
              )}

              {selectedPedidoId && !isOfertasLoading && ofertas && ofertas.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Aún no recibiste ofertas para este pedido.
                </div>
              )}

              {selectedPedidoId && !isOfertasLoading && ofertas && ofertas.length > 0 && (
                <div className="space-y-4">
                  {ofertas.map((oferta) => (
                    <div
                      key={oferta.id}
                      className="rounded-lg border p-4 space-y-3"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold">
                            {oferta.user?.nombre} {oferta.user?.apellido} · {oferta.user?.ong}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Enviada el {oferta.created_at ? formatDate(oferta.created_at) : "sin fecha"}
                          </p>
                        </div>
                        {renderOfferState(oferta.estado)}
                      </div>

                      <p className="text-sm text-muted-foreground">{oferta.descripcion}</p>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock3 className="h-4 w-4" />
                          {oferta.updated_at ? `Actualizada ${formatDate(oferta.updated_at)}` : "Sin actualización"}
                        </div>
                        <div className="font-semibold">
                          {formatOfertaValor(oferta)}
                        </div>
                      </div>

                      {renderOfferActions(oferta)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
