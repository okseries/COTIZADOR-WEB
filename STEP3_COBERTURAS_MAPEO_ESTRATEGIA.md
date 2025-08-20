# Estrategia de Mapeo de Datos en Step 3 - Coberturas Opcionales

## Resumen Ejecutivo

La funcionalidad del Step 3 (Coberturas Opcionales) en modo edición implementa una estrategia sofisticada de mapeo de datos para sincronizar correctamente los valores almacenados en el store con las opciones disponibles desde la API. Este documento describe la arquitectura, los problemas resueltos y la implementación técnica.

## Problema Principal Identificado

### ❌ Problema Original
- Los IDs almacenados en el store (`opcional.id`) **NO coincidían** con los `opt_id` de las opciones disponibles en la API
- Los selects de coberturas y copagos aparecían vacíos al editar una cotización existente
- Los datos se cargaban pero no se mostraban en la interfaz de usuario

### ✅ Solución Implementada
Mapeo inteligente por **prima unitaria** en lugar de usar IDs directos, con fallbacks robustos.

---

## Arquitectura de la Solución

### 1. Detección de Modo de Edición

```typescript
// Detectar si estamos en modo edición
const mode = useQuotationStore(state => state.mode);
const isEditMode = mode !== "create";
```

**Control de inicialización:**
- `editModeInitializedRef`: Evita re-inicializaciones múltiples
- `previousModeRef`: Detecta cambios de modo para resetear estados

### 2. Activación de Queries en Modo Edición

```typescript
// Forzar queries en modo edición para cargar opciones dinámicas
const altoCostoOptionsQuery = useCoberturasOpcionalesByType(
  'altoCosto', 
  cliente?.tipoPlan || 1, 
  isColectivo && (globalFilters.altoCosto || isEditMode) // 🚨 Clave: isEditMode
);
```

**Estrategia:**
- En modo creación: Solo cargar si el filtro está activo
- En modo edición: **Siempre cargar** las opciones disponibles

### 3. Mapeo Inteligente por Prima Unitaria

#### 3.1 Coberturas Principales

```typescript
// Ejemplo: Mapeo de Alto Costo
if (opcional.nombre === "ALTO COSTO" && opcional.id) {
  if (altoCostoOptionsQuery.data && altoCostoOptionsQuery.data.length > 0) {
    const cantidadAfiliados = plan.cantidadAfiliados || 1;
    const primaUnitaria = opcional.prima / cantidadAfiliados;
    
    // Buscar opción por prima con tolerancia
    const matchingOption = altoCostoOptionsQuery.data.find(opt => 
      Math.abs(parseFloat(opt.opt_prima) - primaUnitaria) < 50 // Tolerancia ampliada
    );
    
    if (matchingOption) {
      selections.altoCosto = matchingOption.opt_id.toString();
    } else {
      // Fallback: usar primera opción disponible
      selections.altoCosto = altoCostoOptionsQuery.data[0].opt_id.toString();
    }
  }
}
```

#### 3.2 Copagos Asociados

```typescript
// Ejemplo: Mapeo de Copago de Alto Costo
else if (opcional.nombre === "COPAGO ALTO COSTO" && opcional.id) {
  if (copagosAltoCostoQuery.data && copagosAltoCostoQuery.data.length > 0) {
    const cantidadAfiliados = plan.cantidadAfiliados || 1;
    const primaUnitariaCopago = opcional.prima / cantidadAfiliados;
    
    const matchingCopago = copagosAltoCostoQuery.data.find(copago => 
      Math.abs(copago.price - primaUnitariaCopago) < 10
    );
    
    if (matchingCopago) {
      newDynamicCopagoSelections[plan.plan].altoCosto = matchingCopago.id.toString();
    }
  }
}
```

### 4. Mapeo de Odontología (Estático)

```typescript
// Odontología usa datos estáticos predefinidos
const odontologiaOptions: OdontologiaOption[] = [
  { value: "0", label: "Seleccionar", prima: 0 },
  { value: "1", label: "Nivel I", prima: 150 },
  { value: "2", label: "Nivel II", prima: 350 },
  { value: "3", label: "Nivel III", prima: 700 }
];

// Mapeo por prima unitaria
const primaUnitaria = odontologiaOpcional.prima / cantidadAfiliados;
const staticMatch = odontologiaOptions.find(opt => 
  Math.abs(opt.prima - primaUnitaria) < 1
);
```

---

## Flujo de Datos Completo

### 1. Inicialización en Modo Edición

```
Usuario hace clic en "Editar cotización"
    ↓
editQuotation() en quotationStore
    ↓
mode = {cotizationId} (modo edición)
    ↓
isEditMode = true
    ↓
Se activan queries dinámicas
```

