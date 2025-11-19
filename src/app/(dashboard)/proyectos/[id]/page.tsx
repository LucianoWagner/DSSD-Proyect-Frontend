"use client";

import { use } from "react";
import { useGetProjectDetail } from "@/hooks/colaboraciones/use-get-project-detail";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

interface PageProps {
	params: Promise<{ id: string }>;
}

export default function ProyectoDetailPage({ params }: PageProps) {
	const { id } = use(params);
	const { data: proyecto, isLoading, error } = useGetProjectDetail(id);

	// Estado badge color
	const getEstadoBadgeVariant = (estado: string) => {
		const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
			activo: "default",
			completado: "default",
			cancelado: "destructive",
			borrador: "secondary",
		};
		return variants[estado.toLowerCase()] || "outline";
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
							{proyecto.etapas.map((etapa, index) => (
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

									<CardContent className="pt-6">
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
												{etapa.pedidos.map((pedido) => (
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
																	</div>
																	<p className="text-sm mb-3">
																		{
																			pedido.descripcion
																		}
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
												))}
											</div>
										)}
									</CardContent>
								</Card>
							))}
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
