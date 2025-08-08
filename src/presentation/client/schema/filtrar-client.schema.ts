

import z from "zod";


export const filtrarClientSchema = z.object({
  tipoDocumento: z.string().min(1, "El tipo de documento es requerido"),
  identificacion: z.string().min(1, "La identificación es requerida"),
});

export type FiltrarClientFormValues = z.infer<typeof filtrarClientSchema>;