FROM node:18-alpine

WORKDIR /app

# Установка зависимостей
COPY package*.json ./
RUN npm ci --only=production

# Добавление шрифтов
RUN mkdir -p ./assets/fonts
COPY assets/fonts/* ./assets/fonts/

# Копирование кода
COPY dist/ ./dist/

EXPOSE 3000

CMD ["node", "dist/server.js"]
