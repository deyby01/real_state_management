# Imagen base: Node 24 (versión LTS) sobre Alpine Linux, una distribución muy liviana
FROM node:24-alpine

# Carpeta de trabajo dentro del contenedor. Los comandos siguientes se ejecutan aquí
WORKDIR /app

# Primero solo los archivos de dependencias, para aprovechar la caché de Docker
COPY package*.json ./

# Instala exactamente las versiones de package-lock.json (incluye nodemon)
RUN npm ci

# Después el resto del código
COPY . .

# Documenta el puerto en el que escucha Express
EXPOSE 4000

# Comando que se ejecuta al iniciar el contenedor
CMD ["npm", "run", "dev"]
