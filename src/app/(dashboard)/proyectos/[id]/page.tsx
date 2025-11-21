"use client";

import { use, useEffect, useState } from "react";
import { useGetProjectDetail } from "@/hooks/colaboraciones/use-get-project-detail";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	useCompleteEtapa,
	useCompleteProject,
	useStartEtapa,
	useStartProject,
} from "@/hooks/proyectos/use-project-actions";
import {
	MapPin,
	Calendar,
	Package,
	DollarSign,
	Users,
	Clock,
	CheckCircle2,
	AlertCircle,
	Workflow,
	FileText,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const etapaStatusStyles: Record<
	string,
	{
		label: string;
		className: string;
		description?: string;
	}
> = {
	pendiente: {
		label: "Pendiente",
		className: "bg-gray-100 text-gray-800 border-gray-200",
		description: "Esperando financiamiento u ofertas",
	},
	financiada: {
		label: "Financiada",
		className: "bg-blue-100 text-blue-800 border-blue-200",
		description: "Listo para iniciar ejecución",
	},
	esperando_ejecucion: {
		label: "Esperando ejecución",
		className: "bg-cyan-100 text-cyan-800 border-cyan-200",
		description: "Proyecto iniciado, listo para que ejecutes la etapa",
	},
	"en_ejecucion": {
		label: "En ejecución",
		className: "bg-amber-100 text-amber-900 border-amber-200",
		description: "Actualmente ejecutándose",
	},
	completada: {
		label: "Completada",
		className: "bg-green-100 text-green-800 border-green-200",
		description: "Terminada y validada",
	},
	bloqueada: {
		label: "Bloqueada",
		className: "bg-red-50 text-red-700 border-red-200",
		description: "Requiere acciones antes de continuar",
	},
};

const normalizeEstado = (estado?: string | null) =>
	estado?.toString().toLowerCase() ?? "";

const getEtapaStatusConfig = (estado?: string) => {
	const normalized = normalizeEstado(estado) || "pendiente";
	return etapaStatusStyles[normalized] ?? etapaStatusStyles.pendiente;
};

const pedidoEstadoStyles: Record<
	string,
	{
		label: string;
		badgeClass: string;
		description: string;
	}
> = {
	pendiente: {
		label: "Pendiente",
		badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-300",
		description: "Todavía no tiene fondos comprometidos.",
	},
	comprometido: {
		label: "Comprometido",
		badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
		description: "Tiene una oferta aceptada y financiada.",
	},
	completado: {
		label: "Completado",
		badgeClass: "bg-green-100 text-green-800 border-green-300",
		description: "La entrega/ejecución fue confirmada.",
	},
};

const getPedidoEstadoConfig = (estado?: string) => {
	const normalized = normalizeEstado(estado);
	return (
		pedidoEstadoStyles[normalized] ?? pedidoEstadoStyles.pendiente
	);
};

interface PageProps {
	params: Promise<{ id: string }>;
}

export default function ProyectoDetailPage({ params }: PageProps) {
	const { id } = use(params);
	const { data: proyecto, isLoading, error } = useGetProjectDetail(id);
	const startProjectMutation = useStartProject();
	const completeProjectMutation = useCompleteProject();
	const startEtapaMutation = useStartEtapa();
	const completeEtapaMutation = useCompleteEtapa();
	const [startDialogOpen, setStartDialogOpen] = useState(false);
	const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

	// Estado badge color
	const getEstadoBadgeVariant = (estado: string) => {
		const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
			activo: "default",
			completado: "default",
			finalizado: "default",
			"en_ejecucion": "default",
			pendiente: "secondary",
			cancelado: "destructive",
			borrador: "secondary",
		};
		return variants[estado?.toLowerCase?.() ?? ""] || "outline";
	};

	// Tipo de pedido icon
	const getPedidoIcon = (tipo: string) => {
		switch (tipo.toLowerCase()) {
			case "economico":
				return <DollarSign className="h-4 w-4" />;
			case "materiales":
				return <Package className="h-4 w-4" />;
			case "mano_obra":
				return <Users className="h-4 w-4" />;
			default:
				return <FileText className="h-4 w-4" />;
		}
	};

	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), "dd 'de' MMMM, yyyy", {
				locale: es,
			});
		} catch {
			return dateString;
		}
	};

	const formatDateTime = (dateString: string) => {
		try {
			return format(
				new Date(dateString),
				"dd/MM/yyyy 'a las' HH:mm",
				{
					locale: es,
				}
			);
		} catch {
			return dateString;
		}
	};

	const etapas = proyecto?.etapas ?? [];
	const totalEtapas = etapas.length;
	const completedEtapas = etapas.filter(
		(etapa) => normalizeEstado(etapa.estado) === "completada"
	).length;
	const runningEtapas = etapas.filter(
		(etapa) => normalizeEstado(etapa.estado) === "en_ejecucion"
	).length;
	const upcomingEtapas = etapas.filter((etapa) => {
		const estado = normalizeEstado(etapa.estado);
		return (
			estado === "financiada" ||
			estado === "esperando_ejecucion" ||
			estado === "pendiente"
		);
	}).length;
	const incompletePedidos = etapas.flatMap((etapa) =>
		(etapa.pedidos ?? [])
			.filter((pedido) => normalizeEstado(pedido.estado) !== "completado")
			.map((pedido) => ({
				id: pedido.id,
				tipo: pedido.tipo,
				estado: pedido.estado,
				descripcion: pedido.descripcion,
				etapaNombre: etapa.nombre,
			}))
	);
	const hasIncompletePedidos = incompletePedidos.length > 0;
	const progressValue =
		totalEtapas > 0 ? Math.round((completedEtapas / totalEtapas) * 100) : 0;
	const projectState = normalizeEstado(proyecto?.estado);
	const projectIsPending = projectState === "pendiente";
	const projectIsRunning = projectState === "en_ejecucion";
	const projectIsFinalized = projectState === "finalizado";
	const canStartProject =
		projectIsPending && totalEtapas > 0 && !hasIncompletePedidos;
	const canCompleteProject =
		projectIsRunning && totalEtapas > 0 && completedEtapas === totalEtapas;

	const startHelperText = !projectIsPending
		? "Este proyecto ya se encuentra en ejecución."
		: totalEtapas === 0
			? "Agregá etapas para poder iniciar la ejecución."
				: hasIncompletePedidos
					? "Completá todos los pedidos antes de iniciar ejecución."
				: undefined;

	const completeHelperText = !projectIsRunning
		? "El proyecto debe estar en ejecución para finalizar."
		: totalEtapas === 0
			? "No hay etapas registradas para finalizar."
			: completedEtapas !== totalEtapas
				? "Completá todas las etapas antes de finalizar."
				: undefined;

	const helperMessage =
		(projectIsPending && startHelperText) ||
		(projectIsRunning && completeHelperText);

	const triggerStartEtapa = (etapaId: string) => {
		if (!proyecto) return;
		startEtapaMutation.mutate({ projectId: proyecto.id, etapaId });
	};

	const triggerCompleteEtapa = (etapaId: string) => {
		if (!proyecto) return;
		completeEtapaMutation.mutate({ projectId: proyecto.id, etapaId });
	};

	useEffect(() => {
		if (!projectIsPending && startDialogOpen) {
			setStartDialogOpen(false);
		}
	}, [projectIsPending, startDialogOpen]);

	useEffect(() => {
		if (projectIsFinalized && completeDialogOpen) {
			setCompleteDialogOpen(false);
		}
	}, [projectIsFinalized, completeDialogOpen]);

	// Loading state
	if (isLoading) {
		return (
			<div className="container mx-auto py-8 px-4 max-w-7xl">
				<div className="space-y-6">
					<Skeleton className="h-16 w-3/4" />
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton key={i} className="h-24" />
						))}
					</div>
					<Skeleton className="h-96" />
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="container mx-auto py-8 px-4 max-w-7xl">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Error al cargar el proyecto. Por favor, intenta nuevamente.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	// No data state
	if (!proyecto) {
		return (
			<div className="container mx-auto py-8 px-4 max-w-7xl">
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						No se encontró el proyecto solicitado.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 px-4 max-w-7xl">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-start justify-between mb-4">
					<div className="flex-1">
						<div className="flex items-center gap-3 mb-2">
							<h1 className="text-4xl font-bold tracking-tight">
								{proyecto.titulo}
							</h1>
							<Badge
								variant={getEstadoBadgeVariant(proyecto.estado)}
								className="text-sm"
							>
								{proyecto.estado}
							</Badge>
						</div>
						<p className="text-muted-foreground text-lg max-w-3xl">
							{proyecto.descripcion}
						</p>
					</div>
				</div>

				{/* Quick Info Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
									<FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">
										Tipo
									</p>
									<p className="font-semibold">{proyecto.tipo}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
									<MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">
										Ubicación
									</p>
									<p className="font-semibold">
										{proyecto.ciudad}, {proyecto.pais}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
									<Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">
										Etapas
									</p>
									<p className="font-semibold">
										{proyecto.etapas?.length || 0} etapas
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
									<Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">
										Creado
									</p>
									<p className="font-semibold text-sm">
										{formatDate(proyecto.created_at)}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<Card className="mb-10">
				<CardContent className="space-y-6 pt-6">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
						<div>
							<p className="text-sm text-muted-foreground">
								Seguimiento de ejecución
							</p>
							<p className="text-2xl font-semibold mt-1">
								{completedEtapas}/{totalEtapas || 0} etapas completadas
							</p>
							<p className="text-sm text-muted-foreground mt-1">
								Estado actual:{" "}
								<span className="font-medium text-foreground">
									{proyecto.estado}
								</span>
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							{(projectIsPending || startProjectMutation.isPending) && (
								<AlertDialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
									<AlertDialogTrigger asChild>
										<Button
											size="sm"
											disabled={!canStartProject || startProjectMutation.isPending}
											title={startHelperText}
										>
											{startProjectMutation.isPending ? "Iniciando..." : "Iniciar ejecución"}
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>¿Iniciar el proyecto?</AlertDialogTitle>
											<AlertDialogDescription className="space-y-2 text-sm">
												<p>
													El proyecto pasará a estado <strong>en ejecución</strong> y podrás
													avanzar con las etapas financiadas.
												</p>
												<p>
													Verifica que todos los pedidos estén comprometidos o completados
													para evitar rechazos.
												</p>
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel disabled={startProjectMutation.isPending}>
												Cancelar
											</AlertDialogCancel>
											<AlertDialogAction
												onClick={() =>
													proyecto &&
													startProjectMutation.mutate({ projectId: proyecto.id })
												}
												disabled={!canStartProject || startProjectMutation.isPending}
											>
												Confirmar
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							)}

							{(projectIsRunning || completeProjectMutation.isPending) &&
								(!projectIsFinalized || completeProjectMutation.isPending) && (
								<AlertDialog
									open={completeDialogOpen}
									onOpenChange={setCompleteDialogOpen}
								>
									<AlertDialogTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											disabled={!canCompleteProject || completeProjectMutation.isPending}
											title={completeHelperText}
										>
											{completeProjectMutation.isPending
												? "Finalizando..."
												: "Finalizar proyecto"}
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Confirmar finalización</AlertDialogTitle>
											<AlertDialogDescription className="space-y-2 text-sm">
												<p>
													Se marcará el proyecto como <strong>finalizado</strong> y quedará
													listo para auditoría. Esta acción es irreversible.
												</p>
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel disabled={completeProjectMutation.isPending}>
												Cancelar
											</AlertDialogCancel>
											<AlertDialogAction
												onClick={() =>
													proyecto &&
													completeProjectMutation.mutate({
														projectId: proyecto.id,
													})
												}
												disabled={!canCompleteProject || completeProjectMutation.isPending}
											>
												Confirmar
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							)}
						</div>
					</div>

						<div className="space-y-2">
							<Progress value={progressValue} className="h-2" />
							<div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
								<span>
									Etapas en ejecución:{" "}
									<span className="font-semibold text-foreground">{runningEtapas}</span>
								</span>
								<span>
									Próximas etapas:{" "}
									<span className="font-semibold text-foreground">{upcomingEtapas}</span>
								</span>
								<span>
									Etapas completadas:{" "}
									<span className="font-semibold text-foreground">{completedEtapas}</span>
								</span>
								<span>
									Pedidos sin completar:{" "}
									<span className="font-semibold text-foreground">{incompletePedidos.length}</span>
								</span>
							</div>
						</div>

						{helperMessage && (
							<p className="text-xs text-muted-foreground">{helperMessage}</p>
						)}

						{hasIncompletePedidos && (
							<div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
								<p className="font-medium">Pedidos que aún no se completaron</p>
								<ul className="mt-2 space-y-1 text-xs">
									{incompletePedidos.slice(0, 4).map((pedido) => (
										<li key={pedido.id} className="flex flex-wrap gap-1">
											<span className="font-semibold">{pedido.etapaNombre}</span>
											<span className="text-muted-foreground">•</span>
											<span className="uppercase tracking-wide">{pedido.tipo}</span>
											<span className="text-muted-foreground">
												{pedido.descripcion} ({pedido.estado})
											</span>
										</li>
									))}
								</ul>
								{incompletePedidos.length > 4 && (
									<p className="text-xs mt-2 opacity-80">
										+ {incompletePedidos.length - 4} pedidos adicionales sin completar
									</p>
								)}
							</div>
						)}
					</CardContent>
				</Card>

			{/* Tabs Content */}
			<Tabs defaultValue="general" className="space-y-6">
				<TabsList className="grid w-full grid-cols-3 lg:w-auto">
					<TabsTrigger value="general">
						<FileText className="h-4 w-4 mr-2" />
						General
					</TabsTrigger>
					<TabsTrigger value="etapas">
						<Package className="h-4 w-4 mr-2" />
						Etapas y Pedidos
					</TabsTrigger>
					<TabsTrigger value="workflow">
						<Workflow className="h-4 w-4 mr-2" />
						Workflow
					</TabsTrigger>
				</TabsList>

				{/* General Tab */}
				<TabsContent value="general" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MapPin className="h-5 w-5" />
								Información de Ubicación
							</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-muted-foreground mb-1">
									País
								</p>
								<p className="font-semibold">{proyecto.pais}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground mb-1">
									Provincia
								</p>
								<p className="font-semibold">{proyecto.provincia}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground mb-1">
									Ciudad
								</p>
								<p className="font-semibold">{proyecto.ciudad}</p>
							</div>
							{proyecto.barrio && (
								<div>
									<p className="text-sm text-muted-foreground mb-1">
										Barrio
									</p>
									<p className="font-semibold">
										{proyecto.barrio}
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Clock className="h-5 w-5" />
								Información Temporal
							</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-muted-foreground mb-1">
									Fecha de Creación
								</p>
								<p className="font-semibold">
									{formatDateTime(proyecto.created_at)}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground mb-1">
									Última Actualización
								</p>
								<p className="font-semibold">
									{formatDateTime(proyecto.updated_at)}
								</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Etapas Tab */}
				<TabsContent value="etapas" className="space-y-6">
					{!proyecto.etapas || proyecto.etapas.length === 0 ? (
						<Card>
							<CardContent className="py-12">
								<div className="flex flex-col items-center justify-center text-center">
									<AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
									<h3 className="text-lg font-semibold mb-2">
										No hay etapas registradas
									</h3>
									<p className="text-muted-foreground">
										Este proyecto aún no tiene etapas definidas.
									</p>
								</div>
							</CardContent>
						</Card>
					) : (
						<div className="space-y-6">
							{proyecto.etapas.map((etapa, index) => {
								const etapaEstado = normalizeEstado(etapa.estado);
								const pedidosEtapa = etapa.pedidos ?? [];
								const pedidosPendEtapa = pedidosEtapa.filter(
									(pedido) => normalizeEstado(pedido.estado) === "pendiente"
								).length;
								const pedidosCompEtapa = pedidosEtapa.filter(
									(pedido) => normalizeEstado(pedido.estado) === "comprometido"
								).length;
								const pedidosDoneEtapa = pedidosEtapa.filter(
									(pedido) => normalizeEstado(pedido.estado) === "completado"
								).length;
								const allPedidosCompleted =
									pedidosEtapa.length > 0 &&
									pedidosEtapa.every((p) => normalizeEstado(p.estado) === "completado");
								const isStartingEtapa =
									startEtapaMutation.isPending &&
									startEtapaMutation.variables?.etapaId === etapa.id;
								const isCompletingEtapa =
									completeEtapaMutation.isPending &&
									completeEtapaMutation.variables?.etapaId === etapa.id;
								const canStartEtapa =
									projectIsRunning &&
									etapaEstado === "esperando_ejecucion" &&
									etapaEstado === "esperando_ejecucion" &&
									allPedidosCompleted;
								const canCompleteEtapa =
									projectIsRunning && etapaEstado === "en_ejecucion";

								return (
									<Card key={etapa.id} className="overflow-hidden">
										<CardHeader className="bg-muted/50">
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<div className="flex items-center gap-3 mb-2">
														<div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
															{index + 1}
														</div>
														<CardTitle className="text-2xl">
															{etapa.nombre}
														</CardTitle>
														<Badge
															className={`${getEtapaStatusConfig(etapa.estado).className}`}
														>
															{getEtapaStatusConfig(etapa.estado).label}
														</Badge>
													</div>
													<p className="text-muted-foreground">
														{etapa.descripcion}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-4 mt-4 text-sm">
												<div className="flex items-center gap-2">
													<Calendar className="h-4 w-4 text-muted-foreground" />
													<span className="text-muted-foreground">
														Inicio:
													</span>
													<span className="font-semibold">
														{formatDate(etapa.fecha_inicio)}
													</span>
												</div>
												<Separator
													orientation="vertical"
													className="h-4"
												/>
											<div className="flex items-center gap-2">
												<Calendar className="h-4 w-4 text-muted-foreground" />
												<span className="text-muted-foreground">
													Fin:
												</span>
													<span className="font-semibold">
														{formatDate(etapa.fecha_fin)}
													</span>
												</div>
											</div>
										</CardHeader>

										<CardContent className="space-y-6 pt-6">
										<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
											<div>
												<div className="mt-2 text-xs text-muted-foreground space-x-3">
													<span>
														Pendientes:{" "}
														<span className="font-semibold text-yellow-700">
															{pedidosPendEtapa}
														</span>
													</span>
													<span>
														Comprometidos:{" "}
														<span className="font-semibold text-blue-700">
															{pedidosCompEtapa}
														</span>
													</span>
													<span>
														Completados:{" "}
														<span className="font-semibold text-green-700">
															{pedidosDoneEtapa}
														</span>
													</span>
												</div>
											</div>
											<div className="flex flex-wrap gap-2">
												{canStartEtapa && (
													<Button
														variant="outline"
														size="sm"
														disabled={isStartingEtapa}
														title={
															!projectIsRunning
																? "El proyecto debe estar en ejecución para iniciar etapas."
																: undefined
														}
														onClick={() => triggerStartEtapa(etapa.id)}
													>
														{isStartingEtapa ? "Iniciando..." : "Iniciar etapa"}
													</Button>
												)}
												{canCompleteEtapa && (
													<Button
														size="sm"
														disabled={isCompletingEtapa}
														onClick={() => triggerCompleteEtapa(etapa.id)}
													>
														{isCompletingEtapa
															? "Marcando..."
															: "Marcar como completada"}
													</Button>
												)}
											</div>
										</div>

										<h4 className="font-semibold mb-4 flex items-center gap-2">
											<Package className="h-4 w-4" />
											Pedidos de Cobertura ({etapa.pedidos?.length || 0})
										</h4>

										{!etapa.pedidos || etapa.pedidos.length === 0 ? (
											<div className="text-center py-8 text-muted-foreground">
												<Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
												<p>No hay pedidos en esta etapa</p>
											</div>
										) : (
											<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
												{etapa.pedidos.map((pedido) => {
													const pedidoEstado = getPedidoEstadoConfig(pedido.estado);
													return (
														<Card
															key={pedido.id}
															className="border-2"
														>
															<CardContent className="pt-6">
																<div className="flex items-start gap-3">
																	<div className="p-2 bg-primary/10 rounded-lg">
																		{getPedidoIcon(
																			pedido.tipo
																		)}
																	</div>
																	<div className="flex-1 min-w-0">
																		<div className="flex items-center gap-2 mb-1">
																			<Badge variant="outline">
																				{pedido.tipo}
																			</Badge>
																			<Badge
																				variant="outline"
																				className={pedidoEstado.badgeClass}
																			>
																				{pedidoEstado.label}
																			</Badge>
																		</div>
																		<p className="text-sm mb-1">
																			{
																				pedido.descripcion
																			}
																		</p>
																		<p className="text-xs text-muted-foreground mb-3">
																			{pedidoEstado.description}
																		</p>

																		<div className="space-y-1">
																			{pedido.monto && (
																				<div className="flex items-center gap-2 text-sm">
																					<DollarSign className="h-3 w-3 text-muted-foreground" />
																					<span className="font-semibold">
																						{
																							pedido.moneda
																						}{" "}
																						{pedido.monto.toLocaleString()}
																					</span>
																				</div>
																			)}
																			{pedido.cantidad && (
																				<div className="flex items-center gap-2 text-sm">
																					<Package className="h-3 w-3 text-muted-foreground" />
																					<span className="font-semibold">
																						{
																							pedido.cantidad
																						}{" "}
																						{
																							pedido.unidad
																						}
																					</span>
																				</div>
																			)}
																		</div>
																	</div>
																</div>
															</CardContent>
														</Card>
													);
												})}
											</div>
										)}
									</CardContent>
								</Card>
								);
							})}
						</div>
					)}
				</TabsContent>

				{/* Workflow Tab */}
				<TabsContent value="workflow" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Workflow className="h-5 w-5" />
								Información de Bonita BPM
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<p className="text-sm text-muted-foreground mb-1">
									Estado del Proyecto
								</p>
								<div className="flex items-center gap-2">
									<CheckCircle2 className="h-5 w-5 text-green-600" />
									<p className="font-semibold text-lg">
										{proyecto.estado}
									</p>
								</div>
							</div>

							{proyecto.bonita_case_id && (
								<div>
									<p className="text-sm text-muted-foreground mb-1">
										Case ID
									</p>
									<code className="text-sm bg-muted px-2 py-1 rounded">
										{proyecto.bonita_case_id}
									</code>
								</div>
							)}

							{proyecto.bonita_process_instance_id && (
								<div>
									<p className="text-sm text-muted-foreground mb-1">
										Process Instance ID
									</p>
									<code className="text-sm bg-muted px-2 py-1 rounded">
										{proyecto.bonita_process_instance_id}
									</code>
								</div>
							)}

							{!proyecto.bonita_case_id &&
								!proyecto.bonita_process_instance_id && (
									<div className="text-center py-8 text-muted-foreground">
										<AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
										<p>
											No hay información de workflow disponible
										</p>
									</div>
								)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
