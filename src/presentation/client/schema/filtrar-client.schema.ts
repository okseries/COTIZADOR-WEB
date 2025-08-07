

import z from "zod";


export const filtrarClientSchema = z.object({
  tipoPoliza: z.string().min(1, "El tipo de póliza es requerido"),
  subTipoPoliza: z.string().min(1, "El subtipo de póliza es requerido"),
  tipoDocumento: z.string().min(1, "El tipo de documento es requerido"),
  identificacion: z.string().min(1, "La identificación es requerida"),
});

export type FiltrarClientFormValues = z.infer<typeof filtrarClientSchema>;