### 2. Carga y Mapeo de Datos

```
Planes con opcionales del store
    ↓
useEffect() detecta modo edición
    ↓
Ejecuta mapeo inteligente por prima
    ↓
Genera dynamicCoberturaSelections y dynamicCopagoSelections
    ↓
Actualiza estados locales
    ↓
UI se actualiza con valores correctos
```

### 3. Estructura de Datos Resultante

```typescript
// Estado final para cada plan
dynamicCoberturaSelections: {
  "FLEX SMART": {
    altoCosto: "36",      // opt_id de la API
    medicamentos: "1",     // opt_id de la API  
    habitacion: "46",      // opt_id de la API
    odontologia: "3"       // value estático
  }
}

dynamicCopagoSelections: {
  "FLEX SMART": {
    altoCosto: "4",        // ID del copago
    medicamentos: "2",     // ID del copago
    habitacion: "5"        // ID del copago
  }
}
```

---

## Tolerancias y Fallbacks

### Tolerancias por Tipo de Cobertura

| Cobertura | Tolerancia Prima | Tolerancia Copago | Fallback |
|-----------|------------------|-------------------|----------|
| Alto Costo | ±50 pesos | ±10 pesos | Primera opción |
| Medicamentos | ±100 pesos | ±10 pesos | Primera opción |
| Habitación | ±100 pesos | ±10 pesos | Primera opción |
| Odontología | ±1 peso | N/A | Nivel III |

### Estrategia de Fallbacks

1. **Mapeo por prima exacta** (preferido)
2. **Mapeo por prima con tolerancia** (secundario)
3. **Primera opción disponible** (fallback)
4. **Usar ID del store** (último recurso)

---

## Hooks y APIs Involucradas

### Hooks Principales

- `useCoberturasOpcionalesByType()`: Obtiene opciones dinámicas por tipo
- `useCopagos()`: Obtiene opciones de copago por tipo
- `usePlanesOpcionales()`: Obtiene datos base de planes

### Mapeo de IDs de API

```typescript
const getOptionalTypeId = (type: string): number => {
  switch (type) {
    case 'altoCosto': return 3;
    case 'medicamentos': return 1;
    case 'habitacion': return 2;
    case 'odontologia': return 4;
    default: return null;
  }
};
```

---

## Debugging y Monitoreo

### Logs Implementados

```typescript
console.log('🔍 Procesando opcional:', opcional.nombre, 'Prima:', opcional.prima);
console.log('💰 ALTO COSTO MAPEADO:', primaUnitaria, '-> opt_id:', matchingOption.opt_id);
console.log('✅ Selecciones detectadas para', plan.plan);
```

### Verificaciones de Estado

- Estado de queries (loading, error, data)
- Valores de selecciones antes y después del mapeo
- Coincidencias encontradas por prima
- Fallbacks aplicados

---

## Casos de Uso Soportados

### ✅ Escenarios Exitosos

1. **Edición de cotización individual**: Todas las coberturas automáticas
2. **Edición de cotización colectiva**: Mapeo dinámico por prima
3. **Navegación entre steps**: Persistencia de selecciones
4. **Recarga de página**: Recuperación desde store persistente

### ⚠️ Casos Edge Manejados

1. **Prima no exacta**: Tolerancia configurable
2. **Opción no encontrada**: Fallback a primera disponible
3. **API sin datos**: Usar ID original del store
4. **Múltiples coincidencias**: Preferir primera coincidencia

---

## Beneficios de la Implementación

### 🎯 Técnicos

- **Mapeo robusto**: Múltiples estrategias de fallback
- **Performance optimizada**: Queries condicionales
- **Estado consistente**: Control de re-inicializaciones
- **Debugging completo**: Logs detallados para troubleshooting

### 👥 Usuario Final

- **Experiencia fluida**: Los selects muestran valores correctos
- **Edición confiable**: Datos pre-cargados al editar
- **Navegación consistente**: Estado mantenido entre steps
- **Feedback visual**: Selecciones visibles inmediatamente

---

## Mantenimiento y Evolución

### Puntos de Extensión

1. **Nuevas coberturas**: Agregar casos en el mapeo
2. **Nuevas tolerancias**: Ajustar por tipo de producto
3. **Nuevos fallbacks**: Estrategias adicionales de recuperación
4. **APIs mejoradas**: Simplificar mapeo si IDs se unifican

### Consideraciones Futuras

- Posible unificación de IDs entre store y API
- Cache de mapeos para mejorar performance
- Validación de coherencia entre prima y opciones
- Migración a mapeo por identificadores únicos

---

*Documentación técnica - Step 3 Coberturas Opcionales*  
*Fecha: Agosto 2025*  
*Versión: 1.0*
