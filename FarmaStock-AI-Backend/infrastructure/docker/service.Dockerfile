
FROM node:22-alpine

ARG SERVICE

WORKDIR /app

COPY shared ./shared
COPY services/${SERVICE}-service ./services/${SERVICE}-service

# Instalar dependencias compartidas
WORKDIR /app/shared
RUN npm install --omit=dev --no-audit --no-fund

# Instalar dependencias del microservicio
WORKDIR /app/services/${SERVICE}-service
RUN npm install --omit=dev --no-audit --no-fund

ENV NODE_ENV=production

CMD ["node", "src/server.js"]
