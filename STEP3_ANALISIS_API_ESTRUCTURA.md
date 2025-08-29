# STEP 3 - ANÁLISIS ESTRUCTURA API: Coberturas Opcionales

## 📋 RESUMEN EJECUTIVO

Este documento analiza la estructura de datos del Step 3 (Coberturas Opcionales) desde la **creación** hasta la **edición**, identificando inconsistencias entre IDs del store local y la API que causan problemas en los selects.

## 🔄 FLUJO COMPLETO DE DATOS

### 1. MODO CREAR - Datos que se envían al backend

#### 1.1 Estructura que se envía en QuotationRequest
```typescript
interface QuotationRequest {
  user: string | null;
  cliente: Cliente | null;
  planes: Plan[];
}

interface Plan {
  plan: string;                    // Nombre del plan (ej: "PLAN INTEGRAL")
  afiliados: Afiliado[];
  opcionales: Opcional[];          // ⚠️ AQUÍ ESTÁN LAS COBERTURAS OPCIONALES
  resumenPago: ResumenPago;
  cantidadAfiliados: number;
  tipo: string;
}

interface Opcional {
  id: number;                      // ⚠️ ID secuencial del store (1,2,3,4,5,6...)
  idCopago?: number;               // ID del copago seleccionado
  nombre: string;                  // "ALTO COSTO", "MEDICAMENTOS", etc.
  descripcion: string | null;
  prima: number;                   // Prima calculada
  tipoOpcionalId?: number;         // ⚠️ NUEVO: ID del tipo (1=MED, 2=ALTO, 3=HAB, 4=ODONT)
}
```

#### 1.2 Ejemplo real de datos enviados (COLECTIVO)
```json
{
  "user": "usuario@email.com",
  "cliente": {
    "clientChoosen": 2,
    "tipoPlan": 1,
    "identification": "123456789",
    "name": "Empresa ABC"
  },
  "planes": [
    {
      "plan": "PLAN INTEGRAL",
      "cantidadAfiliados": 50,
      "opcionales": [
        {
          "id": 1,                    // ⚠️ ID SECUENCIAL DEL STORE
          "idCopago": 15,
          "nombre": "ALTO COSTO",
          "descripcion": "Cobertura para medicamentos de alto costo hasta $5,000,000",
          "prima": 125000,
          "tipoOpcionalId": 3         // ⚠️ ID REAL DE LA API (Alto Costo = 3)
        },
        {
          "id": 2,                    // ⚠️ ID SECUENCIAL DEL STORE
          "idCopago": 8,
          "nombre": "MEDICAMENTOS",
          "descripcion": "Cobertura para medicamentos con copago del 20%",
          "prima": 75000,
          "tipoOpcionalId": 1         // ⚠️ ID REAL DE LA API (Medicamentos = 1)
        },
        {
          "id": 3,                    // ⚠️ ID SECUENCIAL DEL STORE
          "nombre": "HABITACION",
          "descripcion": "Habitación unipersonal",
          "prima": 50000,
          "tipoOpcionalId": 2         // ⚠️ ID REAL DE LA API (Habitación = 2)
        },
        {
          "id": 4,                    // ⚠️ ID SECUENCIAL DEL STORE
          "nombre": "ODONTOLOGIA",
          "descripcion": "Sin cobertura",
          "prima": 0,
          "tipoOpcionalId": 4         // ⚠️ ID REAL DE LA API (Odontología = 4)
        }
      ]
    }
  ]
}
```

### 2. DATOS GUARDADOS EN BASE DE DATOS

#### 2.1 Lo que probablemente se guarda en BD:
```sql
-- Tabla: cotizaciones
CREATE TABLE cotizaciones (
  id INT PRIMARY KEY,
  user VARCHAR(255),
  cliente_data JSON,
  fecha_creacion TIMESTAMP,
  estado VARCHAR(50)
);

-- Tabla: planes_cotizacion  
CREATE TABLE planes_cotizacion (
  id INT PRIMARY KEY,
  cotizacion_id INT,
  plan_nombre VARCHAR(255),
  cantidad_afiliados INT,
  total_prima DECIMAL(10,2)
);

-- Tabla: opcionales_cotizacion
CREATE TABLE opcionales_cotizacion (
  id INT PRIMARY KEY,
  plan_cotizacion_id INT,
  opcional_id INT,              -- ⚠️ ESTE ES EL ID SECUENCIAL DEL STORE
  tipo_opcional_id INT,         -- ⚠️ ESTE ES EL ID REAL DE LA API
  copago_id INT,
  nombre VARCHAR(255),
  descripcion TEXT,
  prima DECIMAL(10,2)
);
```

