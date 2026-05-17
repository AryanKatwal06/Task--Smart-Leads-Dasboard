FROM node:18-alpine AS build
WORKDIR /usr/src/app

COPY package*.json tsconfig*.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/index.js"]
