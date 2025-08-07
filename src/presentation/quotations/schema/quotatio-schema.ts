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

// Schema principal para cotización
export const quotationSchema = z.object({
  user: z.string().min(1, "El usuario es requerido"),
  cliente: clienteSchema,
  planes: z.array(planSchema).min(1, "Debe tener al menos un plan"),
});

export type QuotationFormValues = z.infer<typeof quotationSchema>;
export type ClienteFormValues = z.infer<typeof clienteSchema>;
export type PlanFormValues = z.infer<typeof planSchema>;
export type AfiliadoFormValues = z.infer<typeof afiliadoSchema>;
export type OpcionalFormValues = z.infer<typeof opcionalSchema>;
export type ResumenPagoFormValues = z.infer<typeof resumenPagoSchema>;