#### 2.2 Datos reales guardados (ejemplo):
```json
// Registro en opcionales_cotizacion
{
  "id": 101,
  "plan_cotizacion_id": 25,
  "opcional_id": 1,              // ⚠️ ID DEL STORE (secuencial)
  "tipo_opcional_id": 36,        // ⚠️ ID REAL DE LA API (Alto Costo: rango 36-45)
  "copago_id": 15,
  "nombre": "ALTO COSTO",
  "descripcion": "Cobertura para medicamentos de alto costo hasta $5,000,000",
  "prima": 125000
}
```

### 3. MODO EDITAR - Datos que se cargan desde BD

#### 3.1 Response de la API para edición:
```json
{
  "id": 12345,
  "user": "usuario@email.com",
  "cliente": { /* datos del cliente */ },
  "planes": [
    {
      "plan": "PLAN INTEGRAL",
      "opcionales": [
        {
          "id": 1,                    // ⚠️ ID SECUENCIAL (del store original)
          "idCopago": 15,
          "nombre": "ALTO COSTO",
          "descripcion": "Cobertura para medicamentos de alto costo hasta $5,000,000",
          "prima": 125000,
          "tipoOpcionalId": 36        // ⚠️ ID REAL DE LA API ≠ ID DEL STORE
        }
      ]
    }
  ]
}
```

## 🔌 ENDPOINTS UTILIZADOS

### 3.1 Durante CREACIÓN (colectivos):

#### A. Cargar opciones de select dinámicos:
```typescript
// Alto Costo - Obtener opciones disponibles
GET /opcionales-planes/3/2
// Parámetros: tipoOpcional=3 (Alto Costo), clientChoosen=2 (Colectivo)

// Medicamentos - Obtener opciones disponibles  
GET /opcionales-planes/1/2
// Parámetros: tipoOpcional=1 (Medicamentos), clientChoosen=2 (Colectivo)

// Habitación - Obtener opciones disponibles
GET /opcionales-planes/2/2
// Parámetros: tipoOpcional=2 (Habitación), clientChoosen=2 (Colectivo)

// Odontología - Obtener opciones disponibles
GET /opcionales-planes/4/2
// Parámetros: tipoOpcional=4 (Odontología), clientChoosen=2 (Colectivo)
```

#### B. Cargar opciones de copagos:
```typescript
// Copagos para Medicamentos
GET /opcionales-planes/copagos/1/2
// Parámetros: tipoOpcional=1 (Medicamentos), clientChoosen=2 (Colectivo)

// Copagos para Alto Costo
GET /opcionales-planes/copagos/3/2
// Parámetros: tipoOpcional=3 (Alto Costo), clientChoosen=2 (Colectivo)

// Copagos para Habitación
GET /opcionales-planes/copagos/2/2
// Parámetros: tipoOpcional=2 (Habitación), clientChoosen=2 (Colectivo)
```

### 3.2 Durante CREACIÓN (individuales):
```typescript
// Para planes individuales - obtener opcionales específicos del plan
GET /opcionales-planes/{planName}/{clientChoosen}/{tipoPlan}
// Ejemplo: GET /opcionales-planes/PLAN INTEGRAL/1/1
```

### 3.3 Durante EDICIÓN:
```typescript
// Mismos endpoints que en creación, pero se cargan para mostrar las opciones
// disponibles y mapear las selecciones existentes
```

## ⚠️ PROBLEMAS IDENTIFICADOS

### 1. INCONSISTENCIA DE IDs

