export interface CoberturasOpcional {
    id:               number;
    nombrePlan:       string;
    altoCosto:        string;
    medicamento:      string;
    habitacion:       string;
    primaCosto:       string;
    medicamentoCosto: string;
    habitacionCosto:  string;
    idCotizante:      number;
    idTipoPlan:       number;
}





export interface CoberturasOpcionaleColectivo {
    opt_id:         number;
    opt_percentage: string;
    opt_prima:      string;
    limit_price:    string;
    tipoNombre:     string;
    descripcion:    string;
}



export interface Copago {
    id:          number;
    name:        string;
    price:       number;
    descripcion: string;
}





