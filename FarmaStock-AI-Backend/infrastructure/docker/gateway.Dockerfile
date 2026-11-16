FROM node:22-alpine
WORKDIR /app
COPY gateway/package.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY gateway/src ./src
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "src/server.js"]
