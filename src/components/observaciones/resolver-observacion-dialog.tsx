"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useResolveObservacion } from "@/hooks/observaciones/use-resolve-observacion";
import { getErrorMessage } from "@/lib/api-error";
import type { ObservacionWithRelations } from "@/types/observaciones";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface ResolverObservacionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  observacion: ObservacionWithRelations | null;
}

export function ResolverObservacionDialog({
  open,
  onOpenChange,
  observacion,
}: ResolverObservacionDialogProps) {
  const [respuesta, setRespuesta] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { mutate: resolveObservacion, isPending } = useResolveObservacion(
    observacion?.id || "",
    observacion?.proyecto_id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (respuesta.trim().length < 10) {
      setError("La respuesta debe tener al menos 10 caracteres");
      return;
    }

    if (!observacion) return;

    // Prevent resolving expired observations
    if (observacion.estado === "vencida") {
      setError("No se puede resolver una observación vencida. El plazo de 5 días ha expirado.");
      return;
    }

    resolveObservacion(
      { respuesta: respuesta.trim() },
      {
        onSuccess: () => {
          toast.success("Observación resuelta exitosamente");
          setRespuesta("");
          onOpenChange(false);
        },
        onError: (error) => {
          const message = getErrorMessage(error) || "Error al resolver la observación";
          setError(message);
          toast.error(message);
        },
      }
    );
  };

  const handleClose = () => {
    if (!isPending) {
      setRespuesta("");
      setError(null);
      onOpenChange(false);
    }
  };

  if (!observacion) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Resolver Observación</DialogTitle>
          <DialogDescription>
            Proporciona una respuesta detallada a la observación del consejo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Original observation */}
          <div className="space-y-2">
            <Label>Observación Original</Label>
            <div className="p-4 bg-muted rounded-lg border">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-semibold">{observacion.proyecto.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    Creada por {observacion.council_user.nombre} el{" "}
                    {format(new Date(observacion.created_at), "dd/MM/yyyy", { locale: es })}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Límite: {format(new Date(observacion.fecha_limite), "dd/MM/yyyy", { locale: es })}
                </div>
              </div>
              <p className="text-sm mt-2">{observacion.descripcion}</p>
            </div>
          </div>

          {/* Response textarea */}
          <div className="space-y-2">
            <Label htmlFor="respuesta">
              Tu Respuesta <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="respuesta"
              placeholder="Escribe una respuesta detallada explicando cómo se abordó la observación..."
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              rows={8}
              disabled={isPending}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {respuesta.length} / 10 caracteres mínimo
            </p>
          </div>

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Footer */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || respuesta.trim().length < 10}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resolver Observación
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
