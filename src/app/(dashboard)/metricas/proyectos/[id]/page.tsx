"use client";

import { use } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Flag,
  Gauge,
  MapPin,
  Package,
  ClipboardList,
  Target,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import { useGetProjectDetail } from "@/hooks/colaboraciones/use-get-project-detail";
import { useProjectTrackingMetrics } from "@/hooks/metrics/use-metrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltipContent } from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";

interface PageProps {
  params: Promise<{ id: string }>;
}

const estadoLabel: Record<string, string> = {
  pendiente: "Pendiente",
  en_ejecucion: "En ejecución",
  finalizado: "Finalizado",
};

const estadoColor: Record<string, string> = {
  pendiente: "border-amber-200 bg-amber-50 text-amber-900",
  en_ejecucion: "border-blue-200 bg-blue-50 text-blue-900",
  finalizado: "border-emerald-200 bg-emerald-50 text-emerald-900",
};

const etapaChartConfig: ChartConfig = {
  completados: { label: "Completados", color: "var(--chart-2)" },
  pendientes: { label: "Pendientes", color: "var(--chart-1)" },
};

const observacionesConfig: ChartConfig = {
  pendientes: { label: "Pendientes", color: "var(--chart-1)" },
  resueltas: { label: "Resueltas", color: "var(--chart-2)" },
  vencidas: { label: "Vencidas", color: "var(--chart-5)" },
};

const etapaEstadoConfig: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  pendiente: {
    label: "Pendiente",
    className: "border-amber-200 bg-amber-50 text-amber-900",
  },
  financiada: {
    label: "Financiada",
    className: "border-blue-200 bg-blue-50 text-blue-900",
  },
  esperando_ejecucion: {
    label: "Esperando ejecución",
    className: "border-cyan-200 bg-cyan-50 text-cyan-900",
  },
  en_ejecucion: {
    label: "En ejecución",
    className: "border-amber-200 bg-amber-50 text-amber-900",
  },
  completada: {
    label: "Completada",
    className: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
  bloqueada: {
    label: "Bloqueada",
    className: "border-red-200 bg-red-50 text-red-800",
  },
};

const pedidoEstadoConfig: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  pendiente: {
    label: "Pendiente",
    className: "border-amber-200 bg-amber-50 text-amber-900",
  },
  comprometido: {
    label: "Comprometido",
    className: "border-blue-200 bg-blue-50 text-blue-900",
  },
  completado: {
    label: "Completado",
    className: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
};

const normalizeEstado = (estado?: string | null) => estado?.toLowerCase?.() ?? "";

