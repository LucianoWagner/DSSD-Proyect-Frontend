"use client";

import { useEffect, useState } from "react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TIPOS_PEDIDO } from "@/consts/proyectos/form-options";
import type { PedidoCobertura, TipoPedidoCobertura } from "@/types/proyecto";

interface PedidoDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (pedido: PedidoCobertura) => void;
	pedido?: PedidoCobertura | null;
}

export function PedidoDialog({
	open,
	onOpenChange,
	onSave,
	pedido,
}: PedidoDialogProps) {
	const [currentPedido, setCurrentPedido] = useState<PedidoCobertura>({
		id: "",
		tipo: "economico",
		descripcion: "",
		moneda: "USD",
	});

	useEffect(() => {
		if (open) {
			if (pedido) {
				setCurrentPedido(pedido);
			} else {
				setCurrentPedido({
					id: crypto.randomUUID(),
					tipo: "economico",
					descripcion: "",
					moneda: "USD",
				});
			}
		}
	}, [open, pedido]);

	const handleSave = () => {
		onSave(currentPedido);
		onOpenChange(false);
	};

	const updatePedidoField = (field: keyof PedidoCobertura, value: string | number | undefined) => {
		setCurrentPedido(prev => ({ ...prev, [field]: value }));
	};

	const esEconomico = currentPedido.tipo === "economico";
	const esMaterial =
		currentPedido.tipo === "materiales" || currentPedido.tipo === "equipamiento";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl p-4 sm:p-6">
				<DialogHeader>
					<DialogTitle>
						{pedido
							? "Editar Pedido"
							: "Agregar Pedido de Cobertura"}
					</DialogTitle>
					<DialogDescription>
						Define el tipo y detalles del recurso necesario
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 sm:space-y-6">
					{/* Tipo de Pedido */}
					<div>
						<FormLabel>Tipo de Pedido *</FormLabel>
						<Select
							onValueChange={(value) => updatePedidoField("tipo", value as TipoPedidoCobertura)}
							value={currentPedido.tipo}
						>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder="Selecciona el tipo" />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{TIPOS_PEDIDO.map((tipo) => (
									<SelectItem
										key={tipo.value}
										value={tipo.value}
									>
										<span className="flex items-center gap-2">
											{tipo.icon} {tipo.label}
										</span>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Descripción */}
					<div>
						<FormLabel>Descripción *</FormLabel>
						<FormControl>
							<Textarea
								placeholder="Describe lo que necesitas..."
								className="min-h-[80px]"
								value={currentPedido.descripcion}
								onChange={(e) => updatePedidoField("descripcion", e.target.value)}
							/>
						</FormControl>
					</div>

					{/* Campos condicionales según el tipo */}
					{esEconomico && (
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
							<div className="sm:col-span-2">
								<FormLabel>Monto</FormLabel>
								<FormControl>
									<Input
										type="number"
										placeholder="10000"
										value={currentPedido.monto || ""}
										onChange={(e) => updatePedidoField("monto", Number(e.target.value))}
									/>
								</FormControl>
							</div>
							<div>
								<FormLabel>Moneda</FormLabel>
								<Select
									onValueChange={(value) => updatePedidoField("moneda", value)}
									value={currentPedido.moneda || "USD"}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="USD">
											USD
										</SelectItem>
										<SelectItem value="EUR">
											EUR
										</SelectItem>
										<SelectItem value="ARS">
											ARS
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					)}

					{esMaterial && (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
							<div>
								<FormLabel>Cantidad</FormLabel>
								<FormControl>
									<Input
										type="number"
										placeholder="100"
										value={currentPedido.cantidad || ""}
										onChange={(e) => updatePedidoField("cantidad", Number(e.target.value))}
									/>
								</FormControl>
							</div>
							<div>
								<FormLabel>Unidad</FormLabel>
								<FormControl>
									<Input
										placeholder="kg, m², unidades"
										value={currentPedido.unidad || ""}
										onChange={(e) => updatePedidoField("unidad", e.target.value)}
									/>
								</FormControl>
							</div>
						</div>
					)}

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
							{pedido ? "Guardar" : "Agregar"}
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}
