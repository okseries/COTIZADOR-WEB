import { clienteSchema } from "@/presentation/client/schema/ClientInfo.schema";
import { z } from "zod";

// Schema para afiliados
export const afiliadoSchema = z.object({
  plan: z.string().min(1, "El plan es requerido"),
  parentesco: z.string().min(1, "El parentesco es requerido"),
  edad: z.number().min(0, "La edad debe ser válida"),
  subtotal: z.string().min(1, "El subtotal es requerido"),
  cantidadAfiliados: z.number().min(1, "La cantidad de afiliados debe ser mayor a 0"),
});

// Schema para opcionales
export const opcionalSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().nullable(),
  prima: z.number().min(0, "La prima debe ser un número positivo"),
  originalOptId: z.number().optional(), // 🆕 ID original del catálogo para mapeo confiable
});

// Schema para resumen de pago
export const resumenPagoSchema = z.object({
  subTotalAfiliado: z.number().min(0, "El subtotal del afiliado debe ser positivo"),
  subTotalOpcional: z.number().min(0, "El subtotal opcional debe ser positivo"),
  periodoPago: z.string().min(1, "El período de pago es requerido"),
  totalPagar: z.number().min(0, "El total a pagar debe ser positivo"),
});

// Schema para planes
export const planSchema = z.object({
  plan: z.string().min(1, "El plan es requerido"),
  afiliados: z.array(afiliadoSchema).min(1, "Debe tener al menos un afiliado"),
  opcionales: z.array(opcionalSchema).optional().default([]),
  resumenPago: resumenPagoSchema,
  cantidadAfiliados: z.number().min(1, "La cantidad de afiliados debe ser mayor a 0"),
  tipo: z.string().min(1, "El tipo es requerido"),
});



// Schema principal para cotización
export const quotationSchema = z.object({
  user: z.string().min(1, "El usuario es requerido"),
  cliente: clienteSchema,
  planes: z.array(planSchema).min(1, "Debe tener al menos un plan"),
});

export type QuotationFormValues = z.infer<typeof quotationSchema>;
export type PlanFormValues = z.infer<typeof planSchema>;
export type AfiliadoFormValues = z.infer<typeof afiliadoSchema>;
export type OpcionalFormValues = z.infer<typeof opcionalSchema>;
export type ResumenPagoFormValues = z.infer<typeof resumenPagoSchema>;