import re
from typing import Any

from sqlalchemy.orm import Session

from app.ml.model import run_rule_based_diagnosis
from app.ml.symptom_categories import SYMPTOMS_BY_CATEGORY, VALID_SYMPTOM_CATEGORY
from app.ml.symptoms_i18n import localize_builtin_result
from app.models.disease import DiseaseKnowledge


def _expand_disease_keywords(name: str, keywords: list[str] | None) -> list[str]:
    """Admin kalit so‘zlari + kasallik nomidagi so‘zlar — nomni kiritganda ham moslash uchun."""
    seen: set[str] = set()
    ordered: list[str] = []
    for k in keywords or []:
        if isinstance(k, str):
            k = k.strip().lower()
            if k and k not in seen:
                seen.add(k)
                ordered.append(k)
    for token in re.split(r"[\s,;()|/]+", (name or "").lower()):
        token = token.strip()
        if len(token) >= 2 and token not in seen:
            seen.add(token)
            ordered.append(token)
    return ordered


def _localize_db_disease(item: dict[str, Any], row: DiseaseKnowledge, lang: str) -> dict[str, Any]:
    if lang == "uz":
        return item
    raw = row.translations
    tr: dict[str, Any] = raw if isinstance(raw, dict) else {}
    block = tr.get(lang)
    if not isinstance(block, dict):
        return item
    name = block.get("name") or item["name"]
    desc = block.get("description") or item["description"]
    treat = (block.get("treatment") or "").strip()
    rec = [treat] if treat else item["recommendations"]
    return {**item, "name": name, "description": desc, "recommendations": rec}


def analyze_symptoms(symptoms: list[str], db: Session, lang: str = "uz") -> list[dict]:
    lang = lang if lang in ("uz", "en", "ru") else "uz"
    active_diseases = (
        db.query(DiseaseKnowledge)
        .filter(DiseaseKnowledge.is_active.is_(True))
        .all()
    )
    disease_by_name = {row.name: row for row in active_diseases}
    custom_rules = [
        {
            "name": row.name,
            "description": row.description,
            "recommendations": [row.treatment] if row.treatment else [],
            "keywords": _expand_disease_keywords(row.name, row.keywords),
        }
        for row in active_diseases
    ]
    raw = run_rule_based_diagnosis(symptoms, custom_rules=custom_rules)
    out: list[dict] = []
    for item in raw:
        row = disease_by_name.get(item["name"])
        if row:
            item = _localize_db_disease(item, row, lang)
        else:
            item = localize_builtin_result(item, lang)
        out.append(item)
    return out


def list_symptoms_structured(db: Session) -> tuple[dict[str, list[str]], list[str]]:
    """Bo‘limlar bo‘yicha alomatlar + tekis ro‘yxat."""
    out: dict[str, list[str]] = {k: list(v) for k, v in SYMPTOMS_BY_CATEGORY.items()}
    active_diseases = (
        db.query(DiseaseKnowledge)
        .filter(DiseaseKnowledge.is_active.is_(True))
        .all()
    )
    for row in active_diseases:
        cat = row.category if row.category in VALID_SYMPTOM_CATEGORY else "general"
        for kw in _expand_disease_keywords(row.name, row.keywords):
            if kw not in out[cat]:
                out[cat].append(kw)
    flat: set[str] = set()
    for lst in out.values():
        flat.update(lst)
        lst.sort()
    return out, sorted(flat)


def list_available_symptoms(db: Session) -> list[str]:
    _, flat = list_symptoms_structured(db)
    return flat
