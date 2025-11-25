"use client";

import type { ReactNode } from "react";
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
import { Separator } from "@/components/ui/separator";
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
  pendiente: { label: "Pendiente", color: "var(--chart-1)" },
  en_ejecucion: { label: "En ejecución", color: "var(--chart-2)" },
  finalizado: { label: "Finalizado", color: "var(--chart-3)" },
};

const observacionesConfig: ChartConfig = {
  pendientes: { label: "Pendientes", color: "var(--chart-1)" },
  resueltas: { label: "Resueltas", color: "var(--chart-2)" },
  vencidas: { label: "Vencidas", color: "var(--chart-5)" },
};

const commitmentsConfig: ChartConfig = {
  solicitado: { label: "Solicitado", color: "var(--chart-1)" },
  comprometido: { label: "Comprometido", color: "var(--chart-2)" },
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
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-20" />
        </CardHeader>
      </Card>
    );
  }

  const accentBg =
    accent === "green"
      ? "bg-emerald-50 text-emerald-800"
      : accent === "amber"
        ? "bg-amber-50 text-amber-800"
        : "bg-blue-50 text-blue-800";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-semibold leading-tight">{value}</h3>
          {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
        </div>
        <div className={cn("rounded-full p-2", accentBg)}>{icon}</div>
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

  const observacionesData = [
    {
      name: "Pendientes",
      value: performance?.observaciones_pendientes ?? 0,
      key: "pendientes",
    },
    { name: "Resueltas", value: performance?.observaciones_resueltas ?? 0, key: "resueltas" },
    { name: "Vencidas", value: performance?.observaciones_vencidas ?? 0, key: "vencidas" },
  ];

  const monetaryCoverage = [
    {
      name: "Solicitado",
      value: commitments?.valor_total_solicitado ?? 0,
      key: "solicitado",
    },
    {
      name: "Comprometido",
      value: commitments?.valor_total_comprometido ?? 0,
      key: "comprometido",
    },
  ];

  const topContributors = commitments?.top_contribuidores ?? [];

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-slate-50 to-transparent p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600">Council</p>
            <h1 className="text-3xl font-semibold leading-tight text-slate-900">
              Tablero de métricas en vivo
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Salud del portafolio, rendimiento operativo y adopción de la comunidad en una sola vista.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <a href="/metricas/reportes">
                <BarChart3 className="mr-2 h-4 w-4" />
                Reportes
              </a>
            </Button>
            <Button asChild>
              <a href="/metricas/por-ong">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Ver por ONG
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatTile
          title="Proyectos totales"
          value={dashboard?.total_proyectos ?? 0}
          helper="Portfolio completo"
          icon={<Activity className="h-5 w-5" />}
          loading={loadingDashboard}
        />
        <StatTile
          title="Activos"
          value={dashboard?.proyectos_activos ?? 0}
          helper="En ejecución ahora"
          icon={<ShieldCheck className="h-5 w-5" />}
          accent="blue"
          loading={loadingDashboard}
        />
        <StatTile
          title="Listos para iniciar"
          value={dashboard?.proyectos_listos_para_iniciar ?? 0}
          helper="Sin bloqueos pendientes"
          icon={<Target className="h-5 w-5" />}
          accent="amber"
          loading={loadingDashboard}
        />
        <StatTile
          title="Tasa de éxito"
          value={`${dashboard?.tasa_exito?.toFixed(1) ?? "0.0"}%`}
          helper="Finalizados / totales"
          icon={<LineChart className="h-5 w-5" />}
          accent="green"
          loading={loadingDashboard}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between space-y-0">
            <div>
              <CardTitle>Proyectos por estado</CardTitle>
              <CardDescription>Distribución global y volumen actualizado.</CardDescription>
            </div>
            <Badge variant="outline">Realtime</Badge>
          </CardHeader>
          <CardContent>
            {loadingDashboard ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <ChartContainer config={projectStateConfig} className="h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={projectsByState} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="value" radius={[8, 8, 4, 4]}>
                      {projectsByState.map((entry, index) => (
                        <Cell
                          key={entry.key}
                          fill={
                            projectStateConfig[entry.key as keyof typeof projectStateConfig]?.color ||
                            `var(--chart-${index + 1})`
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

        <Card>
          <CardHeader>
            <CardTitle>Observaciones</CardTitle>
            <CardDescription>Pendientes vs resueltas y vencidas.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {loadingPerformance ? (
              <Skeleton className="h-64 w-full" />
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
                      paddingAngle={4}
                    >
                      {observacionesData.map((entry, index) => (
                        <Cell
                          key={entry.key}
                          fill={
                            observacionesConfig[entry.key as keyof typeof observacionesConfig]?.color ||
                            `var(--chart-${index + 1})`
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
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Tiempo prom. resolución</p>
                <p className="text-lg font-semibold">
                  {performance?.tiempo_resolucion_observaciones_promedio_dias ?? 0} días
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Observaciones totales</p>
                <p className="text-lg font-semibold">{performance?.observaciones_total ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between space-y-0">
            <div>
              <CardTitle>Cobertura de compromisos</CardTitle>
              <CardDescription>Solicitado vs comprometido y tasa de aceptación.</CardDescription>
            </div>
            <Badge variant="outline">
              {commitments?.cobertura_ofertas_porcentaje?.toFixed(0) ?? 0}% cobertura
            </Badge>
          </CardHeader>
          <CardContent>
            {loadingCommitments ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <ChartContainer config={commitmentsConfig} className="h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={monetaryCoverage} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="value" radius={[8, 8, 4, 4]}>
                      {monetaryCoverage.map((entry, index) => (
                        <Cell
                          key={entry.key}
                          fill={
                            commitmentsConfig[entry.key as keyof typeof commitmentsConfig]?.color ||
                            `var(--chart-${index + 1})`
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border p-3 text-sm">
                <p className="text-xs text-muted-foreground">Pedidos con ofertas</p>
                <p className="text-lg font-semibold">
                  {commitments?.pedidos_con_ofertas ?? 0} / {commitments?.total_pedidos ?? 0}
                </p>
              </div>
              <div className="rounded-lg border p-3 text-sm">
                <p className="text-xs text-muted-foreground">Tasa de aceptación</p>
                <p className="text-lg font-semibold">
                  {commitments?.tasa_aceptacion_porcentaje?.toFixed(1) ?? 0}%
                </p>
              </div>
              <div className="rounded-lg border p-3 text-sm">
                <p className="text-xs text-muted-foreground">Resp. promedio</p>
                <p className="text-lg font-semibold">
                  {commitments?.tiempo_respuesta_promedio_dias ?? 0} días
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top contribuidores</CardTitle>
            <CardDescription>Aportantes con más ofertas y aceptaciones.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingCommitments ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : topContributors.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Aún no hay ofertas registradas.
              </div>
            ) : (
              topContributors.slice(0, 5).map((contribuidor) => (
                <div
                  key={contribuidor.user_id}
                  className="rounded-lg border p-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium leading-tight">
                        {contribuidor.nombre} {contribuidor.apellido}
                      </p>
                      <p className="text-xs text-muted-foreground">{contribuidor.ong}</p>
                    </div>
                    <Badge variant="secondary">
                      {contribuidor.tasa_aceptacion?.toFixed(0) ?? 0}% aceptación
                    </Badge>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Ofertas: {contribuidor.ofertas_realizadas}</span>
                    <span>Aceptadas: {contribuidor.ofertas_aceptadas}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Performance operativo</CardTitle>
            <CardDescription>Tiempos y cuellos de botella.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {loadingPerformance ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-40" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tiempo promedio por etapa</span>
                  <span className="font-medium">
                    {performance?.tiempo_promedio_etapa_dias ?? 0} días
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Inicio promedio</span>
                  <span className="font-medium">
                    {performance?.tiempo_inicio_promedio_dias ?? 0} días
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pendientes &gt; 30 días</span>
                  <span className="font-medium">
                    {performance?.proyectos_pendientes_mas_30_dias ?? 0} proyectos
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Próximos pasos sugeridos</CardTitle>
            <CardDescription>Acciones rápidas basadas en las métricas.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">Refuerzo de cobertura</p>
              <p className="text-xs text-muted-foreground">
                Dirigí campañas hacia pedidos sin ofertas para mejorar la cobertura y aceptación.
              </p>
              <Button className="mt-3" variant="outline" size="sm" asChild>
                <a href="/colaboraciones">Ver pedidos sin oferta</a>
              </Button>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">Proyectos estancados</p>
              <p className="text-xs text-muted-foreground">
                Prioriza los proyectos pendientes &gt; 30 días para subirlos a ejecución.
              </p>
              <Button className="mt-3" size="sm" asChild>
                <a href="/proyectos">Gestionar pendientes</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
