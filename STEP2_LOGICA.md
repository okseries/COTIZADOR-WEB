# Step 2: Selección de Planes y Afiliados

## 1. Objetivo del Paso
Permitir al usuario seleccionar uno o varios planes y registrar los afiliados correspondientes, adaptando el flujo según el tipo de cliente (individual o colectivo).

## 2. Lógica de Negocio
- El usuario puede seleccionar uno o varios planes disponibles.
- El usuario debe agregar afiliados a cada plan seleccionado.
- El comportamiento del formulario depende del tipo de cliente:
  - **Individual (`clientChoosen === 1`)**:
    - El campo a ingresar es **Edad** (por cada afiliado).
    - Se pueden agregar varios afiliados (ejemplo: titular, cónyuge, hijos, padres).
    - La cantidad de afiliados se determina por el número de registros en el array de afiliados.
    - El campo `cantidadAfiliados` en el plan es igual al número de afiliados.
    - El campo `edad` de cada afiliado es la edad real.
  - **Colectivo (`clientChoosen === 2`)**:
    - El campo a ingresar es **Cantidad** (número total de afiliados para ese plan).
    - Solo se agrega un "afiliado" por plan, con `edad: 0` y `cantidadAfiliados` igual a la cantidad ingresada.
    - El campo `cantidadAfiliados` en el plan es igual a la cantidad ingresada manualmente.
    - El campo `edad` de cada afiliado es 0 (o null).

## 3. Flujo de Usuario
1. El usuario selecciona los planes disponibles.
2. El usuario agrega afiliados:
   - Si es individual, ingresa edad y parentesco para cada afiliado.
   - Si es colectivo, ingresa solo la cantidad total de afiliados.
3. El sistema almacena los afiliados y la cantidad según el tipo de cliente.
4. El resumen muestra la cantidad correcta:
   - Individual: length de afiliados.
   - Colectivo: suma de `cantidadAfiliados`.

## 4. Validaciones Clave
- No se puede avanzar sin seleccionar al menos un plan.
- No se puede avanzar sin agregar al menos un afiliado por plan.
- Para individuales, la edad debe ser válida (1-120).
- Para colectivos, la cantidad debe ser mayor a 0.

## 5. Ejemplo de Payload para Backend
### Individual
```json
{
  "plan": "FLEX SMART",
  "afiliados": [
    { "parentesco": "Titular", "edad": 25, "subtotal": "1186.57", "cantidadAfiliados": 1 },
    { "parentesco": "Cónyuge", "edad": 24, "subtotal": "1186.57", "cantidadAfiliados": 1 }
  ],
  "cantidadAfiliados": 2
}
```
### Colectivo
```json
{
  "plan": "FLEX SMART",
  "afiliados": [
    { "parentesco": "Titular", "edad": 0, "subtotal": "11761.90", "cantidadAfiliados": 10 }
  ],
  "cantidadAfiliados": 10
}
```

## 6. Notas Técnicas
- El campo `edad` solo es relevante para individuales.
- El campo `cantidadAfiliados` es clave para colectivos y para el resumen.
- El store y el payload deben reflejar esta lógica para evitar errores en el cálculo y en la integración con el backend.
