"use client";

/**
 * Dialog de confirmación para eliminar una oferta pendiente
 */

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteOferta } from "@/hooks/colaboraciones/use-delete-oferta";
import type { CompromisoWithPedido } from "@/types/colaboraciones";

interface DeleteOfertaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compromiso: CompromisoWithPedido;
}

export function DeleteOfertaDialog({
  open,
  onOpenChange,
  compromiso,
}: DeleteOfertaDialogProps) {
  const deleteMutation = useDeleteOferta();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(compromiso.id);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente tu oferta
            para:
            <br />
            <br />
            <strong>
              {compromiso.pedido.tipo} - {compromiso.pedido.descripcion}
            </strong>
            <br />
            <br />
            Etapa: {compromiso.pedido.etapa.nombre}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Eliminando..." : "Eliminar Oferta"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
