FROM node:18-alpine

WORKDIR /app

# Системные зависимости для Sharp
RUN apk add --no-cache vips-dev build-base python3 make g++

# Копируем package.json
COPY package*.json ./
RUN npm ci

# Копируем весь код
COPY . .

# СБОРКА внутри Docker!
RUN npm run build

# Очистка dev зависимостей
RUN npm ci --only=production && npm cache clean --force

EXPOSE 3000
CMD ["node", "dist/server.js"]
