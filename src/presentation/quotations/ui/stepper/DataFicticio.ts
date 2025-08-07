// Datos ficticios para los selects del stepper

export const mockClients = [
  {
    id: 1,
    name: "Juan Pérez",
    identification: "12345678",
    contact: "555-0001",
    email: "juan.perez@email.com",
    address: "Calle 123 #45-67"
  },
  {
    id: 2,
    name: "María García",
    identification: "87654321",
    contact: "555-0002",
    email: "maria.garcia@email.com",
    address: "Avenida 456 #78-90"
  },
  {
    id: 3,
    name: "Carlos López",
    identification: "11223344",
    contact: "555-0003",
    email: "carlos.lopez@email.com",
    address: "Carrera 789 #12-34"
  }
];

export const mockOffices = [
  { id: 1, name: "Sucursal Centro" },
  { id: 2, name: "Sucursal Norte" },
  { id: 3, name: "Sucursal Sur" },
  { id: 4, name: "Sucursal Este" }
];

export const mockAgents = [
  { id: 1, name: "CONSTANZA" },
  { id: 2, name: "RODRIGO" },
  { id: 3, name: "ANDREA" },
  { id: 4, name: "MIGUEL" }
];

export const mockPlanTypes = [
  { id: 1, name: "Plan Básico", description: "Cobertura básica de salud" },
  { id: 2, name: "Plan Premium", description: "Cobertura completa con beneficios adicionales" },
  { id: 3, name: "Plan Familiar", description: "Cobertura para toda la familia" }
];

export const mockPlans = [
  {
    id: 1,
    name: "FLEX SMART",
    type: "VOLUNTARIO",
    basePrice: 1170.33,
    description: "Plan flexible con cobertura inteligente"
  },
  {
    id: 2,
    name: "PLUS TOTAL",
    type: "OBLIGATORIO",
    basePrice: 2250.50,
    description: "Plan completo con todas las coberturas"
  },
  {
    id: 3,
    name: "BÁSICO SALUD",
    type: "VOLUNTARIO",
    basePrice: 850.75,
    description: "Plan básico de salud"
  }
];

export const mockParentesco = [
  { id: 1, name: "Titular" },
  { id: 2, name: "Cónyuge" },
  { id: 3, name: "Hijo(a)" },
  { id: 4, name: "Padre/Madre" },
  { id: 5, name: "Hermano(a)" }
];

export const mockOptionalCoverages = [
  {
    id: 1,
    nombre: "ALTO COSTO $500,000.00 al 80%",
    descripcion: "Cobertura para tratamientos de alto costo",
    prima: 137.32
  },
  {
    id: 2,
    nombre: "MEDICAMENTOS $8,000.00 al 80%",
    descripcion: "Cobertura de medicamentos hasta $8,000",
    prima: 132.23
  },
  {
    id: 3,
    nombre: "HABITACIÓN $3,500.00 al 100%",
    descripcion: "Cobertura completa de habitación hospitalaria",
    prima: 67.39
  },
  {
    id: 4,
    nombre: "CIRUGÍAS ESPECIALIZADAS",
    descripcion: "Cobertura para cirugías especializadas",
    prima: 245.80
  },
  {
    id: 5,
    nombre: "ODONTOLOGÍA INTEGRAL",
    descripcion: "Cobertura dental completa",
    prima: 89.45
  }
];

export const mockPaymentPeriods = [
  { id: 1, name: "Mensual", multiplier: 1 },
  { id: 2, name: "Trimestral", multiplier: 3, discount: 0.05 },
  { id: 3, name: "Semestral", multiplier: 6, discount: 0.08 },
  { id: 4, name: "Anual", multiplier: 12, discount: 0.12 }
];
