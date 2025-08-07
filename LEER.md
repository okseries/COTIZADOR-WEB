# 📋 Documentación de Migración: Angular → Next.js

## 🏗️ Arquitectura del Cotizador Angular

### **Base URL API**
```
http://172.25.8.241:3000/
```

---

## 🔐 **STEP 0: Autenticación (Login)**

### **Endpoint**
```http
POST /login
```

### **Payload**
```typescript
{
  "user": "usuario_input",
  "password": "password_input"
}
```

### **Respuesta**
```typescript
{
  "token": "jwt_token_aqui"
}
```

### **Flujo**
1. Usuario ingresa credenciales
2. Se envía POST a `/login`
3. Si es exitoso, se guarda el token en `localStorage` con key `'user'`
4. Se redirige a `/dashboard`
5. En otras páginas se decodifica el JWT para obtener datos del usuario

### **Manejo del JWT**
```typescript
// Guardar token
localStorage.setItem('user', response.token);

// Leer y decodificar en otras páginas
const token = localStorage.getItem('user');
const decoded = jwtDecode(token);
const userName = decoded.data.user;
```

---

## 👤 **STEP 1: Información del Cliente**

### **Endpoints utilizados**

#### **1. Obtener Tipos de Planes**
```http
GET /planes/types
```
**Uso:** Cargar dropdown de tipos de planes

#### **2. Obtener Tipos de Cotizantes**
```http
GET /cotizantes
```
**Uso:** Cargar dropdown de tipos de cotizantes

#### **3. Obtener Sucursales**
```http
GET /sucursales
```
**Uso:** Cargar opciones cuando se selecciona "Sucursales"

#### **4. Obtener Intermediarios**
```http
GET /intermediarios
```
**Uso:** Cargar opciones cuando se selecciona "Intermediarios"

#### **5. Obtener Promotores**
```http
GET /promotores
```
**Uso:** Cargar opciones cuando se selecciona "Negocios"

### **Lógica del Formulario**
- **Campos dinámicos:** Según selección de "Oficina/Sucursal" cambian las opciones del dropdown "Corredor"
- **Validaciones:** Solo números para cédula/contacto, solo letras para nombre, email válido
- **Botón "Buscar":** Actualmente solo muestra campos adicionales (no consume API)

### **Datos enviados al siguiente step**
```typescript
{
  clientChoosen: number,      // Tipo de cotizante
  identification: string,     // Cédula/RNC
  name: string,              // Nombre
  contact: string,           // Contacto
  email: string,             // Email
  address: string,           // Dirección
  office: string,            // Oficina/Sucursal
  agent: string,             // Corredor
  tipoPlan: number           // Tipo de plan
}
```

---

## 🏥 **STEP 2: Categoría/Selección de Planes**

### **Endpoints utilizados**

#### **1. Obtener Planes por Tipo**
```http
GET /planes/{polizaType}/{planType}
```
**Parámetros:**
- `polizaType`: `clientChoosen` del Step 1
- `planType`: `tipoPlan` del Step 1

**Ejemplo:** `GET /planes/1/1`

**Respuesta:**
```typescript
[{
  id: number,
  poliza: string,        // "VOLUNTARIO", "COMPLEMENTARIO"
  plan_name: string      // "FLEX SMART", "UP", "CARE", etc.
}]
```

#### **2. Obtener Parentescos**
```http
GET /parentesco
```
**Uso:** Cargar dropdown de parentescos

#### **3. Calcular Monto Base por Afiliado**
```http
GET /planes/{planName}/{age}/{typeplan}/{typecotizante}
```
**Parámetros:**
- `planName`: Nombre del plan (ej: "FLEX SMART")
- `age`: Edad del afiliado
- `typeplan`: `tipoPlan` del Step 1
- `typecotizante`: `clientChoosen` del Step 1

**Ejemplo:** `GET /planes/FLEX%20SMART/25/1/1`

**Respuesta:**
```typescript
[{
  baseAmount: number    // Monto base calculado
}]
```

### **Lógica del Formulario**
1. Usuario selecciona planes disponibles
2. Usuario agrega afiliados con parentesco y edad
3. Por cada afiliado agregado se calcula el monto base
4. Se agrupan afiliados por plan
5. **Restricción:** Solo un "Titular" por plan

### **Datos enviados al siguiente step**
```typescript
// Array de afiliados agrupados por plan
[{
  plan: string,           // Nombre completo del plan
  parentescos: string,    // "Titular", "Cónyuge", etc.
  edad: number,          // Edad del afiliado
  baseAmunt: number      // Monto base calculado
}]
```

---

## 💊 **STEP 3: Coberturas Opcionales**

### **Endpoint utilizado**
```http
GET /opcionales-planes/{planName}/{cotizante}/{tipoPlan}
```
**Parámetros:**
- `planName`: Nombre del plan limpio (sin "VOLUNTARIO"/"COMPLEMENTARIO")
- `cotizante`: `clientChoosen` del Step 1
- `tipoPlan`: `tipoPlan` del Step 1

**Ejemplo:** `GET /opcionales-planes/FLEX%20SMART/2/1`

### **Lógica Condicional según Tipo de Cliente**

#### **Si `clientChoosen === 2` (Cliente Colectivo):**
- ✅ **Muestra checkboxes** para seleccionar coberturas
- ✅ **Opciones:** ['ALTO COSTO', 'MEDICAMENTOS', 'HABITACIÓN', 'ODONTOLOGÍA']
- ✅ **Usuario puede filtrar** qué coberturas ver
- ✅ **Tabla dinámica** según selección

