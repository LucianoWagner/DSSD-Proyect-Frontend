"use client";

import {
    BarChart3,
    CheckCircle2,
    Clock,
    Download,
    FileText,
    HandHeart,
    TrendingUp,
    Users,
    AlertTriangle,
    Check,
    X,
} from "lucide-react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    BarChart,
    Bar,
    Cell,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    useCommitmentsMetrics,
    usePerformanceMetrics,
} from "@/hooks/metrics/use-metrics";
import { cn } from "@/lib/utils";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export default function ReportsPage() {
    const { data: commitments, isLoading: loadingCommitments } = useCommitmentsMetrics();
    const { data: performance, isLoading: loadingPerformance } = usePerformanceMetrics();

    // Datos simulados para gráficos de tendencia (ya que la API devuelve snapshots actuales)
    const trendData = [
        { month: "Ene", valor: 45 },
        { month: "Feb", valor: 52 },
        { month: "Mar", valor: 48 },
        { month: "Abr", valor: 61 },
        { month: "May", valor: 55 },
        { month: "Jun", valor: 67 },
    ];

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="container mx-auto space-y-8 p-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Reportes Ejecutivos
                    </h1>
                    <p className="text-muted-foreground">
                        Análisis detallado de rendimiento y participación comunitaria.
                    </p>
                </div>
                <Button onClick={handlePrint} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar PDF
                </Button>
            </div>

            <Tabs defaultValue="commitments" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="commitments" className="gap-2">
                        <HandHeart className="h-4 w-4" />
                        Compromisos
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Rendimiento
                    </TabsTrigger>
                </TabsList>

                {/* Tab: Compromisos */}
                <TabsContent value="commitments" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Solicitado
                                </CardTitle>
                                <span className="text-muted-foreground">$</span>
                            </CardHeader>
                            <CardContent>
                                {loadingCommitments ? (
                                    <Skeleton className="h-8 w-24" />
                                ) : (
                                    <div className="text-2xl font-bold">
                                        ${commitments?.valor_total_solicitado?.toLocaleString()}
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Valor monetario total
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Comprometido
                                </CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                {loadingCommitments ? (
                                    <Skeleton className="h-8 w-24" />
                                ) : (
                                    <div className="text-2xl font-bold text-green-600">
                                        ${commitments?.valor_total_comprometido?.toLocaleString()}
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Ofertas aceptadas
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Tasa de Cobertura
                                </CardTitle>
                                <BarChart3 className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                {loadingCommitments ? (
                                    <Skeleton className="h-8 w-24" />
                                ) : (
                                    <div className="text-2xl font-bold text-blue-600">
                                        {commitments?.cobertura_ofertas_porcentaje?.toFixed(1)}%
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Del valor solicitado
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Tasa de Aceptación
                                </CardTitle>
                                <Users className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                {loadingCommitments ? (
                                    <Skeleton className="h-8 w-24" />
                                ) : (
                                    <div className="text-2xl font-bold text-purple-600">
                                        {commitments?.tasa_aceptacion_porcentaje?.toFixed(1)}%
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Ofertas exitosas
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-7">
                        <Card className="md:col-span-4">
                            <CardHeader>
                                <CardTitle>Top Contribuidores</CardTitle>
                                <CardDescription>
                                    Usuarios y ONGs con mayor impacto en la red.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loadingCommitments ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-12 w-full" />
                                        <Skeleton className="h-12 w-full" />
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {commitments?.top_contribuidores?.map((contributor, i) => (
                                            <div
                                                key={contributor.user_id}
                                                className="flex items-center justify-between space-x-4"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700">
                                                        {i + 1}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium leading-none">
                                                            {contributor.nombre} {contributor.apellido}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {contributor.ong}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div className="text-right">
                                                        <p className="font-medium">
                                                            {contributor.ofertas_realizadas} ofertas
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {contributor.ofertas_aceptadas} aceptadas
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            contributor.tasa_aceptacion > 50
                                                                ? "default"
                                                                : "secondary"
                                                        }
                                                    >
                                                        {contributor.tasa_aceptacion.toFixed(0)}% éxito
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                        {(!commitments?.top_contribuidores ||
                                            commitments.top_contribuidores.length === 0) && (
                                                <div className="py-8 text-center text-muted-foreground">
                                                    No hay datos de contribuidores aún.
                                                </div>
                                            )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-3">
                            <CardHeader>
                                <CardTitle>Resumen de Actividad</CardTitle>
                                <CardDescription>
                                    Métricas clave de interacción.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Pedidos totales</span>
                                        <span className="font-medium">
                                            {commitments?.total_pedidos}
                                        </span>
                                    </div>
                                    <Separator />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Pedidos con ofertas
                                        </span>
                                        <span className="font-medium">
                                            {commitments?.pedidos_con_ofertas}
                                        </span>
                                    </div>
                                    <Separator />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Ofertas pendientes
                                        </span>
                                        <span className="font-medium text-amber-600">
                                            {commitments?.ofertas_pendientes}
                                        </span>
                                    </div>
                                    <Separator />
                                </div>


                                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                                    <h4 className="mb-2 text-sm font-semibold">Insight</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Una tasa de aceptación del{" "}
                                        <span className="font-medium text-slate-900 dark:text-slate-100">
                                            {commitments?.tasa_aceptacion_porcentaje?.toFixed(0)}%
                                        </span>{" "}
                                        indica que las ofertas están bien alineadas con las
                                        necesidades de los proyectos.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tab: Rendimiento */}
                <TabsContent value="performance" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Tiempo Promedio por Etapa
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingPerformance ? (
                                    <Skeleton className="h-10 w-20" />
                                ) : (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold">
                                            {performance?.tiempo_promedio_etapa_dias}
                                        </span>
                                        <span className="text-sm text-muted-foreground">días</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Tiempo Inicio Promedio
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingPerformance ? (
                                    <Skeleton className="h-10 w-20" />
                                ) : (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold">
                                            {performance?.tiempo_inicio_promedio_dias}
                                        </span>
                                        <span className="text-sm text-muted-foreground">días</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Resolución Observaciones
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingPerformance ? (
                                    <Skeleton className="h-10 w-20" />
                                ) : (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold">
                                            {Math.abs(performance?.tiempo_resolucion_observaciones_promedio_dias ?? 0).toFixed(1)}
                                        </span>
                                        <span className="text-sm text-muted-foreground">días</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Estado de Observaciones</CardTitle>
                                <CardDescription>
                                    Salud del proceso de revisión y calidad.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {loadingPerformance ? (
                                    <Skeleton className="h-[200px] w-full" />
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Total Observaciones</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Histórico completo
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-2xl font-bold">
                                                {performance?.observaciones_total}
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    <span className="text-sm">Resueltas</span>
                                                </div>
                                                <span className="font-medium">
                                                    {performance?.observaciones_resueltas}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full bg-green-500"
                                                    style={{
                                                        width: `${((performance?.observaciones_resueltas ?? 0) /
                                                            (performance?.observaciones_total || 1)) *
                                                            100
                                                            }%`,
                                                    }}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-amber-500" />
                                                    <span className="text-sm">Pendientes</span>
                                                </div>
                                                <span className="font-medium">
                                                    {performance?.observaciones_pendientes}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full bg-amber-500"
                                                    style={{
                                                        width: `${((performance?.observaciones_pendientes ?? 0) /
                                                            (performance?.observaciones_total || 1)) *
                                                            100
                                                            }%`,
                                                    }}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                                    <span className="text-sm">Vencidas</span>
                                                </div>
                                                <span className="font-medium text-red-600">
                                                    {performance
                                                        ? Math.max(
                                                            0,
                                                            performance.observaciones_total -
                                                            (performance.observaciones_pendientes + performance.observaciones_resueltas)
                                                        )
                                                        : 0}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full bg-red-500"
                                                    style={{
                                                        width: `${((Math.max(
                                                            0,
                                                            (performance?.observaciones_total ?? 0) -
                                                            ((performance?.observaciones_pendientes ?? 0) + (performance?.observaciones_resueltas ?? 0))
                                                        )) /
                                                            (performance?.observaciones_total || 1)) *
                                                            100
                                                            }%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Cuellos de Botella</CardTitle>
                                <CardDescription>
                                    Áreas que requieren atención inmediata.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loadingPerformance ? (
                                    <Skeleton className="h-[200px] w-full" />
                                ) : (
                                    <div className="space-y-4">
                                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-500" />
                                                <div>
                                                    <h4 className="font-medium text-amber-900 dark:text-amber-400">
                                                        Proyectos Estancados
                                                    </h4>
                                                    <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                                                        Hay{" "}
                                                        <span className="font-bold">
                                                            {performance?.proyectos_pendientes_mas_30_dias}
                                                        </span>{" "}
                                                        proyectos que han estado pendientes por más de 30
                                                        días.
                                                    </p>

                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border p-4">
                                            <h4 className="mb-2 font-medium">Eficiencia Global</h4>
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1">
                                                    <p className="text-xs text-muted-foreground">
                                                        Tiempo de inicio
                                                    </p>
                                                    <p className="text-lg font-bold">
                                                        {performance?.tiempo_inicio_promedio_dias}d
                                                    </p>
                                                </div>
                                                <div className="h-8 w-px bg-border" />
                                                <div className="flex-1">
                                                    <p className="text-xs text-muted-foreground">
                                                        Tiempo por etapa
                                                    </p>
                                                    <p className="text-lg font-bold">
                                                        {performance?.tiempo_promedio_etapa_dias}d
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
