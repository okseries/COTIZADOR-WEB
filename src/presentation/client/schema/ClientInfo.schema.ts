import z from "zod";

// Schema para cliente
export const clienteSchema = z.object({
  clientChoosen: z.number().min(1, "Debe seleccionar un cliente"),
  identification: z.string().min(1, "La identificación es requerida"),
  name: z.string().min(1, "El nombre es requerido"),
  contact: z.string().min(1, "El contacto es requerido"),
  email: z.email("Debe ser un email válido"),
  address: z.string().min(1, "La dirección es requerida"),
  office: z.string().min(1, "La oficina es requerida"),
  agent: z.string().min(1, "El agente es requerido"),
  tipoPlan: z.number().min(1, "Debe seleccionar un tipo de plan"),
});


export type ClienteFormValues = z.infer<typeof clienteSchema>;
