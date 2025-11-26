"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  LineChart,
  ShieldCheck,
  Target,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  useDashboardMetrics,
  useCommitmentsMetrics,
  usePerformanceMetrics,
} from "@/hooks/metrics/use-metrics";
import { cn } from "@/lib/utils";

const projectStateConfig: ChartConfig = {
  pendiente: { label: "Pendiente", color: "#f59e0b" },
  en_ejecucion: { label: "En ejecución", color: "#3b82f6" },
  finalizado: { label: "Finalizado", color: "#10b981" },
};

const observacionesConfig: ChartConfig = {
  pendientes: { label: "Pendientes", color: "#f59e0b" },
  resueltas: { label: "Resueltas", color: "#10b981" },
  vencidas: { label: "Vencidas", color: "#ef4444" },
};

const pedidoTipoLabels: Record<string, string> = {
  economico: "Económico",
  materiales: "Materiales",
  mano_obra: "Mano de obra",
  transporte: "Transporte",
  equipamiento: "Equipamiento",
};

const pedidoTipoConfig: ChartConfig = {
  economico: { label: "Económico", color: "#6366f1" },
  materiales: { label: "Materiales", color: "#22c55e" },
  mano_obra: { label: "Mano de obra", color: "#f97316" },
  transporte: { label: "Transporte", color: "#06b6d4" },
  equipamiento: { label: "Equipamiento", color: "#a855f7" },
};

function StatTile({
  title,
  value,
  helper,
  icon,
  accent,
  loading,
}: {
  title: string;
  value: string | number;
  helper?: string;
  icon: React.ReactNode;
  accent?: "blue" | "green" | "amber";
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-200">
        <CardHeader className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-3 w-32" />
        </CardHeader>
      </Card>
    );
  }

  const accentConfig = {
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
      icon: "bg-blue-100 text-blue-700",
      border: "border-blue-200",
    },
    green: {
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
      icon: "bg-emerald-100 text-emerald-700",
      border: "border-emerald-200",
    },
    amber: {
      bg: "bg-gradient-to-br from-amber-50 to-amber-100/50",
      icon: "bg-amber-100 text-amber-700",
      border: "border-amber-200",
    },
  };

  const config = accentConfig[accent || "blue"];

  return (
    <Card className={cn("border-2 transition-all hover:shadow-lg", config.bg, config.border)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
          <h3 className="text-4xl font-bold leading-tight">{value}</h3>
          {helper && <p className="text-xs text-muted-foreground pt-1">{helper}</p>}
        </div>
        <div className={cn("rounded-xl p-3", config.icon)}>{icon}</div>
      </CardHeader>
    </Card>
  );
}

