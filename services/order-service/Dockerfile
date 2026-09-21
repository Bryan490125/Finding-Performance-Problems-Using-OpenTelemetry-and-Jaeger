FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY server.js tracing.js ./

CMD ["node", "--require", "./tracing.js", "server.js"]