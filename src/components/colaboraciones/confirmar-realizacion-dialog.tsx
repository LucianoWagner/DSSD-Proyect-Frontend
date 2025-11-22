"use client";

/**
 * Diálogo para confirmar que se completó un compromiso
 */

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
import { Loader2 } from "lucide-react";
import { useConfirmarRealizacion } from "@/hooks/colaboraciones/use-confirmar-realizacion";

interface ConfirmarRealizacionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ofertaId: string;
  pedidoDescripcion: string;
}

export function ConfirmarRealizacionDialog({
  open,
  onOpenChange,
  ofertaId,
  pedidoDescripcion,
}: ConfirmarRealizacionDialogProps) {
  const { mutate: confirmar, isPending } = useConfirmarRealizacion();

  const handleConfirm = () => {
    confirmar(ofertaId, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Confirmar realización del compromiso?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Estás a punto de confirmar que has completado el siguiente
              compromiso:
            </p>
            <p className="font-medium text-foreground">{pedidoDescripcion}</p>
            <p className="text-sm">
              Una vez confirmado, el pedido se marcará como completado y no
              podrás deshacer esta acción.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Realización
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