#### **Si `clientChoosen !== 2` (Cliente Individual):**
- ❌ **No muestra checkboxes**
- ✅ **Muestra todas las coberturas** automáticamente
- ✅ **Tabla completa** sin filtros

### **Estructura de Coberturas**
```typescript
// Coberturas fijas + una dinámica
[
  {
    key: 'ALTO COSTO',
    nombre: 'ALTO COSTO',
    prima: 500  // Viene del endpoint
  },
  {
    key: 'MEDICAMENTOS', 
    nombre: 'MEDICAMENTOS',
    prima: 300  // Viene del endpoint
  },
  {
    key: 'HABITACIÓN',
    nombre: 'HABITACIÓN', 
    prima: 200  // Viene del endpoint
  },
  {
    key: 'ODONTOLOGIA',
    nombre: 'ODONTOLOGIA',
    prima: 0,   // Se calcula según selección
    odontologiaOpciones: [
      { label: 'Seleccionar', prima: 0 },
      { label: 'Nivel I', prima: 150 },
      { label: 'Nivel II', prima: 350 },
      { label: 'Nivel III', prima: 700 }
    ]
  }
]
```

### **Cálculo de Subtotales**
- Se multiplica la prima de cada cobertura por la cantidad de afiliados del plan
- Odontología se maneja por separado con selector dropdown
- Se emite un objeto con subtotales por plan

### **Datos enviados al siguiente step**
```typescript
{
  [planName]: {
    subTotal: number,
    tipo: 'Opcional',
    plan: string,
    seleccionados: [{
      nombre: string,
      descripcion?: string,  // Solo para odontología
      prima: number
    }]
  }
}
```

---

## 💳 **STEP 4: Opciones de Pago**

### **Endpoint utilizado**
```http
POST /planes/calculate
```

### **Payload enviado (estructura completa)**
```typescript
{
  cliente: {
    // Datos completos del Step 1
    clientChoosen: number,
    identification: string,
    name: string,
    contact: string,
    email: string,
    address: string,
    office: string,
    agent: string,
    tipoPlan: number
  },
  afiliados: [
    // Array de todos los afiliados del Step 2
    {
      plan: string,
      parentescos: string,
      edad: number,
      baseAmunt: number
    }
  ],
  coberturas: {
    // Objeto del Step 3 con subtotales por plan
    [planName]: {
      subTotal: number,
      tipo: 'Opcional',
      plan: string,
      seleccionados: [...]
    }
  }
}
```

### **Lógica del Formulario**
1. Muestra resumen de todos los datos anteriores
2. Usuario selecciona método de pago
3. Usuario selecciona cantidad de cuotas
4. Se calcula el total final
5. Se envía todo a la API para generar cotización

---

## 🔄 **Flujo General de Navegación**

```
Login → Dashboard → Cotizador
  ↓
Step 1: Cliente → Step 2: Planes → Step 3: Coberturas → Step 4: Pago
  ↑                ↑                ↑                    ↑
  |-- Datos: clienteInfo --|-- afiliadoAgregado --|-- subTotalOpcional --|
```

---

## 📦 **Equivalencias para Next.js**

### **Stack Tecnológico Sugerido**
- **Forms:** React Hook Form
- **HTTP:** Axios + React Query/TanStack Query
- **Store:** Zustand con persist
- **UI:** Material-UI (MUI) o Mantine
- **Auth:** Custom hooks + cookies/localStorage
- **Validation:** Zod + React Hook Form resolvers

### **Estructura del Store**
```typescript
type QuotationStore = {
  user: User | null;
  cliente: Cliente | null;
  afiliados: Afiliado[];
  coberturas: Record<string, CoberturaData>;
  
  // Setters
  setUser: (user: User) => void;
  setCliente: (cliente: Cliente) => void;
  addAfiliado: (afiliado: Afiliado) => void;
  setCoberturas: (coberturas: Record<string, CoberturaData>) => void;
  reset: () => void;
};
```

### **Rutas Next.js**
```
/login
/dashboard  
/cotizador
  /informacion-cliente     (Step 1)
  /seleccion-planes       (Step 2)
  /coberturas-opcionales  (Step 3)
  /opciones-pago         (Step 4)
```

---

## ⚠️ **Puntos Importantes para la Migración**

1. **Persistencia:** El store debe persistir entre recargas de página
2. **Validaciones:** Replicar todas las validaciones de formulario
3. **Navegación:** Permitir ir hacia atrás sin perder datos
4. **Reset:** Limpiar store al completar cotización o logout
5. **Error Handling:** Manejar errores de API apropiadamente
6. **Loading States:** Mostrar estados de carga en las llamadas API
7. **Responsive:** Asegurar que funcione en móviles
8. **Tipo de Cliente:** La lógica condicional del Step 3 es crítica

---

## 🚀 **Orden de Implementación Recomendado**

1. **Setup:** Next.js + Store + API client
2. **Login + Auth:** Autenticación y protección de rutas
3. **Step 1:** Formulario de cliente con dropdowns dinámicos
4. **Step 2:** Selección de planes y agregado de afiliados
5. **Step 3:** Coberturas opcionales con lógica condicional
6. **Step 4:** Resumen y envío final
7. **Dashboard:** Listado de cotizaciones (si aplica)

---

**Tiempo estimado:** 3-5 días con esta documentación como guía.
