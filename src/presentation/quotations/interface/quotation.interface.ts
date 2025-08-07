export interface Quotations {
    id:           string;
    user:         string;
    cotizacion:   Cotizacion;
    pdf:          string;
    fecha_creado: string;
}

export interface Cotizacion {
    user:    string;
    cliente: Cliente;
    planes:  Plane[];
}

export interface Cliente {
    clientChoosen:  number;
    identification: string;
    name:           string;
    contact:        string;
    email:          string;
    address:        string;
    office:         string;
    agent:          string;
    agentId?:       number;
    tipoPlan:       number;
}

export interface Plane {
    plan:              string;
    afiliados:         Afiliado[];
    opcionales:        Opcionale[];
    resumenPago:       ResumenPago;
    cantidadAfiliados: number;
    tipo:              string;
}

export interface Afiliado {
    plan:              string;
    parentesco:        string;
    edad:              number;
    subtotal:          number | string;
    cantidadAfiliados: number;
}

export interface Opcionale {
    nombre:      string;
    descripcion: null | string;
    prima:       number;
}

export interface ResumenPago {
    subTotalAfiliado: number;
    subTotalOpcional: number;
    periodoPago:      string;
    totalPagar:       number;
}
