"use client";

import {
    Clock,
    Download,
    FileText,
    HandHeart,
    TrendingUp,
    AlertTriangle,
    Check,
} from "lucide-react";

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

const pedidoTipoLabels: Record<string, string> = {
    economico: "Económico",
    materiales: "Materiales",
    mano_obra: "Mano de obra",
    transporte: "Transporte",
    equipamiento: "Equipamiento",
};

export default function ReportsPage() {
    const { data: commitments, isLoading: loadingCommitments } = useCommitmentsMetrics();
    const { data: performance, isLoading: loadingPerformance } = usePerformanceMetrics();

    const pedidoTipos = ["economico", "materiales", "mano_obra", "transporte", "equipamiento"];
    const pedidosPorTipo = pedidoTipos
        .map((tipo) => ({
            key: tipo,
            name: pedidoTipoLabels[tipo] ?? tipo,
            value: commitments?.pedidos_por_tipo?.[tipo] ?? 0,
        }))
        .filter((item) => item.value > 0);

    const coberturaPorTipo = pedidoTipos
        .map((tipo) => ({
            key: tipo,
            name: pedidoTipoLabels[tipo] ?? tipo,
            value: commitments?.cobertura_por_tipo?.[tipo] ?? 0,
        }))
        .filter((item) => item.value > 0);

    const distribucionPedidos = pedidoTipos
        .map((tipo) => ({
            key: tipo,
            name: pedidoTipoLabels[tipo] ?? tipo,
            value: performance?.distribucion_pedidos_por_tipo?.[tipo] ?? 0,
        }))
        .filter((item) => item.value > 0);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="container mx-auto space-y-8 p-6">
            {/* Header */}
            <div className="rounded-3xl border-2 border-gradient bg-gradient-to-br from-slate-900/5 via-blue-50/10 to-cyan-50/10 p-8 backdrop-blur-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            <p className="text-xs uppercase tracking-[0.3em] font-semibold text-blue-600">Análisis Profundo</p>
                        </div>
                        <h1 className="text-4xl font-bold leading-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                            Reportes Ejecutivos
                        </h1>
                        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                            Análisis detallado de rendimiento operativo, participación comunitaria y métricas de impacto del portafolio.
                        </p>
                    </div>
                    <Button onClick={handlePrint} className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 whitespace-nowrap">
                        <Download className="h-4 w-4" />
                        Exportar PDF
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="commitments" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:w-auto gap-2 bg-slate-100 p-2 rounded-lg">
                    <TabsTrigger value="commitments" className="gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <HandHeart className="h-4 w-4" />
                        Compromisos
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <TrendingUp className="h-4 w-4" />
                        Rendimiento
                    </TabsTrigger>
                </TabsList>

                {/* Tab: Compromisos */}
                <TabsContent value="commitments" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/30 shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xs uppercase font-semibold text-purple-700">
                                    Pedidos totales
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingCommitments ? (
                                    <Skeleton className="h-10 w-32" />
                                ) : (
                                    <>
                                        <div className="text-3xl font-bold text-purple-900">
                                            {commitments?.total_pedidos ?? 0}
                                        </div>
                                        <p className="text-xs text-purple-600 mt-2 font-medium">
                                            Pedidos registrados en el portafolio
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100/30 shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xs uppercase font-semibold text-green-700">
                                    Cobertura de ofertas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingCommitments ? (
                                    <Skeleton className="h-10 w-32" />
                                ) : (
                                    <>
                                        <div className="text-3xl font-bold text-green-900">
                                            {commitments?.cobertura_ofertas_porcentaje?.toFixed(1) ?? 0}%
                                        </div>
                                        <p className="text-xs text-green-600 mt-2 font-medium">
                                            Con oferta: {commitments?.pedidos_con_ofertas ?? 0} pedidos
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/30 shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xs uppercase font-semibold text-blue-700">
                                    Tasa de aceptación
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingCommitments ? (
                                    <Skeleton className="h-10 w-32" />
                                ) : (
                                    <>
                                        <div className="text-3xl font-bold text-blue-900">
                                            {commitments?.tasa_aceptacion_porcentaje?.toFixed(1) ?? 0}%
                                        </div>
                                        <p className="text-xs text-blue-600 mt-2 font-medium">
                                            Ofertas aceptadas vs. totales
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100/30 shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xs uppercase font-semibold text-pink-700">
                                    Tiempo de respuesta
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingCommitments ? (
                                    <Skeleton className="h-10 w-32" />
                                ) : (
                                    <>
                                        <div className="text-3xl font-bold text-pink-900">
                                            {commitments?.tiempo_respuesta_promedio_dias ?? 0}d
                                        </div>
                                        <p className="text-xs text-pink-600 mt-2 font-medium">
                                            Promedio de la comunidad
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-7">
                        <Card className="md:col-span-4 border-2 border-slate-200 shadow-md">
                            <CardHeader>
                                <CardTitle className="text-xl">Top Contribuidores</CardTitle>
                                <CardDescription>
                                    Integrantes más activos de la red comunitaria.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loadingCommitments ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-16 w-full rounded-lg" />
                                        <Skeleton className="h-16 w-full rounded-lg" />
                                        <Skeleton className="h-16 w-full rounded-lg" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {commitments?.top_contribuidores?.map((contributor, i) => (
                                            <div
                                                key={contributor.user_id}
                                                className="flex items-center justify-between rounded-lg border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-transparent p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white text-sm ${
                                                        i === 0 ? "bg-gradient-to-r from-yellow-400 to-yellow-500" :
                                                        i === 1 ? "bg-gradient-to-r from-slate-400 to-slate-500" :
                                                        i === 2 ? "bg-gradient-to-r from-orange-400 to-orange-500" :
                                                        "bg-blue-500"
                                                    }`}>
                                                        {i + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold leading-none truncate">
                                                            {contributor.nombre} {contributor.apellido}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {contributor.ong}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    className={`ml-4 whitespace-nowrap ${
                                                        contributor.tasa_aceptacion > 60
                                                            ? "bg-green-500 text-white"
                                                            : contributor.tasa_aceptacion > 40
                                                            ? "bg-blue-500 text-white"
                                                            : "bg-orange-500 text-white"
                                                    }`}
                                                >
                                                    {contributor.tasa_aceptacion.toFixed(0)}%
                                                </Badge>
                                            </div>
                                        ))}
                                        {(!commitments?.top_contribuidores ||
                                            commitments.top_contribuidores.length === 0) && (
                                                <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-8 text-center text-sm text-muted-foreground">
                                                    <p className="font-medium">Sin contribuidores</p>
                                                    <p className="text-xs mt-1">Las ofertas aparecerán aquí cuando se registren.</p>
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
                                {loadingCommitments ? (
                                    <Skeleton className="h-[200px] w-full" />
                                ) : (
                                    <>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Tiempo de respuesta promedio</span>
                                                <span className="font-medium">
                                                    {commitments?.tiempo_respuesta_promedio_dias ?? 0} días
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Tasa de aceptación</span>
                                                <span className="font-medium">
                                                    {commitments?.tasa_aceptacion_porcentaje?.toFixed(1) ?? 0}%
                                                </span>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-2">
                                            <h4 className="text-sm font-semibold">Pedidos por tipo</h4>
                                            {pedidosPorTipo.length === 0 ? (
                                                <p className="text-xs text-muted-foreground">Sin desglose por tipo aún.</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {pedidosPorTipo.map((item) => (
                                                        <div key={item.key} className="flex items-center justify-between rounded-md border bg-slate-50 px-3 py-2 text-sm">
                                                            <span className="text-muted-foreground">{item.name}</span>
                                                            <span className="font-semibold">{item.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="text-sm font-semibold">Cobertura por tipo</h4>
                                            {coberturaPorTipo.length === 0 ? (
                                                <p className="text-xs text-muted-foreground">No hay cobertura por tipo reportada.</p>
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
                                                                    className="h-full rounded-full bg-blue-500"
                                                                    style={{ width: `${Math.min(item.value ?? 0, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
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

                                        {performance?.tasa_cumplimiento_observaciones !== undefined && (
                                            <div className="flex items-center justify-between rounded-lg border p-3">
                                                <span className="text-sm text-muted-foreground">Cumplimiento</span>
                                                <span className="text-lg font-semibold">
                                                    {performance.tasa_cumplimiento_observaciones.toFixed(1)}%
                                                </span>
                                            </div>
                                        )}

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
                                                    {performance?.observaciones_vencidas ?? 0}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full bg-red-500"
                                                    style={{
                                                        width: `${((performance?.observaciones_vencidas ?? 0) /
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

                                        <div className="rounded-lg border p-4">
                                            <h4 className="mb-2 font-medium">Tiempo respuesta pedidos</h4>
                                            <p className="text-lg font-bold">
                                                {performance?.tiempo_respuesta_promedio_pedido_dias ?? 0} días
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Promedio desde creación hasta completado.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Distribución de pedidos</CardTitle>
                                <CardDescription>Tipos de pedidos gestionados.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loadingPerformance ? (
                                    <Skeleton className="h-[200px] w-full" />
                                ) : distribucionPedidos.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No hay pedidos registrados por tipo.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {distribucionPedidos.map((item) => (
                                            <div key={item.key} className="flex items-center justify-between rounded-md border bg-slate-50 px-3 py-2 text-sm">
                                                <span className="text-muted-foreground">{item.name}</span>
                                                <span className="font-semibold">{item.value}</span>
                                            </div>
                                        ))}
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
