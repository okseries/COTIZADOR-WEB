# Step 1: Información del Cliente

## 1. Objetivo del Paso
Recolectar y validar la información básica del cliente para iniciar el proceso de cotización.

## 2. Lógica de Negocio
- El usuario debe ingresar los datos personales y de contacto del cliente.
- Los campos obligatorios suelen incluir:
  - Tipo de documento (Cédula, RNC, Pasaporte)
  - Número de identificación
  - Nombre completo
  - Teléfono de contacto
  - Correo electrónico
  - Dirección
  - Oficina o sucursal
  - Agente y código de agente
  - Tipo de plan (individual o colectivo)
- El tipo de cliente (`clientChoosen`) se define aquí y afecta el flujo de los siguientes pasos.

## 3. Flujo de Usuario
1. El usuario ingresa la información solicitada en el formulario.
2. El sistema valida que todos los campos obligatorios estén completos y sean válidos.
3. Al guardar, la información se almacena en el store global y se habilita el paso siguiente.

## 4. Validaciones Clave
- Todos los campos obligatorios deben estar completos.
- El correo debe tener formato válido.
- El número de identificación debe cumplir con el formato del tipo de documento seleccionado.
- El tipo de plan debe estar seleccionado correctamente.

## 5. Notas Técnicas
- El store debe guardar la información del cliente para ser usada en los siguientes pasos.
- El tipo de cliente (`clientChoosen`) determina la lógica de los steps 2 y 3.
- Si el usuario cambia el tipo de cliente, se debe limpiar o ajustar la información de afiliados y planes para evitar inconsistencias.
