# AI Diagnosis System (MedAI)

Frontend: [Netlify](https://clever-mousse-90117c.netlify.app) · Backend: [Render](https://ai-diagnosis-api.onrender.com) · Repo: [GitHub](https://github.com/rasulbek647/AI-Diagnosis-API)

## Production manzillar

| Xizmat | URL |
|--------|-----|
| Frontend | https://clever-mousse-90117c.netlify.app |
| Backend API | https://ai-diagnosis-api.onrender.com/api/v1 |
| Health check | https://ai-diagnosis-api.onrender.com/health |
| Render dashboard | https://dashboard.render.com/web/srv-d826bbbtqb8s73caa5q0 |

Batafsil deploy: [NETLIFY_RENDER.md](./NETLIFY_RENDER.md)

## Backend endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `PATCH /api/v1/auth/me`
- `POST /api/v1/diagnosis/analyze`
- `GET /api/v1/history`
- `POST /api/v1/history`
- `DELETE /api/v1/history/{id}`
- `GET /api/v1/history/stats`
- `GET /api/v1/admin/users`
- `PATCH /api/v1/admin/users/{id}`
- `PATCH /api/v1/admin/users/{id}/role`
- `DELETE /api/v1/admin/users/{id}`
- `GET /api/v1/admin/stats`
- `GET /api/v1/admin/diagnoses`

## Render (backend)

1. [Render dashboard](https://dashboard.render.com/web/srv-d826bbbtqb8s73caa5q0) yoki Blueprint: repo `render.yaml`.
2. Environment:
   - `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
   - `CORS_ORIGINS=https://clever-mousse-90117c.netlify.app,http://localhost:5173,http://localhost:3000`
3. Health: `/health`

## Netlify (frontend)

- Repo: https://github.com/rasulbek647/AI-Diagnosis-API
- Build: `netlify.toml` (`base = frontend`)
- Env: `VITE_API_URL=https://ai-diagnosis-api.onrender.com/api/v1`, `VITE_DEMO=false`
- Pushdan keyin **Redeploy** qiling

## Mahalliy ishga tushirish

```bash
# Backend (backend/)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (frontend/)
npm install
npm run dev
```

`frontend/.env.local`: `VITE_API_URL=http://127.0.0.1:8000/api/v1`

## Eslatmalar

- Productionda `CORS_ORIGINS` ni `*` qilmang.
- `JWT_SECRET` va `ADMIN_PASSWORD` kuchli bo‘lsin.
- Render free planda birinchi so‘rov sekin bo‘lishi mumkin (cold start).
