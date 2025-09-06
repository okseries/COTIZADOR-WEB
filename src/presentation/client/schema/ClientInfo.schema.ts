import z from "zod";


const phoneSchema = z
  .string()
  .optional()
  .refine((val) => {
    if (!val || val.trim() === "") return true; // Permitir vacío (opcional)
    
    const digits = val.replace(/\D/g, "");
    
    // Validar teléfonos internacionales (mínimo 7 dígitos, máximo 15)
    if (digits.length < 7 || digits.length > 15) {
      return false;
    }
    
    return true;
  }, {
    message: "El teléfono debe tener entre 7 y 15 dígitos",
  })
  .transform((val) => {
    if (!val || val.trim() === "") return undefined;
    
    const digits = val.replace(/\D/g, "");
    
    // Para números dominicanos (10 dígitos que empiezan con 809, 829, 849)
    if (digits.length === 10 && (digits.startsWith("809") || digits.startsWith("829") || digits.startsWith("849"))) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    // Para números internacionales, formato simple con espacios
    if (digits.length > 10) {
      return `+${digits.slice(0, digits.length - 10)} ${digits.slice(-10, -7)} ${digits.slice(-7, -4)} ${digits.slice(-4)}`;
    }
    
    // Para otros números nacionales
    if (digits.length <= 10) {
      if (digits.length < 4) return digits;
      if (digits.length < 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
    
    return val;
  })

const emailSchema = z
  .string()
  .optional()
  .refine((val) => {
    if (!val || val.trim() === "") return true; // Permitir vacío (opcional)
    return z.string().email().safeParse(val).success;
  }, {
    message: "Debe ser un email válido"
  })
  .transform((val) => {
    if (!val || val.trim() === "") return undefined;
    return val;
  })

// Schema para cliente
export const clienteSchema = z.object({
  clientChoosen: z.number().min(1, "El sub tipo de póliza es requerido"), 
  identification: z.string().min(1, "La identificación es requerida").max(20, "La identificación debe tener máximo 20 caracteres"),
  name: z.string().min(1, "El nombre es requerido"),
  contact: phoneSchema,
  email: emailSchema,
  address: z.string(),
  office: z.string().min(1, "La oficina es requerida"),
  agent: z.string().min(1, "El agente es requerido"),
  agentId: z.number().min(1, "Debe seleccionar un agente"), // ID del agente seleccionado
  tipoPlan: z.number().min(1, "Debe seleccionar un tipo de plan"),
});


export type ClienteFormValues = z.infer<typeof clienteSchema>;
