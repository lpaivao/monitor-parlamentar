# ── Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Runtime (nginx) ────────────────────────────────────────────────
FROM nginx:alpine AS runtime

# Remove config padrão e copia a nossa
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o build do React
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
