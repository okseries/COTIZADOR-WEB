import z from "zod";


const phoneSchema = z
  .string()
  .transform((val) => val.replace(/\D/g, "")) // Quita todo lo que no sea dígito
  .refine((val) => val.length === 10, {
    message: "El número debe tener 10 dígitos",
  })
  .transform((val) => `(${val.slice(0, 3)}) ${val.slice(3, 6)}-${val.slice(6)}`)

// Schema para cliente
export const clienteSchema = z.object({
  clientChoosen: z.number().min(0, "Debe seleccionar un cliente"), // Cambiado a 0 para permitir "sin seleccionar"
  identification: z.string().min(1, "La identificación es requerida").max(11, "La identificación debe tener 11 dígitos"),
  name: z.string().min(1, "El nombre es requerido"),
  contact: phoneSchema,
  email: z.email("Debe ser un email válido"),
  address: z.string().min(1, "La dirección es requerida"),
  office: z.string().min(1, "La oficina es requerida"),
  agent: z.string().min(1, "El agente es requerido"),
  agentId: z.number().min(1, "Debe seleccionar un agente"), // ID del agente seleccionado
  tipoPlan: z.number().min(1, "Debe seleccionar un tipo de plan"),
});


export type ClienteFormValues = z.infer<typeof clienteSchema>;
