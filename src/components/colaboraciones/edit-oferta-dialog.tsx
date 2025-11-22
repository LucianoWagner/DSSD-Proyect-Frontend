"use client";

/**
 * Dialog para editar una oferta pendiente
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateOferta } from "@/hooks/colaboraciones/use-update-oferta";
import type { CompromisoWithPedido } from "@/types/colaboraciones";

const editOfertaSchema = z.object({
  descripcion: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(500, "La descripción no puede exceder 500 caracteres"),
  monto_ofrecido: z
    .number()
    .positive("El monto debe ser mayor a 0")
    .optional()
    .or(z.literal(0).transform(() => undefined)),
});

type EditOfertaFormData = z.infer<typeof editOfertaSchema>;

interface EditOfertaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compromiso: CompromisoWithPedido;
}

export function EditOfertaDialog({
  open,
  onOpenChange,
  compromiso,
}: EditOfertaDialogProps) {
  const updateMutation = useUpdateOferta();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditOfertaFormData>({
    resolver: zodResolver(editOfertaSchema),
    defaultValues: {
      descripcion: compromiso.descripcion,
      monto_ofrecido: compromiso.monto_ofrecido || 0,
    },
  });

  // Reset form when compromiso changes
  useEffect(() => {
    if (open) {
      form.reset({
        descripcion: compromiso.descripcion,
        monto_ofrecido: compromiso.monto_ofrecido || 0,
      });
    }
  }, [open, compromiso, form]);

  const onSubmit = async (data: EditOfertaFormData) => {
    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({
        ofertaId: compromiso.id,
        data: {
          descripcion: data.descripcion,
          monto_ofrecido: data.monto_ofrecido || undefined,
        },
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Editar Oferta</DialogTitle>
          <DialogDescription>
            Modifica tu oferta para: {compromiso.pedido.tipo} -{" "}
            {compromiso.pedido.descripcion}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción de tu oferta</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe tu oferta en detalle..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Explica qué puedes ofrecer y en qué condiciones (mínimo 10 caracteres)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monto_ofrecido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto Ofrecido (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value) : 0
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Si aplica, ingresa el monto que estás ofreciendo (en {compromiso.pedido.moneda || "ARS"})
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
