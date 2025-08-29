# Implementación del campo tipoOpcionalId

## Resumen
Se ha implementado la solución del campo `tipoOpcionalId` para resolver el problema de mapeo de IDs entre el modo "crear" y "editar" en las coberturas opcionales.

## Problema Original
- En modo "crear": Los IDs de las opcionales eran como `37`, `44`, `48`, `15` (IDs reales de la API)
- En modo "editar": Los IDs aparecían como `1`, `3`, `5` (IDs internos secuenciales)
- Esto causaba fallos en el mapeo al cargar cotizaciones existentes para edición

## Solución Implementada

### 1. Actualización de Interfaces TypeScript

#### `createQuotation.interface.ts`
```typescript
export interface Opcional {
  id: number;
  idCopago?: number;
  nombre: string;
  descripcion: string | null;
  prima: number;
  tipoOpcionalId?: number; // 🆕 ID del tipo de opcional para mapeo correcto
}
```

#### `Coberturaopcional.interface.ts`
```typescript
export interface CoberturasOpcionaleColectivo {
  // ... campos existentes
  tipoOpcionalId?: number; // 🆕 ID del tipo de opcional para mapeo correcto
}

export interface Copago {
  // ... campos existentes
  tipoOpcionalId?: number; // 🆕 ID del tipo de opcional para mapeo correcto
}
```

### 2. Mapeo de tipoOpcionalId

Los valores de `tipoOpcionalId` corresponden a:
- `1` = MEDICAMENTOS
- `2` = ALTO COSTO
- `3` = HABITACION
- `4` = ODONTOLOGIA

### 3. Actualización de la Lógica de Mapeo

#### Antes (mapeo por prima con tolerancia):
```typescript
// Buscar la opción que más se acerque a la prima unitaria
const matchingOption = altoCostoOptionsQuery.data.find(opt => 
  Math.abs(parseFloat(opt.opt_prima) - primaUnitaria) < 50
);
```

#### Después (mapeo directo con tipoOpcionalId):
```typescript
// 🆕 USAR tipoOpcionalId PARA MAPEO DIRECTO
if (opcional.tipoOpcionalId) {
  // Verificar que el tipoOpcionalId coincida con el tipo correcto (2 = ALTO COSTO)
  if (opcional.tipoOpcionalId === 2) {
    selections.altoCosto = opcional.id.toString();
    console.log(`💰 ALTO COSTO - Mapeo directo con tipoOpcionalId: ${opcional.tipoOpcionalId} -> ID: ${opcional.id}`);
  }
}
```

### 4. Actualización de updatePlanOpcionales

Todos los `opcionales.push()` ahora incluyen el campo `tipoOpcionalId`:

```typescript
opcionales.push({
  id: selectedOption.opt_id,
  idCopago: currentDynamicCopagos.altoCosto ? parseInt(currentDynamicCopagos.altoCosto) : undefined,
  nombre: "ALTO COSTO",
  descripcion: selectedOption.descripcion,
  prima: primaBase,
  tipoOpcionalId: 2 // 🆕 ID del tipo de opcional para Alto Costo
});
```

### 5. Ventajas de la Nueva Implementación

1. **Mapeo Preciso**: Ya no hay ambigüedad por similitud de primas
2. **Consistencia**: Los mismos IDs en modo crear y editar
3. **Escalabilidad**: Fácil agregar nuevos tipos de opcionales
4. **Debugging**: Los logs ahora muestran `tipoOpcionalId` para mejor trazabilidad
5. **Fallback Seguro**: Si no hay `tipoOpcionalId`, usa el ID directo del store

### 6. Compatibilidad Hacia Atrás

La implementación es totalmente compatible hacia atrás:
- Si `tipoOpcionalId` no está presente, usa el comportamiento anterior
- Los datos existentes en el store siguen funcionando
- No se requieren migraciones de datos

### 7. Archivos Modificados

1. `src/presentation/quotations/interface/createQuotation.interface.ts`
2. `src/presentation/coberturasOpcionales/interface/Coberturaopcional.interface.ts`
3. `src/presentation/coberturasOpcionales/ui/hooks/useCoberturasOpcionales.ts`

### 8. Testing Recomendado

1. **Modo Crear**: Verificar que las selecciones se guardan con `tipoOpcionalId`
2. **Modo Editar**: Verificar que las cotizaciones existentes cargan correctamente
3. **Navegación entre Steps**: Verificar que se mantienen las selecciones específicas por plan
4. **Colectivos vs Individuales**: Verificar comportamiento diferenciado

### 9. Monitoreo

Los logs incluyen ahora información de `tipoOpcionalId`:
```
💰 NAVEGACIÓN - Alto Costo cargado para FLEX SMART: {
  "originalId": 37,
  "tipoOpcionalId": 2,
  "prima": 1500,
  "mensaje": "✅ USANDO ID DIRECTO DEL STORE con tipoOpcionalId"
}
```

## Conclusión

Esta implementación resuelve definitivamente el problema de mapeo de IDs y proporciona una base sólida y escalable para el manejo de coberturas opcionales en el sistema de cotizaciones.
