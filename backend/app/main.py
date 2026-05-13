from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import admin, auth, diagnosis, history
from app.core.config import settings
from app.core.database import init_db
from app.services.auth_service import ensure_admin_user

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
SPA_INDEX = STATIC_DIR / "index.html"
spa_enabled = SPA_INDEX.is_file()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False if "*" in settings.cors_origins else True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    init_db()
    ensure_admin_user()


@app.get("/")
def root():
    if spa_enabled:
        return FileResponse(SPA_INDEX)
    return {"status": "ok", "service": settings.app_name}


@app.get("/health")
def health():
    return {"ok": True}


app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(diagnosis.router, prefix="/api/v1/diagnosis", tags=["diagnosis"])
app.include_router(history.router, prefix="/api/v1/history", tags=["history"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])

if spa_enabled:
    assets_dir = STATIC_DIR / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="spa-assets")

    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str):
        if full_path.startswith("api"):
            return JSONResponse({"detail": "Not Found"}, status_code=404)
        candidate = (STATIC_DIR / full_path).resolve()
        try:
            candidate.relative_to(STATIC_DIR.resolve())
        except ValueError:
            return FileResponse(SPA_INDEX)
        if candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(SPA_INDEX)