export default function ProyectoMetricsDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: proyecto, isLoading: loadingProyecto } = useGetProjectDetail(id);
  const {
    data: tracking,
    isLoading: loadingMetrics,
  } = useProjectTrackingMetrics(id);

  const etapasMetrics = (tracking?.etapas ?? []).map((etapa) => ({
    name: etapa.nombre,
    completados: etapa.pedidos_completados,
    pendientes: etapa.pedidos_pendientes,
  }));

  const observacionesData = [
    { name: "Pendientes", value: tracking?.observaciones_pendientes ?? 0, key: "pendientes" },
    { name: "Resueltas", value: tracking?.observaciones_resueltas ?? 0, key: "resueltas" },
    { name: "Vencidas", value: tracking?.observaciones_vencidas ?? 0, key: "vencidas" },
  ];

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-slate-50 to-transparent p-6">
        {loadingProyecto ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
        ) : (
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-600">Council · Proyecto</p>
              <h1 className="text-3xl font-semibold leading-tight text-slate-900">
                {proyecto?.titulo}
              </h1>
              <p className="text-sm text-muted-foreground">
                {proyecto?.descripcion}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {proyecto?.ciudad ? `${proyecto.ciudad}, ${proyecto.provincia}` : proyecto?.provincia || proyecto?.pais}
                </span>
                {proyecto?.estado && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <Badge
                      variant="outline"
                      className={estadoColor[proyecto.estado] ?? "border-muted bg-muted/40"}
                    >
                      {estadoLabel[proyecto.estado] ?? proyecto.estado}
                    </Badge>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Creado</p>
              <p className="font-medium">
                {proyecto?.created_at
                  ? format(new Date(proyecto.created_at), "dd MMM yyyy", { locale: es })
                  : "-"}
              </p>
              <p className="text-muted-foreground">Última actualización</p>
              <p className="font-medium">
                {proyecto?.updated_at
                  ? format(new Date(proyecto.updated_at), "dd MMM yyyy", { locale: es })
                  : "-"}
              </p>
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="datos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="datos">Datos</TabsTrigger>
          <TabsTrigger value="metricas">Métricas</TabsTrigger>
        </TabsList>

        <TabsContent value="datos" className="space-y-6">
          {loadingProyecto ? (
            <Card>
              <CardContent className="space-y-3 py-6">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-56" />
                <Skeleton className="h-5 w-64" />
              </CardContent>
            </Card>
          ) : !proyecto ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No encontramos datos del proyecto.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Ficha rápida</CardTitle>
                <CardDescription>Resumen de ubicación, estado y descripción.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Ubicación</p>
                  <p className="text-sm font-medium">
                    {proyecto.ciudad ? `${proyecto.ciudad}, ${proyecto.provincia}` : proyecto.provincia || proyecto.pais}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <p className="text-sm font-medium">{estadoLabel[proyecto.estado] ?? proyecto.estado}</p>
                </div>
                <div className="rounded-lg border p-4 md:col-span-2">
                  <p className="text-xs text-muted-foreground">Descripción</p>
                  <p className="text-sm text-muted-foreground">{proyecto.descripcion}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Etapas + pedidos detail in Datos */}
          <Card>
            <CardHeader className="flex items-center justify-between space-y-0">
              <div>
                <CardTitle>Etapas y pedidos</CardTitle>
                <CardDescription>Estado de cada etapa y pedidos asociados.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingProyecto ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-56" />
                </div>
              ) : !proyecto?.etapas?.length ? (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Este proyecto aún no tiene etapas registradas.
                </div>
              ) : (
                <div className="space-y-4">
                  {proyecto.etapas.map((etapa, idx) => {
                    const estadoEtapa = normalizeEstado(etapa.estado);
                    const estadoCfg = etapaEstadoConfig[estadoEtapa] ?? etapaEstadoConfig.pendiente;
                    const pedidos = etapa.pedidos ?? [];

                    return (
                      <div key={etapa.id} className="rounded-xl border p-4 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-semibold">{etapa.nombre}</h3>
                                <Badge variant="outline" className={estadoCfg.className}>
                                  {estadoCfg.label}
                                </Badge>
                              </div>
                              {etapa.descripcion && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{etapa.descripcion}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Flag className="h-4 w-4" />
                              <span>
                                {etapa.fecha_inicio
                                  ? format(new Date(etapa.fecha_inicio), "dd MMM yyyy", { locale: es })
                                  : "-"}{" "}
                                →{" "}
                                {etapa.fecha_fin
                                  ? format(new Date(etapa.fecha_fin), "dd MMM yyyy", { locale: es })
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
                          <div className="rounded-lg border bg-muted/30 p-3">
                            <p className="text-xs text-muted-foreground">Pedidos totales</p>
                            <p className="text-lg font-semibold">{pedidos.length}</p>
                          </div>
                          <div className="rounded-lg border bg-muted/30 p-3">
                            <p className="text-xs text-muted-foreground">Pedidos completados</p>
                            <p className="text-lg font-semibold">
                              {pedidos.filter((p) => normalizeEstado(p.estado) === "completado").length}
                            </p>
                          </div>
                          <div className="rounded-lg border bg-muted/30 p-3">
                            <p className="text-xs text-muted-foreground">Pedidos pendientes</p>
                            <p className="text-lg font-semibold">
                              {pedidos.filter((p) => normalizeEstado(p.estado) === "pendiente").length}
                            </p>
                          </div>
                        </div>

                        {pedidos.length > 0 && (
                          <div className="mt-4 space-y-2 rounded-lg border p-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <ClipboardList className="h-4 w-4" />
                              Pedidos
                            </div>
                            <div className="space-y-2">
                              {pedidos.map((pedido) => {
                                const estadoPedido = normalizeEstado(pedido.estado);
                                const pedidoCfg = pedidoEstadoConfig[estadoPedido] ?? pedidoEstadoConfig.pendiente;

                                return (
                                  <div
                                    key={pedido.id}
                                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-card/50 p-2"
                                  >
                                    <div className="flex items-center gap-2 text-sm">
                                      <Package className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">{pedido.tipo}</span>
                                      <span className="text-muted-foreground">{pedido.descripcion}</span>
                                    </div>
                                    <Badge variant="outline" className={pedidoCfg.className}>
                                      {pedidoCfg.label}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metricas" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricTile
              title="Progreso global"
              value={`${tracking?.progreso_global_porcentaje?.toFixed?.(0) ?? 0}%`}
              icon={<Gauge className="h-5 w-5" />}
              loading={loadingMetrics}
            />
            <MetricTile
              title="Pedidos completados"
              value={`${tracking?.pedidos_completados ?? 0}/${tracking?.total_pedidos ?? 0}`}
              helper="Aporta para habilitar etapas"
              icon={<CheckCircle2 className="h-5 w-5" />}
              loading={loadingMetrics}
            />
            <MetricTile
              title="Observaciones pendientes"
              value={tracking?.observaciones_pendientes ?? 0}
              helper="Requieren respuesta"
              icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
              loading={loadingMetrics}
            />
            <MetricTile
              title="Puede iniciar"
              value={tracking?.puede_iniciar ? "Sí" : "No"}
              helper="Pedidos sin pendientes"
              icon={<Flag className="h-5 w-5" />}
              loading={loadingMetrics}
            />
          </div>

          <Card>
            <CardHeader className="flex items-center justify-between space-y-0">
              <div>
                <CardTitle>Etapas y pedidos</CardTitle>
                <CardDescription>Completados vs pendientes por etapa.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {loadingMetrics ? (
                <Skeleton className="h-64 w-full" />
              ) : etapasMetrics.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No hay etapas registradas para este proyecto.
                </div>
              ) : (
                <ChartContainer config={etapaChartConfig} className="h-64 w-full">
                  <ResponsiveContainer>
                    <BarChart data={etapasMetrics} barGap={8}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="pendientes" stackId="a">
                        {etapasMetrics.map((_, idx) => (
                          <Cell key={`p-${idx}`} fill="var(--color-pendientes)" />
                        ))}
                      </Bar>
                      <Bar dataKey="completados" stackId="a">
                        {etapasMetrics.map((_, idx) => (
                          <Cell key={`c-${idx}`} fill="var(--color-completados)" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between space-y-0">
              <div>
                <CardTitle>Observaciones</CardTitle>
                <CardDescription>Pendientes vs resueltas y vencidas.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2 rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Tiempo promedio por etapa</p>
                <p className="text-lg font-semibold">
                  {tracking?.tiempo_promedio_etapa_dias ?? 0} días
                </p>
                <p className="text-xs text-muted-foreground">Pedidos pendientes</p>
                <p className="text-lg font-semibold">
                  {tracking?.pedidos_pendientes ?? 0}
                </p>
              </div>
              <div className="space-y-3 rounded-lg border p-4">
                <ChartContainer config={observacionesConfig} className="h-48 w-full">
                  <ResponsiveContainer>
                    <BarChart data={observacionesData} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value">
                        {observacionesData.map((entry, idx) => (
                          <Cell
                            key={entry.key}
                            fill={
                              observacionesConfig[entry.key as keyof typeof observacionesConfig]?.color ||
                              `var(--chart-${idx + 1})`
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricTile({
  title,
  value,
  helper,
  icon,
  loading,
}: {
  title: string;
  value: string | number;
  helper?: string;
  icon: React.ReactNode;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-20" />
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-semibold leading-tight">{value}</h3>
          {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
        </div>
        <div className="rounded-full bg-blue-50 p-2 text-blue-700">{icon}</div>
      </CardHeader>
    </Card>
  );
}
