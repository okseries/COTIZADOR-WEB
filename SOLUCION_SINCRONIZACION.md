# Análisis y Solución de Problemas de Sincronización

## 🔍 Problemas Identificados

### 1. **Problema Principal: Odontología en Clientes Colectivos**

**Síntoma:** El checkbox de odontología se desmarca visualmente, pero la cobertura permanece en el payload del store.

**Causa Raíz:** 
- En la lógica original, para clientes colectivos la odontología se incluía si `globalFilters.odontologia OR odontologiaValue !== "0"`
- Al desmarcar el checkbox global, solo se cambiaba `globalFilters.odontologia = false`
- Pero `planSelections[planName].odontologia` mantenía su valor (ej: "2"), por lo que la condición seguía siendo true

**Solución Implementada:**
1. **Limpiar selección individual:** Cuando se desmarca el filtro global de odontología, ahora también se pone `planSelections[planName].odontologia = "0"`
2. **Lógica simplificada:** Para colectivos, ahora se requiere AMBAS condiciones: `globalFilters.odontologia AND odontologiaValue !== "0"`
3. **Actualización forzada:** Se fuerza la actualización del store inmediatamente después de limpiar las selecciones

### 2. **Problema Secundario: useEffect con Exceso de Dependencias**

**Síntoma:** Actualizaciones en cadena y posibles inconsistencias temporales en steps 3-4.

**Causa:** El `useCallback` de `updatePlanOpcionales` tenía demasiadas dependencias, causando recálculos innecesarios.

**Solución Implementada:**
1. **Dependencias optimizadas:** Reducido el array de dependencias a solo las críticas
2. **Agrupación lógica:** Agrupadas las dependencias relacionadas
3. **Logging de debug:** Agregado console.log para rastrear el flujo de datos

### 3. **Problema de Monitoreo: Falta de Visibilidad del Estado**

**Síntoma:** Difícil detectar cuándo y por qué el estado visual diverge del store.

**Solución Implementada:**
1. **StoreDebugger:** Componente que muestra el estado del store en tiempo real
2. **Console.log estratégicos:** Logs en puntos críticos para rastrear cambios
3. **Flags de debug:** Solo activo en desarrollo

## 🛠️ Cambios Implementados

### Archivo: `useCoberturasOpcionales.ts`

#### 1. **handleGlobalFilterChange (Línea ~702)**
```typescript
// ANTES: Solo limpiaba selecciones dinámicas
if (!checked && cliente?.clientChoosen === 2) {
  // Limpiar solo dynamicCoberturaSelections...
}

// DESPUÉS: También limpia planSelections de odontología
if (!checked && cliente?.clientChoosen === 2) {
  // Limpiar dynamicCoberturaSelections...
  
  // CRÍTICO: También limpiar la selección de odontología
  if (filter === 'odontologia') {
    setPlanSelections(prev => ({
      ...prev,
      [plan.plan]: {
        ...prev[plan.plan],
        odontologia: "0"  // ← ESTO FALTABA
      }
    }));
  }
  
  // Forzar actualización inmediata
  setTimeout(() => {
    planes.forEach(plan => {
      const odontologiaValue = filter === 'odontologia' ? "0" : (planSelections[plan.plan]?.odontologia || "0");
      updatePlanOpcionales(plan.plan, odontologiaValue);
    });
  }, 50);
}
```

#### 2. **updatePlanOpcionales - Lógica de Odontología (Línea ~588)**
```typescript
// ANTES: OR lógico permitía inconsistencias
const shouldIncludeOdontologia = 
  cliente?.clientChoosen === 1 || 
  (cliente?.clientChoosen === 2 && (globalFilters.odontologia || odontologiaValue !== "0"));

// DESPUÉS: AND lógico para colectivos
const shouldIncludeOdontologia = 
  cliente?.clientChoosen === 1 || 
  (cliente?.clientChoosen === 2 && globalFilters.odontologia && odontologiaValue !== "0");
  //                                ↑ CAMBIO CRÍTICO: AND en lugar de OR
```

#### 3. **Logging de Debug**
- `handleGlobalFilterChange`: Log de cambios de filtros
- `handleOdontologiaChange`: Log de cambios de selección individual
- `updatePlanOpcionales`: Log detallado de decisiones de inclusión

### Archivo: `StoreDebugger.tsx` (Nuevo)
- Componente flotante que muestra estado en tiempo real
- Solo visible en desarrollo
- Muestra planes, afiliados, opcionales y totales

### Archivo: `quotation-content.tsx`
- Agregado `<StoreDebugger />` para monitoreo en vivo

## 🧪 Cómo Probar las Correcciones

### Test 1: Problema de Odontología (Colectivos)
1. Seleccionar cliente colectivo
2. Ir a Step 3
3. Marcar checkbox "ODONTOLOGÍA"
4. Seleccionar "Nivel II" en el dropdown
5. **Verificar:** Debe aparecer en el debugger
6. Desmarcar checkbox "ODONTOLOGÍA"
7. **Verificar:** Debe desaparecer del debugger inmediatamente

### Test 2: Navegación entre Steps
1. Completar Steps 1-2
2. En Step 3, seleccionar coberturas
3. Ir a Step 4, luego regresar a Step 3
4. **Verificar:** Las selecciones deben mantenerse
5. **Verificar:** El debugger debe mostrar datos consistentes

### Test 3: Múltiples Planes
1. Seleccionar 2+ planes en Step 2
2. En Step 3, configurar coberturas diferentes para cada plan
3. **Verificar:** Cada plan debe mantener sus selecciones independientes
4. **Verificar:** Los totales deben ser correctos en el debugger

## 🔧 Debug Tools Agregados

### Console Logs
- `🔘 handleGlobalFilterChange`: Cambios de filtros globales
- `🦷 handleOdontologiaChange`: Cambios de selección de odontología
- `🧹 Limpiando selecciones`: Cuando se limpian por filtro desactivado
- `🦷🔍 DECISION ODONTOLOGIA`: Decisión de incluir/excluir con detalles
- `✅ ODONTOLOGIA INCLUIDA` / `❌ ODONTOLOGIA EXCLUIDA`: Resultado final

### StoreDebugger Visual
- Estado del cliente (tipo, plan)
- Lista de planes con afiliados y opcionales
- Totales por plan
- Actualización en tiempo real

## 📋 Próximos Pasos Recomendados

1. **Probar con el debug activo** para verificar que las correcciones funcionen
2. **Probar casos edge:**
   - Cambio de tipo de cliente después de seleccionar coberturas
   - Navegación rápida entre steps
   - Múltiples planes con configuraciones diferentes
3. **Una vez confirmado, remover logs de debug** para producción
4. **Considerar agregar tests unitarios** para estos casos críticos

## ⚠️ Notas Importantes

- **Los logs de debug se ejecutan solo en desarrollo**
- **El StoreDebugger es flotante y no interfiere con la UI**
- **Los cambios son retrocompatibles**
- **La lógica para individuales no cambia**
