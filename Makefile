# Atajos para el entorno de desarrollo con Docker Compose
# Uso: make <comando>    Ejemplo: make up
# Sin comando (solo "make") muestra esta ayuda

# Estos nombres son comandos, no archivos
.PHONY: help up build down restart ps logs logs-front logs-back logs-db db-shell clean

help:
	@echo "Comandos disponibles:"
	@echo ""
	@echo "  make up          Levanta todo el stack en segundo plano"
	@echo "  make build       Reconstruye las imagenes y levanta (tras instalar dependencias)"
	@echo "  make down        Apaga y borra los contenedores (los datos de Mongo se conservan)"
	@echo "  make restart     Reinicia los servicios"
	@echo "  make ps          Muestra el estado de cada servicio"
	@echo ""
	@echo "  make logs        Logs de todos los servicios en vivo"
	@echo "  make logs-front  Logs del frontend (React + Vite)"
	@echo "  make logs-back   Logs del backend (Express)"
	@echo "  make logs-db     Logs de MongoDB"
	@echo "                   (Ctrl + C para salir de los logs)"
	@echo ""
	@echo "  make db-shell    Abre la consola de MongoDB (mongosh) en la base real_estate"
	@echo "  make clean       Apaga todo y BORRA los datos de Mongo (pide confirmacion)"

up:
	docker compose up -d

build:
	docker compose up -d --build

down:
	docker compose down

restart:
	docker compose restart

ps:
	docker compose ps

logs:
	docker compose logs -f --tail=100

logs-front:
	docker compose logs -f --tail=100 frontend

logs-back:
	docker compose logs -f --tail=100 backend

logs-db:
	docker compose logs -f --tail=100 mongo

db-shell:
	docker compose exec mongo mongosh real_estate

clean:
	@printf "Esto borra los contenedores y TODOS los datos de MongoDB. Seguro? [s/N] "; \
	read respuesta; \
	if [ "$$respuesta" = "s" ]; then docker compose down -v; else echo "Cancelado, no se borro nada"; fi
