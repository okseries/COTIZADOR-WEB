# Lógica y Flujo de Step 2 y Step 3

## Step 2: Selección de Planes y Afiliados

### Lógica de Negocio
- El usuario selecciona uno o varios planes disponibles.
- El usuario agrega afiliados a cada plan.
- El tipo de cliente (`clientChoosen`) determina el comportamiento:
  - **Individual (`clientChoosen === 1`)**:
    - El campo a ingresar es **Edad** (por cada afiliado).
    - Se pueden agregar varios afiliados (ej: titular, cónyuge, hijos, padres).
    - La cantidad de afiliados se determina por el length del array de afiliados.
    - El campo `cantidadAfiliados` en el plan es igual al número de afiliados.
    - El campo `edad` de cada afiliado es la edad real.
  - **Colectivo (`clientChoosen === 2`)**:
    - El campo a ingresar es **Cantidad** (número total de afiliados para ese plan).
    - Solo se agrega un "afiliado" por plan, con `edad: 0` y `cantidadAfiliados` igual a la cantidad ingresada.
    - El campo `cantidadAfiliados` en el plan es igual a la cantidad ingresada manualmente.
    - El campo `edad` de cada afiliado es 0 (o null).

### Flujo
1. El usuario selecciona los planes.
2. El usuario agrega afiliados:
   - Si es individual, ingresa edad y parentesco para cada afiliado.
   - Si es colectivo, ingresa solo la cantidad total de afiliados.
3. El store guarda los afiliados y la cantidad según el tipo de cliente.
4. El resumen muestra la cantidad correcta:
   - Individual: length de afiliados.
   - Colectivo: suma de `cantidadAfiliados`.

---

## Step 3: Coberturas Opcionales y Cálculo de Primas

### Lógica de Negocio
- El usuario puede seleccionar coberturas opcionales y copagos para cada plan.
- El cálculo de primas depende del tipo de cliente:
  - **Individual (`clientChoosen === 1`)**:
    - La prima de cada opcional se suma una sola vez por plan (no se multiplica por cantidad de afiliados).
    - El subtotal de opcionales es la suma de las primas de los opcionales seleccionados.
  - **Colectivo (`clientChoosen === 2`)**:
    - La prima de cada opcional y copago se multiplica por `cantidadAfiliados` del plan.
    - El subtotal de opcionales es la suma de todas las primas multiplicadas por la cantidad.

### Flujo
1. El usuario selecciona las coberturas opcionales y copagos para cada plan.
2. El sistema calcula la prima de cada opcional:
   - Individual: prima simple.
   - Colectivo: prima * cantidadAfiliados.
3. El subtotal de opcionales y el total a pagar se actualizan en tiempo real.
4. El resumen muestra:
   - Cantidad de afiliados (length o cantidadAfiliados según el tipo).
   - Total de primas (afiliados + opcionales).

---

## Resumen de Campos Clave

| Tipo de Cliente | Campo a Ingresar | Campo usado para cantidad | Multiplicación de primas |
|-----------------|------------------|--------------------------|-------------------------|
| Individual      | Edad             | afiliados.length         | No                      |
| Colectivo       | Cantidad         | cantidadAfiliados        | Sí                      |

---

## Ejemplo de Payload para Backend

### Individual
```json
{
  "plan": "FLEX SMART",
  "afiliados": [
    { "parentesco": "Titular", "edad": 25, "subtotal": "1186.57", "cantidadAfiliados": 1 },
    { "parentesco": "Cónyuge", "edad": 24, "subtotal": "1186.57", "cantidadAfiliados": 1 }
  ],
  "opcionales": [
    { "nombre": "ALTO COSTO", "prima": 686.6 }
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
  "opcionales": [
    { "nombre": "ALTO COSTO", "prima": 1544.9 } // 154.49 * 10
  ],
  "cantidadAfiliados": 10
}
```

---

## Notas
- El campo `edad` solo es relevante para individuales.
- El campo `cantidadAfiliados` es clave para colectivos y para el resumen.
- Todas las sumas y multiplicaciones deben respetar esta lógica para evitar errores en el cálculo y en el payload enviado al backend.
