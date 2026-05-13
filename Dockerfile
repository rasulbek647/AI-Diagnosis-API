# Ixtiyoriy: bitta konteynerda frontend+backend (Netlify+Render bo‘lmasa).
# Asosiy API deploy: backend/Dockerfile + render.yaml
FROM node:20-alpine AS frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
ENV VITE_API_URL=/api/v1
RUN npm run build

# Backend (FastAPI) + statik SPA
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir "psycopg2-binary>=2.9.9,<3"
COPY backend/ .
COPY --from=frontend /app/dist ./static

ENV PYTHONUNBUFFERED=1
EXPOSE 8000
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
