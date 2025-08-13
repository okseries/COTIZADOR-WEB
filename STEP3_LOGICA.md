# Step 3: Coberturas Opcionales y Cálculo de Primas

## 1. Objetivo del Paso
Permitir al usuario seleccionar coberturas opcionales y copagos para cada plan, calculando correctamente las primas según el tipo de cliente (individual o colectivo).

## 2. Lógica de Negocio
- El usuario puede seleccionar coberturas opcionales y copagos para cada plan.
- El cálculo de primas depende del tipo de cliente:
  - **Individual (`clientChoosen === 1`)**:
    - La prima de cada opcional se suma una sola vez por plan (no se multiplica por cantidad de afiliados).
    - El subtotal de opcionales es la suma de las primas de los opcionales seleccionados.
  - **Colectivo (`clientChoosen === 2`)**:
    - La prima de cada opcional y copago se multiplica por `cantidadAfiliados` del plan.
    - El subtotal de opcionales es la suma de todas las primas multiplicadas por la cantidad.

## 3. Flujo de Usuario
1. El usuario selecciona las coberturas opcionales y copagos para cada plan.
2. El sistema calcula la prima de cada opcional:
   - Individual: prima simple.
   - Colectivo: prima * cantidadAfiliados.
3. El subtotal de opcionales y el total a pagar se actualizan en tiempo real.
4. El resumen muestra:
   - Cantidad de afiliados (length o cantidadAfiliados según el tipo).
   - Total de primas (afiliados + opcionales).

## 4. Validaciones Clave
- No se puede avanzar sin seleccionar al menos un plan.
- El subtotal de opcionales debe reflejar correctamente la lógica de multiplicación según el tipo de cliente.
- El total a pagar debe ser la suma de afiliados + opcionales.

## 5. Ejemplo de Payload para Backend
### Individual
```json
{
  "plan": "FLEX SMART",
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
  "opcionales": [
    { "nombre": "ALTO COSTO", "prima": 1544.9 } // 154.49 * 10
  ],
  "cantidadAfiliados": 10
}
```

## 6. Notas Técnicas
- El campo `cantidadAfiliados` es clave para colectivos y para el resumen.
- Todas las sumas y multiplicaciones deben respetar esta lógica para evitar errores en el cálculo y en el payload enviado al backend.
- El store y el payload deben reflejar esta lógica para evitar errores en la integración con el backend.
