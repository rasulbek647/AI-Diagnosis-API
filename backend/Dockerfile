# Faqat API (frontend Netlifyda bo‘lsa, Render shu imagedan ishlaydi)
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
# Postgres faqat Docker/Render (Python 3.11 wheel); mahalliy SQLite uchun requirements.txt yetarli
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir "psycopg2-binary>=2.9.9,<3"
COPY . .
ENV PYTHONUNBUFFERED=1
EXPOSE 8000
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
