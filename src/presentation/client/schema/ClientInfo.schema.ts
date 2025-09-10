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
  tipoDocumento: z.enum(["1", "2", "3"], {
    error: "El tipo de documento es requerido",
  }),
  clientChoosen: z.number().min(1, "El sub tipo de póliza es requerido"), 
  identification: z.string().min(1, "La identificación es requerida"),
  name: z.string().min(1, "El nombre es requerido"),
  contact: phoneSchema,
  email: emailSchema,
  address: z.string(),
  office: z.string().min(1, "La oficina es requerida"),
  agent: z.string().min(1, "El agente es requerido"),
  agentId: z.number().min(1, "Debe seleccionar un agente"), // ID del agente seleccionado
  tipoPlan: z.number().min(1, "Debe seleccionar un tipo de plan"),
}).superRefine(({ tipoDocumento, identification }, ctx) => {
  const cleaned = identification.replace(/\D/g, "");

  // Validación para Cédula (tipo "1")
  if (tipoDocumento === "1" && cleaned.length !== 11) {
    ctx.addIssue({
      path: ["identification"],
      code: z.ZodIssueCode.custom,
      message: "La cédula debe tener exactamente 11 dígitos",
    });
  }

  // Validación para Pasaporte (tipo "2")
  if (tipoDocumento === "2") {
    const trimmedValue = identification.trim();
    
    if (trimmedValue.length < 6 || trimmedValue.length > 20) {
      ctx.addIssue({
        path: ["identification"],
        code: z.ZodIssueCode.custom,
        message: "El pasaporte debe tener entre 6 y 20 caracteres",
      });
    }
    // Validar que contenga solo letras, números, guiones y espacios
    if (!/^[A-Z0-9\-\s]+$/i.test(trimmedValue)) {
      ctx.addIssue({
        path: ["identification"],
        code: z.ZodIssueCode.custom,
        message: "El pasaporte solo puede contener letras, números, guiones y espacios",
      });
    }
  }

  // Validación para RNC (tipo "3")
  if (tipoDocumento === "3" && cleaned.length !== 9) {
    ctx.addIssue({
      path: ["identification"],
      code: z.ZodIssueCode.custom,
      message: "El RNC debe tener exactamente 9 dígitos",
    });
  }
});


export type ClienteFormValues = z.infer<typeof clienteSchema>;
