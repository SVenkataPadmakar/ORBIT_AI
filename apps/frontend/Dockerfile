# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.7.0 --activate

# ---- dev: hot-reload image used by docker-compose.dev.yml ----
FROM base AS dev
COPY package.json ./
RUN pnpm install
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]

# ---- deps: installs dependencies only, cached separately from source copies ----
FROM base AS deps
COPY package.json ./
RUN pnpm install

# ---- build: compiles the standalone Next.js production build ----
FROM base AS build
ENV DOCKER_BUILD=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ---- runtime: slim final image, only the standalone output + static assets ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
