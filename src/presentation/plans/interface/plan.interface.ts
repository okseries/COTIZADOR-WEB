export interface PlansType {
    id:           number;
    uuid:         string;
    tipoPlanName: string;
}



export interface SubPlansType {
    id:            number;
    uuid:          string;
    nameCotizante: string;
    dateCreated:   Date;
}


export interface Plan {
    id:        number;
    poliza:    string;
    plan_name: string;
}



