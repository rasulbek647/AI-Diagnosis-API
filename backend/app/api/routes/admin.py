import json
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_admin_user
from app.core.config import settings
from app.core.database import get_db
from app.ml.symptom_categories import VALID_SYMPTOM_CATEGORY
from app.models.diagnosis import DiagnosisHistory
from app.models.disease import DiseaseKnowledge
from app.models.user import User
from app.schemas.disease import DiseaseCreateIn, DiseaseOut, DiseaseUpdateIn
from app.schemas.user import AdminUserUpdateIn, UserOut
from app.services.auth_service import get_user_by_email, hash_password

router = APIRouter()


def _sanitize_translations(raw: dict[str, Any] | None) -> dict[str, Any]:
    out: dict[str, Any] = {}
    if not isinstance(raw, dict):
        return out
    for loc in ("en", "ru"):
        block = raw.get(loc)
        if isinstance(block, dict):
            clean: dict[str, str] = {}
            for key in ("name", "description", "treatment"):
                val = block.get(key)
                if isinstance(val, str) and val.strip():
                    clean[key] = val.strip()
            if clean:
                out[loc] = clean
    return out


def _normalize_category(value: str | None) -> str:
    cat = (value or "general").strip().lower()
    return cat if cat in VALID_SYMPTOM_CATEGORY else "general"


@router.get("/users", response_model=list[UserOut])
def users(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(User).order_by(User.created_at.desc()).all()


def _apply_admin_user_update(target: User, payload: AdminUserUpdateIn, db: Session) -> User:
    is_main_admin = bool(settings.admin_email) and target.email == settings.admin_email

    if payload.full_name is not None:
        name = payload.full_name.strip()
        if not name:
            raise HTTPException(status_code=400, detail="Full name cannot be empty")
        target.full_name = name

    if payload.email is not None:
        next_email = str(payload.email).lower().strip()
        if next_email != target.email:
            if is_main_admin:
                raise HTTPException(status_code=403, detail="Main admin email cannot be changed")
            if next_email == settings.admin_email:
                raise HTTPException(status_code=403, detail="This email is reserved for main admin")
            if get_user_by_email(db, next_email):
                raise HTTPException(status_code=400, detail="Email already registered")
            target.email = next_email

    if payload.role is not None:
        role = payload.role.strip().lower()
        if role not in {"admin", "user"}:
            raise HTTPException(status_code=400, detail="Role must be admin or user")
        if role == "admin" and target.email != settings.admin_email:
            raise HTTPException(status_code=403, detail="Only configured main admin can have admin role")
        if is_main_admin and role != "admin":
            raise HTTPException(status_code=403, detail="Main admin role cannot be changed")
        target.role = role

    if payload.is_active is not None:
        if is_main_admin and not payload.is_active:
            raise HTTPException(status_code=403, detail="Main admin cannot be deactivated")
        target.is_active = payload.is_active

    if payload.new_password is not None:
        pwd = payload.new_password.strip()
        if len(pwd) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        target.password_hash = hash_password(pwd)

    return target


@router.patch("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    payload: AdminUserUpdateIn,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    _apply_admin_user_update(target, payload, db)
    db.commit()
    db.refresh(target)
    return target


@router.patch("/users/{user_id}/role", response_model=UserOut)
def update_user_compat(
    user_id: int,
    payload: AdminUserUpdateIn,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Eski deploylar uchun: to‘liq tahrirlash shu yo‘lda ham ishlaydi."""
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    _apply_admin_user_update(target, payload, db)
    db.commit()
    db.refresh(target)
    return target


@router.delete("/users/{user_id}")
def delete_user(user_id: int, _: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.email == settings.admin_email:
        raise HTTPException(status_code=403, detail="Main admin cannot be deleted")
    db.delete(target)
    db.commit()
    return {"message": "deleted"}


@router.get("/stats")
def stats(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_diagnoses = db.query(func.count(DiagnosisHistory.id)).scalar() or 0
    active_today = db.query(func.count(User.id)).filter(User.is_active.is_(True)).scalar() or 0

    first_probs: list[float] = []
    rows = db.query(DiagnosisHistory.results).all()
    for (results,) in rows:
        if isinstance(results, str):
            try:
                results = json.loads(results)
            except json.JSONDecodeError:
                results = []
        if isinstance(results, list) and results:
            try:
                first_probs.append(float(results[0].get("probability", 0)))
            except (TypeError, ValueError):
                pass

    avg_probability = (sum(first_probs) / len(first_probs)) if first_probs else 0.0
    return {
        "total_users": int(total_users),
        "active_users": int(active_today),
        "total_diagnoses": int(total_diagnoses),
        "avg_probability": round(avg_probability, 2),
    }


@router.get("/diagnoses")
def diagnoses(
    limit: int = Query(default=20, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    query = db.query(DiagnosisHistory, User).join(User, User.id == DiagnosisHistory.user_id)
    rows = query.order_by(DiagnosisHistory.created_at.desc()).offset(offset).limit(limit).all()
    items = [
        {
            "id": history.id,
            "user_name": user.full_name,
            "user_email": user.email,
            "created_at": history.created_at,
            "top_diagnosis": history.top_diagnosis,
            "symptoms": history.symptoms,
            "results": history.results,
        }
        for history, user in rows
    ]
    return {"items": items, "total": query.count()}


@router.get("/diseases", response_model=list[DiseaseOut])
def diseases(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(DiseaseKnowledge).order_by(DiseaseKnowledge.created_at.desc()).all()


@router.post("/diseases", response_model=DiseaseOut)
def create_disease(
    payload: DiseaseCreateIn,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    item = DiseaseKnowledge(
        name=payload.name.strip(),
        description=payload.description.strip(),
        treatment=payload.treatment.strip(),
        keywords=[kw.strip().lower() for kw in payload.keywords if kw.strip()],
        category=_normalize_category(payload.category),
        translations=_sanitize_translations(payload.translations),
        is_active=payload.is_active,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/diseases/{disease_id}", response_model=DiseaseOut)
def update_disease(
    disease_id: int,
    payload: DiseaseUpdateIn,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    item = db.get(DiseaseKnowledge, disease_id)
    if not item:
        raise HTTPException(status_code=404, detail="Disease not found")

    if payload.name is not None:
        item.name = payload.name.strip()
    if payload.description is not None:
        item.description = payload.description.strip()
    if payload.treatment is not None:
        item.treatment = payload.treatment.strip()
    if payload.keywords is not None:
        item.keywords = [kw.strip().lower() for kw in payload.keywords if kw.strip()]
    if payload.category is not None:
        item.category = _normalize_category(payload.category)
    if payload.translations is not None:
        item.translations = _sanitize_translations(payload.translations)
    if payload.is_active is not None:
        item.is_active = payload.is_active

    db.commit()
    db.refresh(item)
    return item


@router.delete("/diseases/{disease_id}")
def delete_disease(
    disease_id: int,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    item = db.get(DiseaseKnowledge, disease_id)
    if not item:
        raise HTTPException(status_code=404, detail="Disease not found")
    db.delete(item)
    db.commit()
    return {"message": "deleted"}
