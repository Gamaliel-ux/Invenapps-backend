# Base image
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
# We run prisma generate (if schema exists) before building to compile the types
RUN npx prisma generate || true
RUN npm run build
RUN npm prune --production

# Production runner
FROM base AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main"]
