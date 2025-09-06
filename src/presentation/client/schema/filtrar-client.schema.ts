import z from "zod";

export const filtrarClientSchema = z
  .object({
    tipoDocumento: z.enum(["1", "2", "3"], {
      error: "El tipo de documento es requerido",
    }),
    identificacion: z.string().min(1, "La identificación es requerida"),
  })
  .superRefine(({ tipoDocumento, identificacion }, ctx) => {
    const cleaned = identificacion.replace(/\D/g, "");

    // Validación para Cédula (tipo "1")
    if (tipoDocumento === "1" && cleaned.length !== 11) {
      ctx.addIssue({
        path: ["identificacion"],
        code: z.ZodIssueCode.custom,
        message: "La cédula debe tener exactamente 11 dígitos",
      });
    }

    // Validación para Pasaporte (tipo "2") - SIMPLIFICADA
    if (tipoDocumento === "2") {
      const trimmedValue = identificacion.trim();
      
      if (trimmedValue.length < 6 || trimmedValue.length > 20) {
        ctx.addIssue({
          path: ["identificacion"],
          code: z.ZodIssueCode.custom,
          message: "El pasaporte debe tener entre 6 y 20 caracteres",
        });
      }
      // Validar que contenga solo letras, números, guiones y espacios
      if (!/^[A-Z0-9\-\s]+$/i.test(trimmedValue)) {
        ctx.addIssue({
          path: ["identificacion"],
          code: z.ZodIssueCode.custom,
          message: "El pasaporte solo puede contener letras, números, guiones y espacios",
        });
      }
    }

    // Validación para RNC (tipo "3")
    if (tipoDocumento === "3" && cleaned.length !== 9) {
      ctx.addIssue({
        path: ["identificacion"],
        code: z.ZodIssueCode.custom,
        message: "El RNC debe tener exactamente 9 dígitos",
      });
    }
  });

export type FiltrarClientFormValues = z.infer<typeof filtrarClientSchema>;
