import { z } from "zod";

// Schema para crear una observación
export const observacionCreateSchema = z.object({
  proyecto_id: z.string().uuid("Selecciona un proyecto válido"),
  descripcion: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(2000, "La descripción no puede exceder 2000 caracteres"),
});

// Tipos derivados para usar en componentes
export type ObservacionCreateFormValues = z.infer<typeof observacionCreateSchema>;
