import { Intermediario, Promotor, Sucursal } from "@/presentation/helpers/auxs.service";

 export interface SelectOption {
  id: number;
  label: string;
  subLabel?: string;
}


export const mapIntermediarios = (data: Intermediario[]): SelectOption[] =>
  data.map((i) => ({
    id: i.id,
    label: i.nameIntermediario,
    subLabel: i.documentId,
  }));

export const mapPromotores = (data: Promotor[]): SelectOption[] =>
  data.map((p) => ({
    id: p.id,
    label: p.promotorName,
    subLabel: p.indentification,
  }));

export const mapSucursales = (data: Sucursal[]): SelectOption[] =>
  data.map((s) => ({
    id: s.id,
    label: s.officeName,
  }));