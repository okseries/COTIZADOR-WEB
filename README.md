 /* mis colores */
  --primary: #005BBB;               /* Azul principal */
  --primary-foreground: #FFFFFF;   /* Texto blanco sobre primary */
  --primary-dark: #003E7E;          /* Azul oscuro para hover */
  --accent: #FFA500;                /* Naranja acento */
  --accent-foreground: #333333;    /* Texto oscuro para acento */
  --background: #F5F5F5;            /* Fondo claro */
  --foreground: #333333;            /* Texto principal */
  --border: #D1D5DB;   

# Cotizador Web

## Paleta de Colores

```css
/* Mis colores */
--primary: #005BBB;               /* Azul principal */
--primary-foreground: #FFFFFF;    /* Texto blanco sobre primary */
--primary-dark: #003E7E;          /* Azul oscuro para hover */
--accent: #FFA500;                /* Naranja acento */
--accent-foreground: #333333;     /* Texto oscuro para acento */
--background: #F5F5F5;            /* Fondo claro */
--foreground: #333333;            /* Texto principal */
--border: #D1D5DB;
#008080
```

---

## 1. Estructura del Store

El store (`useQuotationStore`) está estructurado de la siguiente manera:

- `user`
- `cliente`
- `planes` (array)

El store usa persist, así que si el usuario recarga la página, la data se mantiene.

---

## 2. Flujo recomendado

### a) Step 1: Información del Cliente
- El formulario debe inicializarse con los datos de `cliente` del store si existen.
- Al guardar/validar, debe actualizar el store con los nuevos datos.

### b) Step 2: Selección de Planes
- El usuario selecciona uno o varios planes.
- Cada selección debe actualizar el array `planes` en el store.

### c) Step 3: Coberturas Opcionales
- El usuario selecciona coberturas opcionales para el plan actual.
- Se actualiza el objeto correspondiente dentro de `planes` en el store.

### d) Step 4: Opciones de Pago
- El usuario elige el método de pago.
- Se actualiza el resumen de pago dentro del plan correspondiente en el store.

---

## 3. Al finalizar

Cuando el usuario termine el proceso, simplemente toma el objeto completo del store y lo envía a la API, ya que tendrá la estructura requerida.

---

## 4. Detalles técnicos clave

- **Inicialización de formularios:**
  - Cada formulario debe inicializarse con los datos actuales del store (usando `defaultValues` y `reset` de React Hook Form).
- **Actualización del store:**
  - Cada vez que el usuario avanza de step, se debe guardar la data en el store usando los setters (`setCliente`, `addPlan`, etc).
- **Persistencia:**
  - El store usa `persist`, así que si el usuario recarga la página, la data se mantiene.

---

## 5. Ejemplo de flujo para el step de cliente

1. Al montar el componente, si hay datos en el store, el formulario los muestra.
2. Al guardar, se actualiza el store con los nuevos datos.
3. Si el usuario regresa a este step, verá los datos previamente ingresados.
5. Ejemplo de flujo para el step de cliente
Al montar el componente, si hay datos en el store, el formulario los muestra.
Al guardar, se actualiza el store con los nuevos datos.
Si el usuario regresa a este step, verá los datos previamente ingresados.