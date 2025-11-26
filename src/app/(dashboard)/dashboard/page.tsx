"use client";

import { useMemo } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
	CheckCircle2,
	FileText,
	Flag,
	FolderOpen,
	Activity,
	PlusCircle,
	Rocket,
	ShieldCheck,
	Target,
	BarChart3,
  AlertTriangle,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useListProjects } from "@/hooks/colaboraciones/use-list-projects";
import { useListObservaciones } from "@/hooks/observaciones/use-list-observaciones";
import { useObservacionStats } from "@/hooks/observaciones/use-observacion-stats";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardMetrics, useCommitmentsMetrics, usePerformanceMetrics } from "@/hooks/metrics/use-metrics";
import type { ProyectoBasic } from "@/types/colaboraciones";
import type { ObservacionWithRelations } from "@/types/observaciones";

type StatCardProps = {
	title: string;
	value: number | string;
	subtitle?: string;
	icon: React.ReactNode;
	accent?: "blue" | "green" | "orange";
	loading?: boolean;
};

type ProjectState = "pendiente" | "en_ejecucion" | "finalizado" | string;

const stateCopy: Record<ProjectState, string> = {
	pendiente: "Pendiente",
	en_ejecucion: "En ejecución",
	finalizado: "Finalizado",
};

const stateAccent: Record<ProjectState, string> = {
	pendiente: "bg-amber-100 text-amber-900 border-amber-200",
	en_ejecucion: "bg-blue-100 text-blue-900 border-blue-200",
	finalizado: "bg-emerald-100 text-emerald-900 border-emerald-200",
};

function StatCard({ title, value, subtitle, icon, accent = "blue", loading }: StatCardProps) {
	if (loading) {
		return (
			<Card className="border-dashed">
				<CardHeader className="space-y-2">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-8 w-20" />
					<Skeleton className="h-4 w-24" />
				</CardHeader>
			</Card>
		);
	}

	const accentClasses =
		accent === "green"
			? "text-emerald-700 bg-emerald-50"
			: accent === "orange"
				? "text-amber-700 bg-amber-50"
				: "text-blue-700 bg-blue-50";

	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
				<div className="space-y-1">
					<p className="text-sm text-muted-foreground">{title}</p>
					<div className="text-3xl font-semibold leading-none tracking-tight">{value}</div>
					{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
				</div>
				<div className={`rounded-full p-2 ${accentClasses}`}>{icon}</div>
			</CardHeader>
		</Card>
	);
}

function ProjectListItem({ project }: { project: ProyectoBasic }) {
	const updated = formatDistanceToNow(new Date(project.updated_at), { addSuffix: true, locale: es });
	const badgeStyle =
		stateAccent[project.estado] ??
		"bg-slate-100 text-slate-900 border-slate-200";

	const progress =
		project.estado === "finalizado"
			? 100
			: project.estado === "en_ejecucion"
				? 65
				: 20;

	return (
		<Card className="border-border/70">
			<CardHeader className="space-y-2 pb-3">
				<div className="flex items-start justify-between gap-3">
					<div className="space-y-1">
						<CardTitle className="text-base leading-tight">{project.titulo}</CardTitle>
						<p className="text-sm text-muted-foreground">
							{project.ciudad ? `${project.ciudad}, ${project.provincia}` : project.provincia || project.pais}
						</p>
					</div>
					<Badge className={`border ${badgeStyle}`}>{stateCopy[project.estado] ?? project.estado}</Badge>
				</div>
				<div className="space-y-2">
					<Progress value={progress} />
					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<span>Actividad reciente</span>
						<span>{updated}</span>
					</div>
				</div>
			</CardHeader>
		</Card>
	);
}

