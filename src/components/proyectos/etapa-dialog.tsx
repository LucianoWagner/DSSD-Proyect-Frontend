"use client";

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	FormControl,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PedidosSection } from "./pedidos-section";
import type { ProyectoFormValues, EtapaFormValues } from "@/schemas/proyecto";

// Helper function to format date to YYYY-MM-DD without timezone issues
const formatDateToString = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

// Helper function to create Date from YYYY-MM-DD string without timezone issues
const createDateFromString = (dateString: string): Date => {
	const [year, month, day] = dateString.split('-').map(Number);
	return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
};

interface EtapaDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: () => void;
	etapaIndex?: number | null; // Index para editar, null para agregar
}

export function EtapaDialog({
	open,
	onOpenChange,
	onSave,
	etapaIndex,
}: EtapaDialogProps) {
	const form = useFormContext<ProyectoFormValues>();
	const [currentEtapa, setCurrentEtapa] = useState<EtapaFormValues>({
		id: "",
		nombre: "",
		descripcion: "",
		fecha_inicio: "",
		fecha_fin: "",
		pedidos: [],
	});

	const [dateError, setDateError] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			if (etapaIndex !== null && etapaIndex !== undefined) {
				// Modo edición
				const etapas = form.getValues("etapas");
				const etapa = etapas[etapaIndex];
				if (etapa) {
					setCurrentEtapa(etapa);
				}
			} else {
				// Modo agregar
				setCurrentEtapa({
					id: crypto.randomUUID(),
					nombre: "",
					descripcion: "",
					fecha_inicio: "",
					fecha_fin: "",
					pedidos: [],
				});
			}
		}
	}, [open, etapaIndex, form]);

	const handleSave = () => {
		// Validate dates before saving
		if (!validateDates()) {
			return;
		}

		const etapas = form.getValues("etapas") || [];

		if (etapaIndex !== null && etapaIndex !== undefined) {
			// Editar etapa existente
			const updatedEtapas = [...etapas];
			updatedEtapas[etapaIndex] = currentEtapa;
			form.setValue("etapas", updatedEtapas, { shouldValidate: true });
		} else {
			// Agregar nueva etapa
			form.setValue("etapas", [...etapas, currentEtapa], {
				shouldValidate: true,
			});
		}

		onSave();
		onOpenChange(false);
	};

	const updateEtapaField = (field: keyof EtapaFormValues, value: string | number | Date) => {
		setCurrentEtapa((prev) => ({ ...prev, [field]: value }));

		// Clear date error when dates change
		if (field === 'fecha_inicio' || field === 'fecha_fin') {
			setDateError(null);
		}
	};

	const validateDates = (): boolean => {
		if (!currentEtapa.fecha_inicio || !currentEtapa.fecha_fin) {
			setDateError("Ambas fechas son requeridas");
			return false;
		}

		const startDate = createDateFromString(currentEtapa.fecha_inicio);
		const endDate = createDateFromString(currentEtapa.fecha_fin);

		if (endDate < startDate) {
			setDateError("La fecha de fin debe ser posterior a la fecha de inicio");
			return false;
		}

		setDateError(null);
		return true;
	};

	const updatePedidos = (pedidos: EtapaFormValues['pedidos']) => {
		setCurrentEtapa((prev) => ({ ...prev, pedidos }));
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-full max-w-lg sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
				<DialogHeader>
					<DialogTitle>
						{etapaIndex !== null && etapaIndex !== undefined
							? "Editar Etapa"
							: "Agregar Nueva Etapa"}
					</DialogTitle>
					<DialogDescription>
						Define la etapa del proyecto y sus pedidos de cobertura
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 sm:space-y-6">
					{/* Nombre */}
					<div>
						<FormLabel>Nombre de la Etapa *</FormLabel>
						<FormControl>
							<Input
								placeholder="Ej: Evaluación estructural"
								value={currentEtapa.nombre}
								onChange={(e) =>
									updateEtapaField("nombre", e.target.value)
								}
							/>
						</FormControl>
					</div>

					{/* Descripción */}
					<div>
						<FormLabel>Descripción *</FormLabel>
						<FormControl>
							<Textarea
								placeholder="Describe las actividades de esta etapa..."
								className="min-h-[80px]"
								value={currentEtapa.descripcion}
								onChange={(e) =>
									updateEtapaField(
										"descripcion",
										e.target.value
									)
								}
							/>
						</FormControl>
					</div>

					{/* Fechas */}
					<div className="space-y-3 sm:space-y-4">
						{dateError && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{dateError}</AlertDescription>
							</Alert>
						)}

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
							<div className="space-y-2">
								<FormLabel>Fecha de Inicio *</FormLabel>
								<FormControl>
									<DatePicker
										date={currentEtapa.fecha_inicio ? createDateFromString(currentEtapa.fecha_inicio) : undefined}
										onSelect={(date) => {
											const dateString = date ? formatDateToString(date) : '';
											updateEtapaField('fecha_inicio', dateString);
										}}
										placeholder="Selecciona fecha de inicio"
										className="w-full"
									/>
								</FormControl>
							</div>

							<div className="space-y-2">
								<FormLabel>Fecha de Fin *</FormLabel>
								<FormControl>
									<DatePicker
										date={currentEtapa.fecha_fin ? createDateFromString(currentEtapa.fecha_fin) : undefined}
										onSelect={(date) => {
											const dateString = date ? formatDateToString(date) : '';
											updateEtapaField('fecha_fin', dateString);
										}}
										placeholder="Selecciona fecha de fin"
										className="w-full"
									/>
								</FormControl>
							</div>
						</div>
					</div>

					{/* Sección de Pedidos */}
					<PedidosSection
						pedidos={currentEtapa.pedidos}
						setPedidos={updatePedidos}
					/>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancelar
						</Button>
						<Button onClick={handleSave}>
							<Plus className="mr-2 h-4 w-4" />
							{etapaIndex !== null && etapaIndex !== undefined
								? "Guardar Cambios"
								: "Agregar Etapa"}
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}
