# Step 3: Coberturas Opcionales - Análisis Detallado

## 1. Componentes y Hooks Principales

### 1.1. Componente principal: `CoberturasOpcionales`
- Ubicación: `src/presentation/coberturasOpcionales/ui/CoberturasOptinals.tsx`
- Orquesta la UI y la lógica de selección de coberturas opcionales para cada plan.
- Usa el hook `useCoberturasOpcionales` para manejar estado, datos y handlers.
- Renderiza:
  - Filtros globales (`GlobalFilters`)
  - Una tabla por plan (`PlanTable`), pasando todas las props necesarias para selecciones y opciones dinámicas.

### 1.2. Hook: `useCoberturasOpcionales`
- Ubicación: `src/presentation/coberturasOpcionales/ui/hooks/useCoberturasOpcionales.ts`
- Encargado de:
  - Obtener datos del store global (`useQuotationStore`): cliente, planes, etc.
  - Manejar el estado local de selecciones de coberturas y copagos por plan.
  - Llamar a los hooks de datos para obtener opciones dinámicas desde la API.
  - Proveer handlers para cambios en selects y filtros.
  - Mantener sincronía entre el store y el estado local.
- Expone:
  - Estados: selecciones, opciones dinámicas, loading, error, etc.
  - Handlers: para cada tipo de cambio (cobertura, copago, odontología, etc).

### 1.3. Hooks de datos: `usePlanesOpcionales`, `useCoberturasOpcionalesByType`, `useCopagos`
- Ubicación: `src/presentation/coberturasOpcionales/hooks/usePlanesOpcionales.ts`
- Encapsulan la lógica de consulta a la API para:
  - Coberturas opcionales por plan y tipo (`usePlanesOpcionales`, `useCoberturasOpcionalesByType`)
  - Copagos por cobertura y tipo de cliente (`useCopagos`)
- Usan React Query para manejo de cache, loading, error, etc.

### 1.4. Servicios de API
- Ubicación: `src/presentation/coberturasOpcionales/service/coberturas-opcionales.service.ts`
- Funciones:
  - `GetCoberturasOpcionales`: consulta coberturas por plan
  - `getCoberturasOpcionales_colectivo`: consulta coberturas para colectivos
  - `getCopagos`: consulta copagos para una cobertura y tipo de cliente

### 1.5. Componentes de UI
- `DynamicCoberturaSelect`: Select dinámico para coberturas (usa descripción de la API)
- `DynamicCopagoSelect`: Select dinámico para copagos (usa descripción de la API)
- `PlanTable`: Renderiza la tabla de selección de coberturas y copagos para cada plan

## 2. Estructura de Datos

### 2.1. Interfaces principales
- `CoberturasOpcional`: para coberturas por plan
- `CoberturasOpcionaleColectivo`: para coberturas opcionales en colectivo
- `Copago`: para opciones de copago

### 2.2. Store global (`useQuotationStore`)
- Guarda:
  - `cliente` (incluye `tipoPlan` y `clientChoosen`)
  - `planes` (array de planes seleccionados)
  - Selecciones de coberturas y copagos por plan
- Persistencia automática (Zustand + persist)

## 3. Lógica de Selección y Cálculo

### 3.1. Flujo general
- Al montar, se inicializan selects con datos del store si existen.
- Al seleccionar una cobertura/cobago, se actualiza el estado local y el store.
- Si el usuario regresa, ve sus selecciones previas.

### 3.2. Obtención de opciones
- Coberturas: `/opcionales-planes/{id_opcional_type}/{tipoPlan}`
- Copagos: `/opcionales-planes/copagos/{id_opcional_type}/{clientChoosen}`
- Los IDs de tipo de cobertura están mapeados en el código (ej: medicamentos=1, altoCosto=3, habitacion=2, odontologia=4)

### 3.3. Condiciones de copago
- Solo se muestran selects de copago si:
  - `tipoPlan === 2` (complementario)
  - `clientChoosen === 2` (colectivo)
- Todos los tipos de cobertura pueden tener copago en este caso.

### 3.4. Cálculo de prima y datos
- La prima y descripción de cada opción viene de la API.
- No se arma manualmente en frontend.
- El objeto final en el store está listo para enviar a la API.

## 4. Validaciones y UX
- El formulario se inicializa y persiste correctamente.
- Se valida que se seleccione copago cuando es obligatorio.
- Se muestran mensajes de error/carga/vacío según el estado de la API.

## 5. Resumen de Coherencia
- La lógica es coherente y robusta.
- El flujo de datos y persistencia está bien resuelto.
- Los cálculos dependen de la API, lo cual es correcto.
- El código es modular y fácil de mantener.

## 7. Análisis de Persistencia del Store

### 7.1. Configuración del Store
**Estado actual:** ✅ **CORRECTO**
- El store está configurado con `persist` de Zustand
- Usa `partialize` para guardar solo los datos necesarios:
  - `user`, `cliente`, `planes`, `filterData`, `agentOptions`
