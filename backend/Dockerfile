FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci --production

FROM base AS final
COPY --from=deps /app/node_modules ./node_modules
COPY server.js ./
COPY src ./src
EXPOSE 5000
CMD ["node", "server.js"]
