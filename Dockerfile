# Dockerfile para o backend (Node.js/Express)
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
# RUN npx prisma generate (linha original comentada)
RUN npx prisma generate
EXPOSE 5000
CMD ["npx", "ts-node", "src/server.ts"] 