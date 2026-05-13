# Netlify + Render (frontend va backend alohida)

## 1) Render — backend

1. [Render](https://render.com) → **New** → **Web Service** (yoki mavjud `render.yaml` bilan **Blueprint**).
2. **Docker**: `Dockerfile path` = `backend/Dockerfile`, **Docker context** = `backend` (Blueprintda allaqachon shunday).
3. **Environment** (majburiy):
   - `DATABASE_URL` — Postgres qo‘shganingizda Render avtomatik beradi.
   - `JWT_SECRET` — uzun tasodifiy qator.
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` — birinchi admin hisobi.
   - **`CORS_ORIGINS`** — Netlify saytingiz manzili, masalan:  
     `https://sizning-app.netlify.app`  
     Bir nechta bo‘lsa vergul bilan: `https://app.netlify.app,http://localhost:5173`
4. Deploy tugagach URL ni yozib oling, masalan: `https://ai-diagnosis-xxxx.onrender.com`

**Tekshiruv:** brauzerda `https://...onrender.com/health` → `{"ok":true}`

---

## 2) Netlify — frontend

1. [Netlify](https://app.netlify.com) → **Add new site** → repo ni ulang.
2. Build sozlamalari `netlify.toml` dan olinadi (`base = frontend`).
3. **Site configuration → Environment variables → Production**:
   - **`VITE_API_URL`** = `https://<render-service>.onrender.com/api/v1`  
     (oxirida **`/api/v1`** bo‘lishi shart.)

4. **Deploy site** (yoki redeploy) — Vite build vaqtida shu o‘zgaruvchi ichiga yoziladi.

**Tekshiruv:** Netlify saytida ro‘yxatdan o‘tish / kirish; Networkda so‘rovlar Render URL ga ketishi kerak.

---

## 3) Ulash (muhim)

| Qayerda | Nima |
|--------|------|
| **Netlify** | `VITE_API_URL` = Render API manzili + `/api/v1` |
| **Render** | `CORS_ORIGINS` = Netlify sayt manzili (`https://....netlify.app`) |

Agar CORS noto‘g‘ri bo‘lsa, brauzerda API chaqiriqlari bloklanadi (konsolda CORS xatoliklari).

---

## 4) Mahalliy ishlab chiqish

**Python:** tavsiya **3.11 yoki 3.12** (3.14 hozircha ba’zi kutubxonalar bilan mos kelmasligi mumkin).  
**Node.js:** frontend uchun **LTS (18+)** va `npm` PATH da bo‘lishi kerak.

`frontend/.env` yoki `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Backend: `uvicorn app.main:app --reload` (`backend` papkasidan).

---

## 5) GitHub ga yuklash (o‘zingiz)

Men sizning GitHub akkauntingizga kira olmayman. Mahalliy kompyuterdan:

```bash
cd ai_diagnosis_system-main
git init
git remote add origin https://github.com/SIZNING_USER/SIZNING_REPO.git
git add .
git commit -m "Initial commit: MedAI diagnosis"
git branch -M main
git push -u origin main
```

Keyin Netlify va Renderda **shu repodan** deploy qilasiz.
