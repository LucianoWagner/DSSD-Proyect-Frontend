"use client";

/**
 * Diálogo para crear una oferta en un pedido
 */

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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCreateOferta } from "@/hooks/colaboraciones/use-create-oferta";
import type { PedidoBasic } from "@/types/colaboraciones";

// Schema de validación
const ofertaSchema = z.object({
  descripcion: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(500, "La descripción no puede exceder 500 caracteres"),
  monto_ofrecido: z.string().optional(),
});

type OfertaFormData = z.infer<typeof ofertaSchema>;

interface CrearOfertaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedido: PedidoBasic;
  proyectoTitulo?: string;
}

export function CrearOfertaDialog({
  open,
  onOpenChange,
  pedido,
  proyectoTitulo,
}: CrearOfertaDialogProps) {
  const { mutate: crearOferta, isPending } = useCreateOferta();

  const form = useForm<OfertaFormData>({
    resolver: zodResolver(ofertaSchema),
    defaultValues: {
      descripcion: "",
      monto_ofrecido: undefined,
    },
  });

  const onSubmit = (data: OfertaFormData) => {
    crearOferta(
      {
        pedidoId: pedido.id,
        data: {
          descripcion: data.descripcion,
          monto_ofrecido: data.monto_ofrecido ? parseFloat(data.monto_ofrecido) : undefined,
        },
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Hacer Oferta</DialogTitle>
          <DialogDescription>
            Envía una oferta para ayudar con este pedido
          </DialogDescription>
        </DialogHeader>

        {/* Información del pedido */}
        <div className="rounded-lg bg-muted p-3 space-y-1">
          {proyectoTitulo && (
            <p className="text-sm font-medium">{proyectoTitulo}</p>
          )}
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Pedido:</span> {pedido.tipo} -{" "}
            {pedido.descripcion}
          </p>
          {pedido.monto && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Monto solicitado:</span>{" "}
              {pedido.moneda} {pedido.monto.toLocaleString("es-AR")}
            </p>
          )}
          {pedido.cantidad && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Cantidad:</span> {pedido.cantidad}{" "}
              {pedido.unidad}
            </p>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Descripción */}
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción de tu oferta *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe cómo puedes ayudar con este pedido..."
                      className="min-h-[100px]"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Explica qué puedes ofrecer y cómo ayudarás (mín. 10
                    caracteres)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Monto ofrecido (opcional) */}
            <FormField
              control={form.control}
              name="monto_ofrecido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto a ofrecer (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="15000"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Si ofreces un monto monetario, indícalo aquí (en ARS)
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
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Oferta
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
