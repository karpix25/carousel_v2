FROM node:18-alpine

WORKDIR /app

# Установка системных зависимостей для Sharp
RUN apk add --no-cache \
    vips-dev \
    build-base \
    python3 \
    make \
    g++

# Копирование package.json
COPY package*.json ./

# Установка зависимостей (используем install вместо ci)
RUN npm install

# Копирование исходного кода
COPY . .

# Сборка TypeScript
RUN npm run build

# Удаление dev зависимостей после сборки
RUN npm prune --production && npm cache clean --force

# Создание папки для шрифтов если её нет
RUN mkdir -p ./assets/fonts

EXPOSE 3000

CMD ["node", "dist/server.js"]
