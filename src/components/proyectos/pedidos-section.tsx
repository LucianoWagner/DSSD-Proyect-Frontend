"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, HandHeart } from "lucide-react";
import { PedidoDialog } from "./pedidos-dialog";
import { PedidoCard } from "./pedido-card";
import type { PedidoCobertura } from "@/types/proyecto";

interface PedidosSectionProps {
	pedidos: PedidoCobertura[];
	setPedidos: (pedidos: PedidoCobertura[]) => void;
}

export function PedidosSection({ pedidos, setPedidos }: PedidosSectionProps) {
	const [isPedidoDialogOpen, setIsPedidoDialogOpen] = useState(false);
	const [editingPedido, setEditingPedido] = useState<PedidoCobertura | null>(
		null
	);

	const handleAddPedido = (pedido: PedidoCobertura) => {
		setPedidos([...pedidos, pedido]);
		setIsPedidoDialogOpen(false);
	};

	const handleEditPedido = (pedido: PedidoCobertura) => {
		setPedidos(pedidos.map((p) => (p.id === pedido.id ? pedido : p)));
		setEditingPedido(null);
		setIsPedidoDialogOpen(false);
	};

	const handleDeletePedido = (pedidoId: string) => {
		setPedidos(pedidos.filter((p) => p.id !== pedidoId));
	};

	const openEditDialog = (pedido: PedidoCobertura) => {
		setEditingPedido(pedido);
		setIsPedidoDialogOpen(true);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h4 className="text-sm font-semibold">
						Pedidos de Cobertura
					</h4>
					<p className="text-xs text-muted-foreground">
						Agrega los recursos necesarios para esta etapa
					</p>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => setIsPedidoDialogOpen(true)}
				>
					<Plus className="mr-2 h-4 w-4" />
					Agregar Pedido
				</Button>
			</div>

			{pedidos.length === 0 ? (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-8">
						<HandHeart className="h-8 w-8 text-muted-foreground mb-2" />
						<p className="text-sm text-muted-foreground text-center">
							No hay pedidos de cobertura agregados
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-2">
					{pedidos.map((pedido) => (
						<PedidoCard
							key={pedido.id}
							pedido={pedido}
							onEdit={() => openEditDialog(pedido)}
							onDelete={() => handleDeletePedido(pedido.id)}
						/>
					))}
				</div>
			)}

			<PedidoDialog
				open={isPedidoDialogOpen}
				onOpenChange={setIsPedidoDialogOpen}
				onSave={editingPedido ? handleEditPedido : handleAddPedido}
				pedido={editingPedido}
			/>
		</div>
	);
}
