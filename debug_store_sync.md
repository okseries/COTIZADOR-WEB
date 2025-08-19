# Debug del Problema de Sincronización

## Problema Identificado

Después del análisis del código, he identificado el problema principal:

### 1. Problema con la lógica de Odontología

En `useCoberturasOpcionales.ts`, línea 588-590:

```typescript
const shouldIncludeOdontologia = 
  cliente?.clientChoosen === 1 || 
  (cliente?.clientChoosen === 2 && (globalFilters.odontologia || odontologiaValue !== "0"));
```

**El problema:** Para clientes colectivos, la odontología se incluye en el store si:
- El filtro global está activado O
- El valor seleccionado no es "0"

Pero cuando el usuario **desmarca** el checkbox global de odontología, se ejecuta `handleGlobalFilterChange` que:
1. Pone `globalFilters.odontologia = false`
2. **NO limpia** `planSelections[planName].odontologia`

Resultado: Visualmente el checkbox se desmarca, pero `odontologiaValue !== "0"` sigue siendo true, por lo que la odontología permanece en el store.

### 2. Problema en Steps 3-4

Los useEffect con múltiples dependencias causan actualizaciones en cadena:

```typescript
// Línea 627 - Demasiadas dependencias
useEffect(() => {
  // Se ejecuta cada vez que cualquier dependencia cambia
}, [
  planesData, 
  planes, 
  cliente, 
  globalFilters, 
  coberturaSelections, 
  dynamicCoberturaSelections, 
  dynamicCopagoSelections,
  altoCostoOptionsQuery.data,
  medicamentosOptionsQuery.data,
  habitacionOptionsQuery.data,
  copagosQuery.data,
  copagosAltoCostoQuery.data,
  copagosHabitacionQuery.data,
  updatePlanByName
]);
```

**El problema:** Cambios menores en cualquier dependencia provocan recálculos completos, causando inconsistencias temporales.

## Solución Propuesta

### 1. Arreglar la lógica de odontología
- Limpiar `planSelections` cuando se desmarque el filtro global
- Separar la lógica visual de la lógica del store

### 2. Optimizar useEffect
- Reducir dependencias innecesarias
- Usar useCallback para funciones estables
- Implementar debouncing para evitar actualizaciones múltiples

### 3. Agregar logging para debug
- Rastrear cambios de estado en tiempo real
- Identificar cuando visual y store divergen
