# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — BUILD
# Instala dependencias, inyecta VITE_API_URL y genera el bundle estático.
# El proyecto usa Vite como bundler (SPA), no React Router framework mode.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS build

WORKDIR /app

# ARG para inyectar la URL del backend al bundle en build-time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copiar manifiestos primero (cache de capas)
COPY package.json package-lock.json ./

# Instalación limpia y reproducible (ignorar postinstall en esta capa)
RUN npm ci --ignore-scripts

# Copiar el resto del código fuente
COPY . .

# Generar el shim de react-router-serve manualmente
RUN node scripts/setup-serve.js

# Generar bundle estático en /app/dist
RUN npm run build

# Eliminar devDependencies para reducir imagen final
RUN npm prune --omit=dev

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — RUNNER
# Sirve la SPA estática con `vite preview` en el puerto 3000.
# Imagen ligera, sin root, sin devDependencies.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS runner

WORKDIR /app

# Copiar artefactos del stage build con la propiedad del usuario node
COPY --from=build --chown=node:node /app/dist        ./dist
COPY --from=build --chown=node:node /app/build       ./build
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json

EXPOSE 3000

# Transferir control al usuario seguro no-root (evitar privilegios de root)
USER node

# Comando de inicio oficial requerido
CMD ["./node_modules/.bin/react-router-serve", "./build/server/index.js"]