export default function MetricsResumenPage() {
  const { data: dashboard, isLoading: loadingDashboard } = useDashboardMetrics();
  const { data: commitments, isLoading: loadingCommitments } = useCommitmentsMetrics();
  const { data: performance, isLoading: loadingPerformance } = usePerformanceMetrics();

  const projectsByState = [
    {
      key: "pendiente",
      name: "Pendiente",
      value: dashboard?.proyectos_por_estado?.pendiente ?? 0,
      fill: "var(--color-pendiente)",
    },
    {
      key: "en_ejecucion",
      name: "En ejecución",
      value: dashboard?.proyectos_por_estado?.en_ejecucion ?? 0,
      fill: "var(--color-en_ejecucion)",
    },
    {
      key: "finalizado",
      name: "Finalizado",
      value: dashboard?.proyectos_por_estado?.finalizado ?? 0,
      fill: "var(--color-finalizado)",
    },
  ];

  const observacionesVencidas = performance?.observaciones_vencidas ?? 0;

  const observacionesData = [
    {
      name: "Pendientes",
      value: performance?.observaciones_pendientes ?? 0,
      key: "pendientes",
    },
    { name: "Resueltas", value: performance?.observaciones_resueltas ?? 0, key: "resueltas" },
    {
      name: "Vencidas",
      value: observacionesVencidas,
      key: "vencidas",
    },
  ];

  const pedidoTipos = ["economico", "materiales", "mano_obra", "transporte", "equipamiento"];
  const pedidosPorTipo = pedidoTipos
    .map((tipo) => ({
      name: pedidoTipoLabels[tipo] ?? tipo,
      key: tipo,
      value: commitments?.pedidos_por_tipo?.[tipo] ?? 0,
    }))
    .filter((item) => item.value > 0);

  const coberturaPorTipo = pedidoTipos
    .map((tipo) => ({
      name: pedidoTipoLabels[tipo] ?? tipo,
      key: tipo,
      value: commitments?.cobertura_por_tipo?.[tipo] ?? 0,
    }))
    .filter((item) => item.value > 0);

  const topContributors = commitments?.top_contribuidores ?? [];
  const proyectosEnRiesgo = dashboard?.proyectos_en_riesgo ?? 0;
  const velocidadCompletacion = dashboard?.velocidad_completacion;
  const tasaCumplimiento = performance?.tasa_cumplimiento_observaciones;

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="rounded-3xl border-2 border-gradient bg-gradient-to-br from-slate-900/5 via-blue-50/10 to-cyan-50/10 p-8 backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <p className="text-xs uppercase tracking-[0.3em] font-semibold text-blue-600">Dashboard en Vivo</p>
            </div>
            <h1 className="text-4xl font-bold leading-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Centro de Control
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Visión integral de la salud del portafolio, rendimiento operativo y participación comunitaria. Todos los datos actualizados en tiempo real.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild className="gap-2">
              <Link href="/metricas/reportes">
                <BarChart3 className="h-4 w-4" />
                Reportes
              </Link>
            </Button>
            <Button asChild className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
              <Link href="/metricas/proyectos">
                <ArrowUpRight className="h-4 w-4" />
                Ver Proyectos
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatTile
          title="Proyectos Totales"
          value={dashboard?.total_proyectos ?? 0}
          helper="Portafolio completo"
          icon={<Activity className="h-6 w-6" />}
          loading={loadingDashboard}
        />
        <StatTile
          title="En Ejecución"
          value={dashboard?.proyectos_activos ?? 0}
          helper="Activos en este momento"
          icon={<ShieldCheck className="h-6 w-6" />}
          accent="blue"
          loading={loadingDashboard}
        />
        <StatTile
          title="Completados"
          value={dashboard?.proyectos_por_estado?.finalizado ?? 0}
          helper="Exitosamente cerrados"
          icon={<Target className="h-6 w-6" />}
          accent="green"
          loading={loadingDashboard}
        />
        <StatTile
          title="Tasa de Éxito"
          value={`${dashboard?.tasa_exito?.toFixed(1) ?? "0.0"}%`}
          helper="Completados vs. totales"
          icon={<LineChart className="h-6 w-6" />}
          accent="amber"
          loading={loadingDashboard}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-2 border-slate-200 shadow-md">
          <CardHeader className="flex items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-xl">Estado del Portafolio</CardTitle>
              <CardDescription>Distribución de proyectos por estado actual.</CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">Actualizado</Badge>
          </CardHeader>
          <CardContent>
            {loadingDashboard ? (
              <Skeleton className="h-72 w-full rounded-lg" />
            ) : (
              <ChartContainer config={projectStateConfig} className="h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={projectsByState} barSize={48} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 13 }} />
                    <Tooltip content={<ChartTooltipContent />} cursor={{ fill: "rgba(59, 130, 246, 0.1)" }} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="value" radius={[12, 12, 4, 4]} fill="#3b82f6">
                      {projectsByState.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={
                            projectStateConfig[entry.key as keyof typeof projectStateConfig]?.color ||
                            "#3b82f6"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-200 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Revisiones y Observaciones</CardTitle>
            <CardDescription>Estado actual del proceso de revisión de calidad.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {loadingPerformance ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : (
              <ChartContainer config={observacionesConfig} className="h-64 w-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={observacionesData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                    >
                      {observacionesData.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={
                            observacionesConfig[entry.key as keyof typeof observacionesConfig]?.color ||
                            "#3b82f6"
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-3">
                <p className="text-xs font-semibold text-blue-700 uppercase">Tiempo Promedio</p>
                <p className="text-xl font-bold text-blue-900">
                  {Math.abs(performance?.tiempo_resolucion_observaciones_promedio_dias ?? 0).toFixed(1)}
                  <span className="text-xs font-normal ml-1">días</span>
                </p>
              </div>
              <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-3">
                <p className="text-xs font-semibold text-purple-700 uppercase">Total</p>
                <p className="text-xl font-bold text-purple-900">{performance?.observaciones_total ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-2 border-slate-200 shadow-md">
          <CardHeader className="flex items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-xl">Pedidos y cobertura por tipo</CardTitle>
              <CardDescription>Distribución de pedidos y su nivel de cobertura.</CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-base px-3 py-1">
              {commitments?.cobertura_ofertas_porcentaje?.toFixed(0) ?? 0}% cubierto
            </Badge>
          </CardHeader>
          <CardContent>
            {loadingCommitments ? (
              <Skeleton className="h-72 w-full rounded-lg" />
            ) : (
              <>
                {pedidosPorTipo.length === 0 ? (
                  <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                    Sin datos de pedidos por tipo.
                  </div>
                ) : (
                  <ChartContainer config={pedidoTipoConfig} className="h-72 w-full">
                    <ResponsiveContainer>
                      <BarChart
                        data={pedidosPorTipo}
                        barSize={48}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "#6b7280", fontSize: 13 }}
                        />
                        <Tooltip content={<ChartTooltipContent />} cursor={{ fill: "rgba(147, 51, 234, 0.06)" }} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="value" radius={[12, 12, 4, 4]}>
                          {pedidosPorTipo.map((entry) => (
                            <Cell
                              key={entry.key}
                              fill={
                                pedidoTipoConfig[entry.key as keyof typeof pedidoTipoConfig]?.color ||
                                "var(--chart-1)"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </>
            )}

            <div className="mt-6 space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border-2 border-cyan-200 bg-cyan-50 p-4 text-sm">
                  <p className="text-xs font-semibold text-cyan-700 uppercase">Cobertura de Pedidos</p>
                  <p className="text-xl font-bold text-cyan-900 mt-1">
                    {commitments?.pedidos_con_ofertas ?? 0} / {commitments?.total_pedidos ?? 0}
                  </p>
                </div>
                <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 text-sm">
                  <p className="text-xs font-semibold text-green-700 uppercase">Aceptación</p>
                  <p className="text-xl font-bold text-green-900 mt-1">
                    {commitments?.tasa_aceptacion_porcentaje?.toFixed(1) ?? 0}%
                  </p>
                </div>
                <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4 text-sm">
                  <p className="text-xs font-semibold text-orange-700 uppercase">Respuesta Prom.</p>
                  <p className="text-xl font-bold text-orange-900 mt-1">
                    {commitments?.tiempo_respuesta_promedio_dias ?? 0} días
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-800">Cobertura por tipo</p>
                {loadingCommitments ? (
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ) : coberturaPorTipo.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Aún no hay cobertura discriminada por tipo.</p>
                ) : (
                  <div className="space-y-2">
                    {coberturaPorTipo.map((item) => (
                      <div key={item.key}>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{item.name}</span>
                          <span className="font-semibold text-slate-900">{item.value?.toFixed?.(0) ?? 0}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(item.value ?? 0, 100)}%`,
                              backgroundColor:
                                pedidoTipoConfig[item.key as keyof typeof pedidoTipoConfig]?.color || "#3b82f6",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-200 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Top Contribuidores</CardTitle>
            <CardDescription>Integrantes más activos de la red.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingCommitments ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : topContributors.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-muted-foreground">
                <p className="font-medium">Sin datos de contribuidores</p>
                <p className="text-xs mt-1">Las ofertas aparecerán aquí cuando se registren.</p>
              </div>
            ) : (
              topContributors.slice(0, 5).map((contribuidor, idx) => (
                <div
                  key={contribuidor.user_id}
                  className="rounded-lg border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-transparent p-3 text-sm hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-700">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold leading-tight truncate">
                            {contribuidor.nombre} {contribuidor.apellido}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{contribuidor.ong}</p>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs whitespace-nowrap">
                      {contribuidor.tasa_aceptacion?.toFixed(0) ?? 0}%
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card className="border-2 border-slate-200 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Eficiencia Operativa</CardTitle>
            <CardDescription>Métricas de velocidad y tiempos críticos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingPerformance ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4">
                  <p className="text-xs font-semibold text-indigo-700 uppercase">Promedio por Etapa</p>
                  <p className="text-2xl font-bold text-indigo-900 mt-1">
                    {performance?.tiempo_promedio_etapa_dias ?? 0}
                    <span className="text-sm font-normal ml-2">días</span>
                  </p>
                </div>
                <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
                  <p className="text-xs font-semibold text-red-700 uppercase">Tiempo Inicio</p>
                  <p className="text-2xl font-bold text-red-900 mt-1">
                    {performance?.tiempo_inicio_promedio_dias ?? 0}
                    <span className="text-sm font-normal ml-2">días</span>
                  </p>
                </div>
                <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
                  <p className="text-xs font-semibold text-orange-700 uppercase">Riesgo general</p>
                  <p className="text-2xl font-bold text-orange-900 mt-1">
                    {proyectosEnRiesgo}
                    <span className="text-sm font-normal ml-2">en riesgo</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pendientes &gt;30d: {performance?.proyectos_pendientes_mas_30_dias ?? 0}
                  </p>
                  {velocidadCompletacion !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      Velocidad de completación: {velocidadCompletacion?.toFixed?.(2) ?? 0} proj/sem
                    </p>
                  )}
                </div>
                <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold text-emerald-700 uppercase">Tiempo respuesta pedido</p>
                  <p className="text-2xl font-bold text-emerald-900 mt-1">
                    {performance?.tiempo_respuesta_promedio_pedido_dias ?? 0}
                    <span className="text-sm font-normal ml-2">días</span>
                  </p>
                  {tasaCumplimiento !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      Cumplimiento observaciones: {tasaCumplimiento?.toFixed?.(0) ?? 0}%
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
