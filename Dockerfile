# Etapa 1: Builder
FROM node:20 AS builder

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar todo el código fuente y dependencias
COPY . .

# Instalar dependencias (incluye binarios nativos correctos)
RUN npm install --frozen-lockfile

# Compilar Next.js
RUN npm run build

# Etapa 2: Runner (solo runtime, más ligera)
FROM node:20 AS runner

WORKDIR /app

# Instalar solo dependencias necesarias para producción
COPY package*.json ./
RUN npm install --omit=dev --frozen-lockfile

# Copiar solo lo necesario desde el builder

# Copiar artefactos de build y archivos necesarios
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
# Si usas TypeScript para la config, descomenta la siguiente línea:
# COPY --from=builder /app/next.config.ts ./

# Configuración para Next.js (obligatoria en contenedor)
ENV NODE_ENV=production
ENV PORT=3000

# Exponer puerto
EXPOSE 3000

# Comando de arranque
CMD ["npm", "start"]
