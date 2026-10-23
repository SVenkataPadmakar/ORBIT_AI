.PHONY: up up-d down logs backend-shell frontend-shell migrate migration seed \
        test-backend test-frontend lint-backend lint-frontend

up:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

up-d:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

down:
	docker compose down -v

logs:
	docker compose logs -f

backend-shell:
	docker compose exec backend bash

frontend-shell:
	docker compose exec frontend sh

migrate:
	docker compose exec backend alembic upgrade head

migration:
	docker compose exec backend alembic revision --autogenerate -m "$(name)"

seed:
	docker compose exec backend python -m app.db.seed

test-backend:
	docker compose exec backend pytest -v

test-frontend:
	pnpm --filter frontend test

lint-backend:
	docker compose exec backend ruff check app

lint-frontend:
	pnpm --filter frontend lint
