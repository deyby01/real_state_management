# Misma base que el backend: Node 24 (LTS) sobre Alpine Linux
FROM node:24-alpine

WORKDIR /app

# Dependencias primero, para aprovechar la caché de Docker
COPY package*.json ./
RUN npm ci

# Después el resto del código
COPY . .

# Puerto por defecto del servidor de desarrollo de Vite
EXPOSE 5173

# --host hace que Vite acepte conexiones desde fuera del contenedor
CMD ["npm", "run", "dev", "--", "--host"]
