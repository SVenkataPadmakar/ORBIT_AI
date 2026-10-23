# syntax=docker/dockerfile:1

FROM python:3.12-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir poetry==1.8.3 \
    && poetry config virtualenvs.create false
COPY pyproject.toml ./

# ---- dev: hot-reload image used by docker-compose.dev.yml ----
FROM base AS dev
RUN poetry install --no-interaction --no-ansi --no-root
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# ---- build: installs prod-only deps and copies source, feeds the runtime stage ----
FROM base AS build
RUN poetry install --interaction --no-ansi --no-root --only main
COPY . .

# ---- runtime: slim final image actually deployed ----
FROM python:3.12-slim AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 curl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=build /usr/local/bin /usr/local/bin
COPY --from=build /app .
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
