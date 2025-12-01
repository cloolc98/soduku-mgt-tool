# ==========================================
# STAGE 1: Build the Angular Application
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build -- --configuration production

# ==========================================
# STAGE 2: Serve with Node.js
# ==========================================
FROM node:20-alpine

WORKDIR /app

RUN npm install -g http-server

COPY --from=build /app/dist/soduku-mgt-tool/browser .

ENV CONTAINER_PORT=10000

EXPOSE $CONTAINER_PORT

CMD http-server . -p $CONTAINER_PORT