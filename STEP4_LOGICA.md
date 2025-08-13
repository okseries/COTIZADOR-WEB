# Step 4: Resumen y Confirmación de Cotización

## 1. Objetivo del Paso
Presentar al usuario un resumen completo de la cotización antes de su confirmación y generación final.

## 2. Lógica de Negocio
- Mostrar todos los datos relevantes ingresados y calculados en los pasos anteriores:
  - Información del cliente
  - Planes seleccionados
  - Afiliados y cantidades
  - Coberturas opcionales y copagos
  - Subtotales y totales por plan
  - Total general de la cotización
- Permitir al usuario revisar y validar toda la información antes de confirmar.
- Ofrecer la opción de regresar y editar cualquier paso previo si es necesario.
- Al confirmar, se genera el payload final y se envía al backend para guardar la cotización y/o generar el PDF.

## 3. Flujo de Usuario
1. El usuario revisa el resumen de la cotización.
2. Si detecta un error, puede regresar a cualquier paso anterior para corregirlo.
3. Si todo es correcto, confirma la cotización.
4. El sistema envía la información al backend y muestra el resultado (éxito, error, enlace al PDF, etc.).

## 4. Validaciones Clave
- El resumen debe reflejar fielmente todos los datos ingresados y calculados.
- No se debe permitir confirmar si falta información clave o hay errores en los pasos previos.
- El payload enviado al backend debe cumplir con la estructura y reglas de negocio definidas.

## 5. Notas Técnicas
- El resumen debe ser claro, ordenado y fácil de leer para el usuario.
- El botón de confirmación debe estar deshabilitado si hay errores o datos incompletos.
- El sistema debe manejar correctamente la respuesta del backend (éxito, error, generación de PDF, etc.).
