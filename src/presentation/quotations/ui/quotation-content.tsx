import React from 'react'
import QuotationTable from './quotation-table'

const QuotationContent = () => {
  return (
    <div className="flex-1  p-6 space-y-6 justify-center items-center">
      <QuotationTable data={QuotationsData} />
    </div>
  )
}

export default QuotationContent











const QuotationsData = [
    {
        "id": "1",
        "user": "juan.ditren",
        "cotizacion": {
            "user": "juan.ditren",
            "cliente": {
                "clientChoosen": 1,
                "identification": "3322323",
                "name": "hhashas",
                "contact": "2323",
                "email": "dsd@sds",
                "address": "sds",
                "office": "Sucursales",
                "agent": "HIGUEY",
                "tipoPlan": 1
            },
            "planes": [
                {
                    "plan": "FLEX SMART",
                    "afiliados": [
                        {
                            "plan": "VOLUNTARIO FLEX SMART",
                            "parentesco": "Titular",
                            "edad": 20,
                            "subtotal": "1170.33",
                            "cantidadAfiliados": 1
                        }
                    ],
                    "opcionales": [
                        {
                            "nombre": "ALTO COSTO $500,000.00 al 80%",
                            "descripcion": null,
                            "prima": 137.32
                        },
                        {
                            "nombre": "MEDICAMENTOS $8,000.00 al 80%",
                            "descripcion": null,
                            "prima": 132.23
                        },
                        {
                            "nombre": "HABITACIÓN $3,500.00 al 100%",
                            "descripcion": null,
                            "prima": 67.39
                        }
                    ],
                    "resumenPago": {
                        "subTotalAfiliado": 1170.33,
                        "subTotalOpcional": 336.94,
                        "periodoPago": "Mensual",
                        "totalPagar": 1507.27
                    },
                    "cantidadAfiliados": 1,
                    "tipo": "VOLUNTARIO"
                }
            ]
        },
        "pdf": "http://172.25.0.39/mscotizacion/app/uploads/175017826020250617.pdf",
        "fecha_creado": "2025-06-17 12:37:42"
    },
    {
        "id": "16",
        "user": "juan.ditren",
        "cotizacion": {
            "user": "juan.ditren",
            "cliente": {
                "clientChoosen": 1,
                "identification": "422242242",
                "name": "ioi",
                "contact": "7878787",
                "email": "dsdsd@ssas",
                "address": "sdsd",
                "office": "Intermediarios",
                "agent": "YRIS  ALTAGRACIA MONTAS MARTINEZ",
                "tipoPlan": 1
            },
            "planes": [
                {
                    "plan": "FLEX SMART",
                    "afiliados": [
                        {
                            "plan": "VOLUNTARIO FLEX SMART",
                            "parentesco": "Titular",
                            "edad": 30,
                            "subtotal": "1186.57",
                            "cantidadAfiliados": 1
                        }
                    ],
                    "opcionales": [
                        {
                            "nombre": "ALTO COSTO $500,000.00 al 80%",
                            "descripcion": null,
                            "prima": 137.32
                        },
                        {
                            "nombre": "MEDICAMENTOS $8,000.00 al 80%",
                            "descripcion": null,
                            "prima": 132.23
                        },
                        {
                            "nombre": "HABITACIÓN $3,500.00 al 100%",
                            "descripcion": null,
                            "prima": 67.39
                        },
                        {
                            "nombre": "ODONTOLOGIA",
                            "descripcion": "Nivel I",
                            "prima": 150
                        }
                    ],
                    "resumenPago": {
                        "subTotalAfiliado": 1186.57,
                        "subTotalOpcional": 486.94,
                        "periodoPago": "Anual",
                        "totalPagar": 20082.12
                    },
                    "cantidadAfiliados": 1,
                    "tipo": "VOLUNTARIO"
                },
                {
                    "plan": "FLEX UP",
                    "afiliados": [
                        {
                            "plan": "VOLUNTARIO FLEX UP",
                            "parentesco": "Titular",
                            "edad": 30,
                            "subtotal": "1698.98",
                            "cantidadAfiliados": 1
                        }
                    ],
                    "opcionales": [
                        {
                            "nombre": "ALTO COSTO $600,000.00 al 80%",
                            "descripcion": null,
                            "prima": 141.92
                        },
                        {
                            "nombre": "MEDICAMENTOS $9,000.00 al 70%",
                            "descripcion": null,
                            "prima": 125.4
                        },
                        {
                            "nombre": "HABITACIÓN $4,000.00 al 100%",
                            "descripcion": null,
                            "prima": 71.3
                        }
                    ],
                    "resumenPago": {
                        "subTotalAfiliado": 1698.98,
                        "subTotalOpcional": 338.62,
                        "periodoPago": "Mensual",
                        "totalPagar": 2037.6
                    },
                    "cantidadAfiliados": 1,
                    "tipo": "VOLUNTARIO"
                }
            ]
        },
        "pdf": "http://172.25.0.39/mscotizacion/app/uploads/175449148020250806.pdf",
        "fecha_creado": "2025-08-06 10:44:41"
    },
    {
        "id": "17",
        "user": "juan.ditren",
        "cotizacion": {
            "user": "juan.ditren",
            "cliente": {
                "clientChoosen": 2,
                "identification": "55656",
                "name": "fdfdf",
                "contact": "3",
                "email": "rtrt@sdsd",
                "address": "sds",
                "office": "Intermediarios",
                "agent": "YRIS  ALTAGRACIA MONTAS MARTINEZ",
                "tipoPlan": 1
            },
            "planes": [
                {
                    "plan": "FLEX UP",
                    "afiliados": [
                        {
                            "plan": "VOLUNTARIO FLEX UP",
                            "parentesco": "Titular",
                            "edad": 20,
                            "subtotal": 34033.6,
                            "cantidadAfiliados": 1
                        }
                    ],
                    "opcionales": [
                        {
                            "nombre": "ALTO COSTO $600,000.00 al 80%",
                            "descripcion": null,
                            "prima": 141.92
                        }
                    ],
                    "resumenPago": {
                        "subTotalAfiliado": 34033.6,
                        "subTotalOpcional": 141.92,
                        "periodoPago": "Mensual",
                        "totalPagar": 34175.52
                    },
                    "cantidadAfiliados": 1,
                    "tipo": "VOLUNTARIO"
                },
                {
                    "plan": "FLEX SMART",
                    "afiliados": [
                        {
                            "plan": "VOLUNTARIO FLEX SMART",
                            "parentesco": "Titular",
                            "edad": 20,
                            "subtotal": 23523.8,
                            "cantidadAfiliados": 1
                        }
                    ],
                    "opcionales": [
                        {
                            "nombre": "ALTO COSTO $500,000.00 al 80%",
                            "descripcion": null,
                            "prima": 137.32
                        }
                    ],
                    "resumenPago": {
                        "subTotalAfiliado": 23523.8,
                        "subTotalOpcional": 137.32,
                        "periodoPago": "Mensual",
                        "totalPagar": 23661.12
                    },
                    "cantidadAfiliados": 1,
                    "tipo": "VOLUNTARIO"
                }
            ]
        },
        "pdf": "http://172.25.0.39/mscotizacion/app/uploads/175449197520250806.pdf",
        "fecha_creado": "2025-08-06 10:52:55"
    },
    {
        "id": "18",
        "user": "juan.ditren",
        "cotizacion": {
            "user": "juan.ditren",
            "cliente": {
                "clientChoosen": 1,
                "identification": "34343",
                "name": "rtrt",
                "contact": "434",
                "email": "ere@dsd",
                "address": "sdsd",
                "office": "Intermediarios",
                "agent": "SANCHEZ SANCHEZ  Y ASOCIADOS  Y ASOCIADOS ",
                "tipoPlan": 1
            },
            "planes": [
                {
                    "plan": "FLEX SMART",
                    "afiliados": [
                        {
                            "plan": "VOLUNTARIO FLEX SMART",
                            "parentesco": "Titular",
                            "edad": 32,
                            "subtotal": "1186.57",
                            "cantidadAfiliados": 1
                        }
                    ],
                    "opcionales": [
                        {
                            "nombre": "ALTO COSTO $500,000.00 al 80%",
                            "descripcion": null,
                            "prima": 137.32
                        },
                        {
                            "nombre": "MEDICAMENTOS $8,000.00 al 80%",
                            "descripcion": null,
                            "prima": 132.23
                        },
                        {
                            "nombre": "HABITACIÓN $3,500.00 al 100%",
                            "descripcion": null,
                            "prima": 67.39
                        }
                    ],
                    "resumenPago": {
                        "subTotalAfiliado": 1186.57,
                        "subTotalOpcional": 336.94,
                        "periodoPago": "Mensual",
                        "totalPagar": 1523.51
                    },
                    "cantidadAfiliados": 1,
                    "tipo": "VOLUNTARIO"
                },
                {
                    "plan": "FLEX UP",
                    "afiliados": [
                        {
                            "plan": "VOLUNTARIO FLEX UP",
                            "parentesco": "Titular",
                            "edad": 32,
                            "subtotal": "1698.98",
                            "cantidadAfiliados": 1
                        }
                    ],
                    "opcionales": [
                        {
                            "nombre": "ALTO COSTO $600,000.00 al 80%",
                            "descripcion": null,
                            "prima": 141.92
                        },
                        {
                            "nombre": "MEDICAMENTOS $9,000.00 al 70%",
                            "descripcion": null,
                            "prima": 125.4
                        },
                        {
                            "nombre": "HABITACIÓN $4,000.00 al 100%",
                            "descripcion": null,
                            "prima": 71.3
                        }
                    ],
                    "resumenPago": {
                        "subTotalAfiliado": 1698.98,
                        "subTotalOpcional": 338.62,
                        "periodoPago": "Semestral",
                        "totalPagar": 12225.6
                    },
                    "cantidadAfiliados": 1,
                    "tipo": "VOLUNTARIO"
                }
            ]
        },
        "pdf": "http://172.25.0.39/mscotizacion/app/uploads/175449279920250806.pdf",
        "fecha_creado": "2025-08-06 11:06:39"
    },
    {
        "id": "19",
        "user": "juan.ditren",
        "cotizacion": {
            "user": "juan.ditren",
            "cliente": {
                "clientChoosen": 1,
                "identification": "23232",
                "name": "wew",
                "contact": "2323",
                "email": "wwe@sds",
                "address": "sdsdsd",
                "office": "Sucursales",
                "agent": "CONSTANZA",
                "tipoPlan": 1
            },
            "planes": [
                {
                    "plan": "FLEX SMART",
                    "afiliados": [
                        {
                            "plan": "VOLUNTARIO FLEX SMART",
                            "parentesco": "Titular",
                            "edad": 22,
                            "subtotal": "1170.33",
                            "cantidadAfiliados": 1
                        }
                    ],
                    "opcionales": [
                        {
                            "nombre": "ALTO COSTO $500,000.00 al 80%",
                            "descripcion": null,
                            "prima": 137.32
                        },
                        {
                            "nombre": "MEDICAMENTOS $8,000.00 al 80%",
                            "descripcion": null,
                            "prima": 132.23
                        },
                        {
                            "nombre": "HABITACIÓN $3,500.00 al 100%",
                            "descripcion": null,
                            "prima": 67.39
                        }
                    ],
                    "resumenPago": {
                        "subTotalAfiliado": 1170.33,
                        "subTotalOpcional": 336.94,
                        "periodoPago": "Mensual",
                        "totalPagar": 1507.27
                    },
                    "cantidadAfiliados": 1,
                    "tipo": "VOLUNTARIO"
                }
            ]
        },
        "pdf": "http://172.25.0.39/mscotizacion/app/uploads/175450783420250806.pdf",
        "fecha_creado": "2025-08-06 15:17:14"
    }
]