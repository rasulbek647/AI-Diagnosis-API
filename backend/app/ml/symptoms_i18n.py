"""Tizim kasalliklari (DISEASE_RULES) uchun EN/RU tarjimalar — nom kaliti o‘zbekcha nom."""

from __future__ import annotations

from typing import Any

BUILTIN_I18N: dict[str, dict[str, dict[str, Any]]] = {
    "ARVI (Tez-tez shamollash)": {
        "en": {
            "name": "ARI (Common cold)",
            "description": "Viral infection of the upper respiratory tract.",
            "recommendations": [
                "Drink plenty of fluids",
                "Rest",
                "See a doctor if symptoms worsen",
            ],
        },
        "ru": {
            "name": "ОРВИ (Простуда)",
            "description": "Вирусное воспаление верхних дыхательных путей.",
            "recommendations": [
                "Пейте больше жидкости",
                "Отдыхайте",
                "Обратитесь к врачу при ухудшении",
            ],
        },
    },
    "Gripp (Influenza)": {
        "en": {
            "name": "Flu (Influenza)",
            "description": "Acute respiratory infection caused by the influenza virus.",
            "recommendations": [
                "Stay in bed and rest",
                "Drink plenty of fluids",
                "Follow your doctor's advice",
            ],
        },
        "ru": {
            "name": "Грипп (Influenza)",
            "description": "Острое респираторное заболевание, вызванное вирусом гриппа.",
            "recommendations": [
                "Соблюдайте постельный режим",
                "Пейте больше жидкости",
                "Следуйте рекомендациям врача",
            ],
        },
    },
    "Migren": {
        "en": {
            "name": "Migraine",
            "description": "Neurological condition with severe headache episodes.",
            "recommendations": [
                "Rest in a dark, quiet room",
                "Reduce stress",
                "See a neurologist if attacks recur",
            ],
        },
        "ru": {
            "name": "Мигрень",
            "description": "Неврологическое состояние с приступами сильной головной боли.",
            "recommendations": [
                "Отдыхайте в тёмной тихой комнате",
                "Снижайте стресс",
                "При частых приступах обратитесь к неврологу",
            ],
        },
    },
    "Gastrit": {
        "en": {
            "name": "Gastritis",
            "description": "Inflammation of the stomach lining.",
            "recommendations": [
                "Avoid fatty and spicy food",
                "Improve meal schedule",
                "Consult a gastroenterologist",
            ],
        },
        "ru": {
            "name": "Гастрит",
            "description": "Воспаление слизистой оболочки желудка.",
            "recommendations": [
                "Избегайте жирной и острой пищи",
                "Наладьте режим питания",
                "Проконсультируйтесь с гастроэнтерологом",
            ],
        },
    },
}


def localize_builtin_result(item: dict[str, Any], lang: str) -> dict[str, Any]:
    if lang == "uz":
        return item
    pack = BUILTIN_I18N.get(item.get("name") or "")
    if not pack:
        return item
    loc = pack.get(lang)
    if not loc:
        return item
    rec = loc.get("recommendations")
    return {
        **item,
        "name": loc.get("name") or item["name"],
        "description": loc.get("description") or item["description"],
        "recommendations": rec if isinstance(rec, list) else item["recommendations"],
    }
