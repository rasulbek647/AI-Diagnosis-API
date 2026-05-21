# Netlify + Render (production)

| Xizmat | Manzil |
|--------|--------|
| **Frontend (Netlify)** | https://clever-mousse-90117c.netlify.app |
| **Backend (Render)** | https://ai-diagnosis-api.onrender.com |
| **API base** | https://ai-diagnosis-api.onrender.com/api/v1 |
| **GitHub** | https://github.com/rasulbek647/AI-Diagnosis-API |
| **Render dashboard** | https://dashboard.render.com/web/srv-d826bbbtqb8s73caa5q0 |

---

## 1) Render — backend

1. [Render dashboard](https://dashboard.render.com/web/srv-d826bbbtqb8s73caa5q0) → **Environment**.
2. Quyidagilarni tekshiring:
   - `JWT_SECRET` — uzun maxfiy kalit (o‘zgartirsangiz barcha foydalanuvchilar qayta kirishi kerak)
   - `ACCESS_TOKEN_EXPIRE_HOURS` = `720` (30 kun — kunlik chiqib ketmaslik uchun)
   - `REFRESH_TOKEN_EXPIRE_DAYS` = `90`
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` — admin hisobi
   - **`CORS_ORIGINS`** =  
     `https://clever-mousse-90117c.netlify.app,http://localhost:5173,http://localhost:3000`
3. Repo: `rasulbek647/AI-Diagnosis-API`, `render.yaml` orqali deploy.
4. **Manual Deploy** yoki GitHub pushdan keyin avtomatik deploy.

**Tekshiruv:** https://ai-diagnosis-api.onrender.com/health → `{"ok":true}`

---

## 2) Netlify — frontend

1. [Netlify](https://app.netlify.com) → site **clever-mousse-90117c**.
2. Repo: `rasulbek647/AI-Diagnosis-API`, build `netlify.toml` bo‘yicha.
3. `netlify.toml` ichida `VITE_API_URL` allaqachon yozilgan. Dashboardda ham tekshiring:
   - **`VITE_API_URL`** = `https://ai-diagnosis-api.onrender.com/api/v1`
   - **`VITE_DEMO`** = `false`
4. O‘zgarishdan keyin **Deploys → Trigger deploy**.

**Tekshiruv:** https://clever-mousse-90117c.netlify.app — kirish/ro‘yxatdan o‘tish ishlaydi.

---

## 3) Ulash (muhim)

| Qayerda | Qiymat |
|--------|--------|
| **Netlify** | `VITE_API_URL=https://ai-diagnosis-api.onrender.com/api/v1` |
| **Render** | `CORS_ORIGINS=https://clever-mousse-90117c.netlify.app,...` |

CORS noto‘g‘ri bo‘lsa brauzerda API so‘rovlari bloklanadi.

---

## 4) Mahalliy ishlab chiqish

`frontend/.env.local`:

```env
VITE_API_URL=http://127.0.0.1:8000/api/v1
VITE_DEMO=false
```

Backend: `backend` papkasida `uvicorn app.main:app --reload --port 8000`

---

## 5) GitHub ga yangilash

```bash
git add .
git commit -m "Update deploy config for Netlify and Render"
git push origin main
```

Pushdan keyin Netlify va Render (auto-deploy yoqilgan bo‘lsa) yangilanadi.
