# ==============================================================================
# Stage 1: Build the React + Vite Frontend
# ==============================================================================
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

# Install frontend dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source and build production bundle
COPY frontend/ ./
RUN npm run build

# ==============================================================================
# Stage 2: Python FastAPI Runtime + Static Frontend Server
# ==============================================================================
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    GEMINI_MODEL=gemini-3.6-flash

WORKDIR /app/backend

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY backend/ ./

# Copy compiled frontend dist from Stage 1
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

EXPOSE 8000

# Run FastAPI (serves both /api/* endpoints and the compiled React SPA at /)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