function ObservacionItem({ obs }: { obs: ObservacionWithRelations }) {
	const deadline = format(new Date(obs.fecha_limite), "dd MMM", { locale: es });
	const urgency =
		obs.estado === "vencida"
			? "text-red-600 bg-red-50"
			: "text-amber-700 bg-amber-50";

	return (
		<div className="flex items-start justify-between gap-3 rounded-lg border border-border/60 p-3">
			<div className="space-y-1">
				<div className="flex items-center gap-2 text-sm font-medium">
					<FileText className="h-4 w-4 text-blue-600" />
					<span>{obs.proyecto?.titulo ?? "Proyecto"}</span>
				</div>
				<p className="text-sm text-muted-foreground line-clamp-2">{obs.descripcion}</p>
				<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
					<span>Consejo: {obs.council_user?.nombre ?? "N/A"}</span>
					<Separator orientation="vertical" className="h-4" />
					<span>Fecha límite: {deadline}</span>
				</div>
			</div>
			<Badge variant="secondary" className={`shrink-0 ${urgency}`}>
				{obs.estado === "vencida" ? "Vencida" : "Pendiente"}
			</Badge>
		</div>
	);
}

export default function DashboardPage() {
	const { user } = useAuth();

	const {
		data: projectsData,
		isLoading: isLoadingProjects,
	} = useListProjects({
		my_projects: true,
		page_size: 50,
		sort_by: "updated_at",
		sort_order: "desc",
	});

	const { data: pendingObservaciones, isLoading: isLoadingPendingObs } = useListObservaciones({
		estado: "pendiente",
		page_size: 5,
		sort_by: "fecha_limite",
		sort_order: "asc",
	});

	const { data: recentObservaciones, isLoading: isLoadingRecentObs } = useListObservaciones({
		page_size: 4,
		sort_by: "created_at",
		sort_order: "desc",
	});

	const {
		data: observacionStats,
		isLoading: isLoadingObservacionStats,
	} = useObservacionStats();

	const projects = projectsData?.items ?? [];

	const projectCounts = useMemo(() => {
		return projects.reduce(
			(acc, project) => {
				if (project.estado === "en_ejecucion") acc.enEjecucion += 1;
				if (project.estado === "pendiente") acc.pendientes += 1;
				if (project.estado === "finalizado") acc.finalizados += 1;
				acc.total += 1;
				return acc;
			},
			{ total: 0, enEjecucion: 0, pendientes: 0, finalizados: 0 }
		);
	}, [projects]);

	const activeProjects = projects.filter((p) => p.estado === "en_ejecucion").slice(0, 3);
	const pipelineProjects = projects.filter((p) => p.estado === "pendiente").slice(0, 3);

	const pendingObsItems = pendingObservaciones?.items ?? [];
	const recentObsItems = recentObservaciones?.items ?? [];

	const isMember = user?.role === "MEMBER";
	const isCouncil = user?.role === "COUNCIL";

	const { data: dashboardMetrics, isLoading: loadingDashboardMetrics } = useDashboardMetrics();
	const { data: commitmentsMetrics, isLoading: loadingCommitmentsMetrics } = useCommitmentsMetrics();
	const { data: performanceMetrics, isLoading: loadingPerformanceMetrics } = usePerformanceMetrics();

	if (isCouncil) {
		return (
			<div className="container mx-auto space-y-6 p-6">
				<div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-slate-50 to-transparent p-6">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div className="space-y-2">
							<p className="text-xs uppercase tracking-[0.2em] text-blue-600">Council</p>
							<h1 className="text-3xl font-semibold leading-tight text-slate-900">
								Tablero de control
							</h1>
							<p className="max-w-2xl text-sm text-muted-foreground">
								Visibilidad rápida de portafolio, cobertura de pedidos y observaciones críticas.
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button asChild variant="outline">
								<a href="/metricas/resumen">
									<BarChart3 className="mr-2 h-4 w-4" />
									Ver métricas completas
								</a>
							</Button>
							<Button asChild>
								<a href="/metricas/proyectos">
									<FolderOpen className="mr-2 h-4 w-4" />
									Proyectos con métricas
								</a>
							</Button>
						</div>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					<StatCard
						title="Proyectos activos"
						value={dashboardMetrics?.proyectos_activos ?? 0}
						subtitle="En ejecución"
						icon={<Activity className="h-5 w-5 text-blue-700" />}
						loading={loadingDashboardMetrics}
					/>
					<StatCard
						title="Tasa de éxito"
						value={`${dashboardMetrics?.tasa_exito?.toFixed?.(1) ?? "0.0"}%`}
						subtitle="Finalizados / totales"
						icon={<CheckCircle2 className="h-5 w-5 text-emerald-700" />}
						accent="green"
						loading={loadingDashboardMetrics}
					/>
					<StatCard
						title="Cobertura de pedidos"
						value={`${commitmentsMetrics?.cobertura_ofertas_porcentaje?.toFixed?.(0) ?? 0}%`}
						subtitle="Pedidos con oferta"
						icon={<Target className="h-5 w-5 text-blue-700" />}
						loading={loadingCommitmentsMetrics}
					/>
					<StatCard
						title="Observaciones pendientes"
						value={performanceMetrics?.observaciones_pendientes ?? 0}
						subtitle="Por resolver"
						icon={<AlertTriangle className="h-5 w-5 text-amber-700" />}
						accent="orange"
						loading={loadingPerformanceMetrics}
					/>
				</div>

				<div className="grid gap-6 lg:grid-cols-2">
					<Card>
						<CardHeader className="flex items-center justify-between space-y-0">
							<div>
								<CardTitle>Distribución por estado</CardTitle>
								<CardDescription>Pendiente / ejecución / finalizado</CardDescription>
							</div>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							{loadingDashboardMetrics ? (
								<div className="space-y-2">
									<Skeleton className="h-4 w-40" />
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-4 w-36" />
								</div>
							) : (
								<div className="space-y-2">
									<p className="flex items-center justify-between rounded-lg border p-3">
										<span className="text-muted-foreground">Pendiente</span>
										<span className="font-semibold">
											{dashboardMetrics?.proyectos_por_estado?.pendiente ?? 0}
										</span>
									</p>
									<p className="flex items-center justify-between rounded-lg border p-3">
										<span className="text-muted-foreground">En ejecución</span>
										<span className="font-semibold">
											{dashboardMetrics?.proyectos_por_estado?.en_ejecucion ?? 0}
										</span>
									</p>
									<p className="flex items-center justify-between rounded-lg border p-3">
										<span className="text-muted-foreground">Finalizado</span>
										<span className="font-semibold">
											{dashboardMetrics?.proyectos_por_estado?.finalizado ?? 0}
										</span>
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex items-center justify-between space-y-0">
							<div>
								<CardTitle>Rendimiento operativo</CardTitle>
								<CardDescription>Tiempos y backlog clave.</CardDescription>
							</div>
						</CardHeader>
						<CardContent className="grid gap-3 text-sm">
							{loadingPerformanceMetrics ? (
								<div className="space-y-2">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-4 w-36" />
									<Skeleton className="h-4 w-28" />
								</div>
							) : (
								<>
									<div className="flex items-center justify-between rounded-lg border p-3">
										<span className="text-muted-foreground">Tiempo prom. etapa</span>
										<span className="font-semibold">
											{performanceMetrics?.tiempo_promedio_etapa_dias ?? 0} días
										</span>
									</div>
									<div className="flex items-center justify-between rounded-lg border p-3">
										<span className="text-muted-foreground">Inicio prom. proyecto</span>
										<span className="font-semibold">
											{performanceMetrics?.tiempo_inicio_promedio_dias ?? 0} días
										</span>
									</div>
									<div className="flex items-center justify-between rounded-lg border p-3">
										<span className="text-muted-foreground">Pendientes &gt; 30 días</span>
										<span className="font-semibold">
											{performanceMetrics?.proyectos_pendientes_mas_30_dias ?? 0}
										</span>
									</div>
								</>
							)}
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader className="flex items-center justify-between space-y-0">
						<div>
							<CardTitle>Alertas y próximos pasos</CardTitle>
							<CardDescription>Prioridades para Council según métricas actuales.</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="grid gap-3 md:grid-cols-3">
						<div className="rounded-lg border p-4">
							<p className="text-sm font-medium">Observaciones a revisar</p>
							<p className="text-lg font-semibold">
								{performanceMetrics?.observaciones_pendientes ?? 0} pendientes
							</p>
							<p className="text-xs text-muted-foreground">
								Enviá seguimiento o recordatorios antes del vencimiento.
							</p>
							<Button className="mt-3" variant="outline" size="sm" asChild>
								<a href="/observaciones">Ir a observaciones</a>
							</Button>
						</div>
						<div className="rounded-lg border p-4">
							<p className="text-sm font-medium">Proyectos en riesgo</p>
							<p className="text-lg font-semibold">
								{dashboardMetrics?.proyectos_en_riesgo ?? performanceMetrics?.proyectos_pendientes_mas_30_dias ?? 0}
							</p>
							<p className="text-xs text-muted-foreground">
								Revisá métricas y envía observaciones para desbloquearlos.
							</p>
							<Button className="mt-3" size="sm" asChild>
								<a href="/metricas/proyectos">Ver métricas de proyectos</a>
							</Button>
						</div>
						<div className="rounded-lg border p-4">
							<p className="text-sm font-medium">Reportes ejecutivos</p>
							<p className="text-lg font-semibold">
								Cobertura {commitmentsMetrics?.cobertura_ofertas_porcentaje?.toFixed?.(0) ?? 0}%
							</p>
							<p className="text-xs text-muted-foreground">
								Consultá el resumen y descarga insights para el consejo.
							</p>
							<Button className="mt-3" variant="outline" size="sm" asChild>
								<a href="/metricas/reportes">Abrir reportes</a>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto space-y-6 p-6">
			<div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-cyan-50 to-transparent p-6">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div className="space-y-2">
						<p className="text-sm uppercase tracking-tight text-blue-600">Tu panel de miembro</p>
						<h1 className="text-3xl font-semibold leading-tight text-slate-900">
							Hola {user?.nombre ?? "equipo"}, revisemos tus proyectos
						</h1>
						<p className="text-base text-muted-foreground">
							Accedé rápido a tus proyectos en ejecución, observaciones recibidas y próximos pasos.
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button asChild variant="secondary">
							<a href="/proyectos/nuevo">
								<PlusCircle className="mr-2 h-4 w-4" />
								Crear nuevo proyecto
							</a>
						</Button>
						<Button asChild variant="outline">
							<a href="/colaboraciones">
								<Rocket className="mr-2 h-4 w-4" />
								Buscar colaboraciones
							</a>
						</Button>
						<Button asChild>
							<a href="/observaciones">
								<ShieldCheck className="mr-2 h-4 w-4" />
								Observaciones recibidas
							</a>
						</Button>
					</div>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<StatCard
					title="Proyectos activos"
					value={projectCounts.enEjecucion}
					subtitle="En ejecución ahora"
					icon={<Activity className="h-5 w-5 text-blue-700" />}
					loading={isLoadingProjects}
				/>
				<StatCard
					title="Proyectos listos para arrancar"
					value={projectCounts.pendientes}
					subtitle="Aún pendientes de financiamiento"
					icon={<Flag className="h-5 w-5 text-amber-700" />}
					accent="orange"
					loading={isLoadingProjects}
				/>
				<StatCard
					title="Proyectos finalizados"
					value={projectCounts.finalizados}
					subtitle="Cerrados y listos para documentar"
					icon={<CheckCircle2 className="h-5 w-5 text-emerald-700" />}
					accent="green"
					loading={isLoadingProjects}
				/>
				<StatCard
					title="Observaciones pendientes"
					value={observacionStats?.pendientes ?? 0}
					subtitle="Que requieren respuesta"
					icon={<Target className="h-5 w-5 text-blue-700" />}
					loading={isLoadingObservacionStats}
				/>
			</div>

			<div className="grid gap-6 xl:grid-cols-3">
				<div className="xl:col-span-2 space-y-6">
					<Card>
						<CardHeader className="flex items-center justify-between space-y-0">
							<div>
								<CardTitle>Proyectos en ejecución</CardTitle>
								<CardDescription>Seguimiento rápido de los proyectos que están avanzando.</CardDescription>
							</div>
							<Button variant="outline" size="sm" asChild>
								<a href="/proyectos">Ver todos</a>
							</Button>
						</CardHeader>
						<CardContent className="space-y-3">
							{isLoadingProjects ? (
								<div className="space-y-3">
									<Skeleton className="h-24 w-full" />
									<Skeleton className="h-24 w-full" />
									<Skeleton className="h-24 w-full" />
								</div>
							) : activeProjects.length === 0 ? (
								<div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
									No tenés proyectos en ejecución. Iniciá uno desde "Mis Proyectos".
								</div>
							) : (
								activeProjects.map((project) => (
									<ProjectListItem key={project.id} project={project} />
								))
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-wrap items-center justify-between gap-3 space-y-0">
							<div>
								<CardTitle>Observaciones pendientes</CardTitle>
								<CardDescription>Las que necesitan respuesta antes de su vencimiento.</CardDescription>
							</div>
							<Button variant="outline" size="sm" asChild>
								<a href="/observaciones">Ir a Observaciones</a>
							</Button>
						</CardHeader>
						<CardContent className="space-y-3">
							{isLoadingPendingObs ? (
								<div className="space-y-3">
									<Skeleton className="h-20 w-full" />
									<Skeleton className="h-20 w-full" />
									<Skeleton className="h-20 w-full" />
								</div>
							) : pendingObsItems.length === 0 ? (
								<div className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
									No hay observaciones pendientes en este momento.
								</div>
							) : (
								pendingObsItems.map((obs) => <ObservacionItem key={obs.id} obs={obs} />)
							)}
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card>
						<CardHeader className="flex items-center justify-between space-y-0">
							<div>
								<CardTitle>En pipeline</CardTitle>
								<CardDescription>Proyectos listos para financiar o iniciar etapas.</CardDescription>
							</div>
							<Button variant="ghost" size="sm" asChild>
								<a href="/colaboraciones">
									<FolderOpen className="mr-2 h-4 w-4" />
									Buscar aportes
								</a>
							</Button>
						</CardHeader>
						<CardContent className="space-y-3">
							{isLoadingProjects ? (
								<div className="space-y-3">
									<Skeleton className="h-16 w-full" />
									<Skeleton className="h-16 w-full" />
								</div>
							) : pipelineProjects.length === 0 ? (
								<div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
									No hay proyectos pendientes. Creá uno nuevo para comenzar.
								</div>
							) : (
								pipelineProjects.map((project) => (
									<div
										key={project.id}
										className="flex items-start justify-between gap-3 rounded-lg border border-border/60 p-3"
									>
										<div className="space-y-1">
											<p className="text-sm font-medium leading-tight">{project.titulo}</p>
											<p className="text-xs text-muted-foreground">
												Actualizado {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true, locale: es })}
											</p>
										</div>
										<Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-900">
											Pendiente
										</Badge>
									</div>
								))
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Últimas observaciones</CardTitle>
							<CardDescription>Lo más reciente que llegó desde el consejo.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							{isLoadingRecentObs ? (
								<div className="space-y-3">
									<Skeleton className="h-16 w-full" />
									<Skeleton className="h-16 w-full" />
								</div>
							) : recentObsItems.length === 0 ? (
								<div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
									No recibiste observaciones recientemente.
								</div>
							) : (
								recentObsItems.map((obs) => (
									<div key={obs.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
										<div className="space-y-1">
											<p className="text-sm font-medium leading-tight">
												{obs.proyecto?.titulo ?? "Proyecto"}
											</p>
											<p className="text-xs text-muted-foreground line-clamp-1">{obs.descripcion}</p>
										</div>
										<div className="text-xs text-muted-foreground text-right">
											<p>{formatDistanceToNow(new Date(obs.created_at), { addSuffix: true, locale: es })}</p>
											<p className="uppercase text-[11px]">{obs.estado}</p>
										</div>
									</div>
								))
							)}
						</CardContent>
					</Card>

					{!isMember && (
						<Card className="border-amber-200 bg-amber-50">
							<CardHeader>
								<CardTitle>Vista de miembro</CardTitle>
								<CardDescription>
									Algunas tarjetas de este panel están pensadas para el rol MEMBER. Iniciá sesión con ese rol para ver todos los datos.
								</CardDescription>
							</CardHeader>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
