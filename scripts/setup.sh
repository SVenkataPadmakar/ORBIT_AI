#!/usr/bin/env bash
# One-time local setup: creates .env from the example, verifies Docker is
# available, and pulls base images ahead of the first `make up` so that
# first run isn't blocked on a slow image pull mid-build.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v docker &> /dev/null; then
  echo "Docker is required but was not found on PATH. Install Docker Desktop and re-run this script." >&2
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example — fill in your API keys (OpenAI/Anthropic/Gemini/Stripe/Google OAuth) before running the pipeline."
else
  echo ".env already exists, leaving it as-is."
fi

echo "Pulling base images..."
docker pull postgres:16-alpine
docker pull redis:7-alpine
docker pull chromadb/chroma:0.5.5

echo "Setup complete. Run 'make up' to start the stack, then 'make migrate' once the backend is healthy."