- Excluye `mode` de la persistencia (correcto)
- Nombre del storage: `'quotation-storage'`

### 7.2. Problemas Identificados

#### 7.2.1. Uso Incorrecto de `getFinalObject()`
**Problema:** Múltiples componentes llaman `getFinalObject()` en cada render, causando:
- Re-renders innecesarios
- Posibles inconsistencias en el estado
- Pérdida de optimizaciones de React/Zustand

**Componentes afectados:**
- ✅ `useCoberturasOpcionales.ts` - **CORREGIDO**
- ✅ `CategoryPlan.tsx` - **CORREGIDO**
- ✅ `AddAfiliadoForm.tsx` - **CORREGIDO**
- ⚠️ `PaymentOptions.tsx` - **PENDIENTE REVISIÓN**

#### 7.2.2. Sincronización de Estado Local vs Store
**Problema detectado:** En coberturas opcionales, el estado local podría no sincronizarse correctamente con el store al:
- Refrescar la página
- Navegar entre steps
- Regresar a un step anterior

**Solución implementada:** 
- Inicialización mejorada desde el store en `useCoberturasOpcionales`
- Acceso directo a `cliente` y `planes` sin usar `getFinalObject()`

### 7.3. Recomendaciones Implementadas

#### 7.3.1. Patrón Correcto de Acceso al Store
```typescript
// ❌ INCORRECTO - Causa re-renders innecesarios
const { getFinalObject } = useQuotationStore();
const finalObject = getFinalObject();
const cliente = finalObject.cliente;

// ✅ CORRECTO - Acceso directo y optimizado
const { cliente, planes, updatePlanByName } = useQuotationStore();
```

#### 7.3.2. Inicialización desde Store
```typescript
// Inicializar selecciones dinámicas desde opcionales guardadas en el store
useEffect(() => {
  if (cliente?.clientChoosen === 2 && planes.length > 0) {
    // Leer opcionales existentes y restaurar selecciones
    // ...lógica de inicialización
  }
}, [cliente?.clientChoosen, planes.length]);
```

### 7.4. Estado de Persistencia por Step

#### Step 1: Cliente ✅
- Los datos del cliente se persisten correctamente
- Al regresar se restauran todos los campos

#### Step 2: Planes ✅  
- Los planes seleccionados se persisten
- Afiliados y sus datos se mantienen

#### Step 3: Coberturas Opcionales ✅ **MEJORADO**
- Las coberturas opcionales se persisten en el array `opcionales` de cada plan
- Las selecciones dinámicas se restauran correctamente
- Copagos se mantienen vinculados a medicamentos

#### Step 4: Pagos ⚠️ **PENDIENTE REVISIÓN**
- Necesita verificarse el patrón de acceso al store

### 7.5. Pruebas de Persistencia Recomendadas

1. **Test de refrescar página:** En cada step, refrescar y verificar que los datos se mantienen
2. **Test de navegación:** Ir a step 4, regresar a step 1, avanzar nuevamente y verificar datos
3. **Test de coberturas:** Seleccionar coberturas en step 3, ir a step 4, regresar y verificar selecciones
4. **Test de copagos:** Verificar que los copagos se mantienen vinculados correctamente

---

## 6. Bug Fixes Implementados

### 6.1. Problema de Auto-selección en Filtros Globales
**Problema identificado:** Al activar una cobertura opcional (checkbox), el sistema automáticamente seleccionaba la primera opción del select correspondiente, causando efectos secundarios que deseleccionaban otras coberturas.

**Solución aplicada:**
- Removido el auto-select automático en `handleGlobalFilterChange`
- Los selects ahora permanecen vacíos hasta que el usuario haga una selección manual
- Mejorada la limpieza de selecciones cuando se desactivan filtros

### 6.2. Inicialización desde Store
**Mejora implementada:** 
- Agregada lógica para inicializar correctamente las selecciones dinámicas desde opcionales previamente guardadas en el store
- Esto permite que al regresar al step 3, se muestren las selecciones previas del usuario sin auto-seleccionar nuevas opciones

### 6.3. Limpieza de Copagos
**Fix aplicado:**
- Cuando se desactiva el filtro de medicamentos, también se limpian los copagos asociados
- Previene inconsistencias en el estado de copagos huérfanos

---

**Archivos clave revisados:**
- `CoberturasOptinals.tsx`
- `useCoberturasOpcionales.ts`
- `usePlanesOpcionales.ts`
- `coberturas-opcionales.service.ts`
- `Coberturaopcional.interface.ts`
- `DynamicCoberturaSelect.tsx`
- `DynamicCopagoSelect.tsx`
- `PlanTable.tsx`

---

¿Quieres un diagrama de flujo, recomendaciones de mejora o ejemplos de payload final?
