# ── Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN node ace build

# ── Runtime ────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime

WORKDIR /app

# Copia apenas o output do build + dependências de produção
COPY --from=builder /app/build ./
COPY --from=builder /app/node_modules ./node_modules

# Roda migrations e depois sobe o servidor
CMD ["sh", "-c", "node ace migration:run --force && node bin/server.js"]

EXPOSE 3333