#### Problema Principal:
- **Store Local**: Usa IDs secuenciales (1, 2, 3, 4, 5, 6...)
- **API Real**: Usa rangos específicos por tipo:
  - Alto Costo: IDs 36-45
  - Medicamentos: IDs 1-32  
  - Habitación: IDs 46-65
  - Odontología: IDs estáticos

#### Impacto:
```typescript
// En MODO CREAR: Store envía
{
  "id": 1,                    // ID secuencial
  "nombre": "ALTO COSTO",
  "tipoOpcionalId": 3         // Tipo correcto
}

// En MODO EDITAR: BD devuelve
{
  "id": 1,                    // Mismo ID secuencial
  "nombre": "ALTO COSTO", 
  "tipoOpcionalId": 36        // ⚠️ ID REAL de la API ≠ ID del store
}

// Los selects buscan option.opt_id = 1, pero la API tiene opt_id = 36
// RESULTADO: Select aparece vacío
```

### 2. MAPEO INCORRECTO EN SELECTS

#### Select de Coberturas:
```typescript
// Select busca:
value={dynamicCoberturaSelections[plan.plan]?.altoCosto || ""}

// Pero tiene opciones con:
options = [
  { opt_id: 36, descripcion: "...", prima: 2500 },  // API real
  { opt_id: 37, descripcion: "...", prima: 3500 },
  // ...
]

// Y el valor guardado es "1" (del store), no "36" (de la API)
```

## 🔧 SOLUCIONES IMPLEMENTADAS

### 1. Mapeo Inteligente por Prima
```typescript
// En lugar de buscar por ID exacto, buscar por prima similar
const detectTipoOpcionalId = (
  opcional: Opcional, 
  apiOptions: CoberturasOpcionaleColectivo[]
): string | null => {
  const cantidadAfiliados = plan.cantidadAfiliados || 1;
  const primaUnitaria = opcional.prima / cantidadAfiliados;
  
  // Buscar opción con prima similar (tolerancia ±1 peso)
  const match = apiOptions.find(option => 
    Math.abs(option.opt_prima - primaUnitaria) < 1
  );
  
  return match ? match.opt_id.toString() : null;
};
```

### 2. Inicialización Forzada en Modo Edición
```typescript
// Forzar carga de todas las opciones en modo edición
const shouldLoadOptions = isColectivo && (
  isEditMode ||  // ⚠️ FORZAR en modo edición
  globalFilters.altoCosto || 
  globalFilters.medicamentos || 
  globalFilters.habitacion || 
  globalFilters.odontologia
);
```

## 📊 RESUMEN DE INCONSISTENCIAS

| Cobertura | ID Store | ID API Real | Problema |
|-----------|----------|-------------|----------|
| Alto Costo | 1-6 | 36-45 | Select vacío en edición |
| Medicamentos | 1-6 | 1-32 | Coincidencia parcial |
| Habitación | 1-6 | 46-65 | Select vacío en edición |
| Odontología | 1-6 | Estático | Mapeo por prima |

## 🎯 RECOMENDACIONES PARA CORREGIR EN API

### 1. Normalizar IDs en el Backend
```sql
-- Opción 1: Usar siempre el ID real de la API
UPDATE opcionales_cotizacion 
SET opcional_id = tipo_opcional_id 
WHERE tipo_opcional_id IS NOT NULL;

-- Opción 2: Crear mapeo consistente
ALTER TABLE opcionales_cotizacion 
ADD COLUMN api_option_id INT;
```

### 2. Modificar Endpoints de Edición
```typescript
// En lugar de devolver el ID del store:
{
  "id": 1,                    // ID secuencial del store
  "tipoOpcionalId": 36        // ID real de la API
}

// Devolver directamente el ID de la API:
{
  "id": 36,                   // ID real de la API
  "tipoOpcionalId": 36        // Mismo valor para consistencia
}
```

### 3. Validar Consistencia en Creación
```typescript
// Al recibir QuotationRequest, validar que:
// opcional.id coincida con opcional.tipoOpcionalId
// o usar solo tipoOpcionalId como fuente de verdad
```

---

**Fecha**: ${new Date().toLocaleDateString()}  
**Versión**: 1.0  
**Estado**: Análisis Completo - Pendiente Corrección en API
