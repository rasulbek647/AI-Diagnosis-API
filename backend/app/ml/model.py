import re

from app.ml.symptoms_data import DISEASE_RULES

_APOSTROPHE_LIKE = "\u2019\u2018\u0060\u00b4"


def _normalize(s: str) -> str:
    t = s.lower().strip()
    for ch in _APOSTROPHE_LIKE:
        t = t.replace(ch, "'")
    return t


def _symptom_matches_kw(symptom: str, kw: str) -> bool:
    """O‘zbekcha apostrof farqlari va qisqa/qisman mos kelish (og'riq vs ogrigi)."""
    a, b = _normalize(symptom), _normalize(kw)
    if not a or not b:
        return False
    if b in a or a in b:
        return True
    af, bf = a.replace("'", ""), b.replace("'", "")
    if bf in af or af in bf:
        return True
    return False


def _keywords_for_disease(disease: dict) -> list[str]:
    raw = disease.get("keywords") or []
    kws = [_normalize(k) for k in raw if isinstance(k, str) and _normalize(k)]
    if kws:
        return kws
    name = disease.get("name") or ""
    tokens = [_normalize(t) for t in re.split(r"[\s,;()|/]+", name) if len(_normalize(t)) >= 2]
    return tokens


def run_rule_based_diagnosis(symptoms: list[str], custom_rules: list[dict] | None = None) -> list[dict]:
    normalized = [_normalize(s) for s in symptoms if s and str(s).strip()]
    if not normalized:
        return []

    # Ma'lumot bazasidagi kasalliklar birinchi — tez-tez shu yerga maxsus qo'shiladi
    rules = [*(custom_rules or []), *DISEASE_RULES]
    scored: list[dict] = []
    for idx, disease in enumerate(rules, start=1):
        keywords = _keywords_for_disease(disease)
        if not keywords:
            continue
        matches = sum(
            1 for kw in keywords if any(_symptom_matches_kw(symptom, kw) for symptom in normalized)
        )
        # Uzoq kalit ro'yxatida ball pasayib ketmasin
        denom = max(min(len(keywords), 10), 1)
        ratio = matches / denom
        bonus = min(len(normalized), 8) * 0.01
        probability = min(0.95, round(ratio * 0.88 + bonus, 2))
        scored.append(
            {
                "id": idx,
                "name": disease["name"],
                "probability": probability,
                "description": disease["description"],
                "recommendations": disease["recommendations"],
            }
        )

    scored.sort(key=lambda item: item["probability"], reverse=True)
    return scored[:6]
