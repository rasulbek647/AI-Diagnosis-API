from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.diagnosis import AnalyzeIn, AnalyzeOut
from app.services.diagnosis_service import analyze_symptoms, list_symptoms_structured

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeOut)
def analyze(
    payload: AnalyzeIn,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not payload.symptoms:
        raise HTTPException(status_code=400, detail="Symptoms are required")
    lang = payload.lang if payload.lang in ("uz", "en", "ru") else "uz"
    return AnalyzeOut(results=analyze_symptoms(payload.symptoms, db, lang=lang))


@router.get("/symptoms")
def symptoms(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    by_category, flat = list_symptoms_structured(db)
    return {"by_category": by_category, "items": flat}
