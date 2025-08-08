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

    if (tipoDocumento === "1" && cleaned.length !== 11) {
      ctx.addIssue({
        path: ["identificacion"],
        code: z.ZodIssueCode.custom,
        message: "La cédula debe tener exactamente 11 dígitos",
      });
    }

    if (tipoDocumento === "2" && cleaned.length !== 9) {
      ctx.addIssue({
        path: ["identificacion"],
        code: z.ZodIssueCode.custom,
        message: "El RNC debe tener exactamente 9 dígitos",
      });
    }

    if (tipoDocumento === "3" && identificacion.length > 20) {
      ctx.addIssue({
        path: ["identificacion"],
        code: z.ZodIssueCode.custom,
        message: "El pasaporte no debe exceder los 20 caracteres",
      });
    }
  });

export type FiltrarClientFormValues = z.infer<typeof filtrarClientSchema>;
