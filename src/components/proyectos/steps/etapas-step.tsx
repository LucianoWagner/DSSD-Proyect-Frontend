// components/proyectos/steps/etapas-step.tsx
"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FolderOpen } from "lucide-react";
import { EtapaCard } from "../etapa-card";
import { EtapaDialog } from "../etapa-dialog";
import type { EtapaProyecto } from "@/types/proyecto";
import { ScrollArea } from "@/components/ui/scroll-area";

export function EtapasStep() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingEtapaIndex, setEditingEtapaIndex] = useState<number | null>(
		null
	);

	const form = useFormContext();

	const etapas = form.watch("etapas") || [];

	const handleSaveEtapa = () => {
		setEditingEtapaIndex(null);
		setIsDialogOpen(false);
	};

	const handleDeleteEtapa = (etapaId: string) => {
		const currentEtapas = form.getValues("etapas") || [];
		const filteredEtapas = currentEtapas.filter(
			(e: EtapaProyecto) => e.id !== etapaId
		);
		form.setValue("etapas", filteredEtapas, { shouldValidate: true });
	};

	const openEditDialog = (etapaIndex: number) => {
		setEditingEtapaIndex(etapaIndex);
		setIsDialogOpen(true);
	};

	const openAddDialog = () => {
		setEditingEtapaIndex(null);
		setIsDialogOpen(true);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold">
						Etapas del Proyecto
					</h3>
					<p className="text-sm text-muted-foreground mt-1">
						Define las etapas y pedidos de cobertura necesarios
					</p>
				</div>
				<Button onClick={openAddDialog}>
					<Plus className="mr-2 h-4 w-4" />
					Agregar Etapa
				</Button>
			</div>

			<ScrollArea className="h-[500px]">
				<div className="space-y-4 pr-4">
					{etapas.length === 0 ? (
						<Card className="border-dashed">
							<CardContent className="flex flex-col items-center justify-center py-12">
								<FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="text-lg font-semibold mb-2">
									No hay etapas agregadas
								</h3>
								<p className="text-sm text-muted-foreground text-center mb-4">
									Agrega al menos una etapa para continuar con la
									creación del proyecto
								</p>
								<Button onClick={openAddDialog}>
									<Plus className="mr-2 h-4 w-4" />
									Agregar Primera Etapa
								</Button>
							</CardContent>
						</Card>
					) : (
						etapas.map((etapa: EtapaProyecto, index: number) => (
							<EtapaCard
								key={etapa.id}
								etapa={etapa}
								index={index}
								onEdit={() => openEditDialog(index)}
								onDelete={() => handleDeleteEtapa(etapa.id)}
							/>
						))
					)}
				</div>
			</ScrollArea>

			<EtapaDialog
				open={isDialogOpen}
				onOpenChange={(open) => {
					setIsDialogOpen(open);
					if (!open) {
						setEditingEtapaIndex(null);
					}
				}}
				onSave={handleSaveEtapa}
				etapaIndex={editingEtapaIndex}
			/>
		</div>
	);
}
