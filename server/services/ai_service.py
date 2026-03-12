"""
AI Service: classification, translation mock, language detection, auto-assignment.
No paid API keys required — uses keyword-based rule engine for demo.
"""
import re
import random
from datetime import datetime

# ─── Language metadata ────────────────────────────────────────────────
LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "bn": "Bengali",
    "te": "Telugu",
    "mr": "Marathi",
    "ta": "Tamil",
    "gu": "Gujarati",
    "kn": "Kannada",
    "ml": "Malayalam",
    "pa": "Punjabi",
    "ur": "Urdu",
    "fr": "French",
    "es": "Spanish",
    "ar": "Arabic",
    "zh": "Chinese",
    "de": "German",
}

# ─── Category Keywords ────────────────────────────────────────────────
CATEGORY_KEYWORDS = {
    "roads": ["road", "pothole", "highway", "bridge", "pavement", "traffic", "street",
              "गड्ढा", "सड़क", "यातायात", "पुल"],
    "water": ["water", "pipe", "supply", "leak", "drain", "tap", "borwell", "sewage",
              "पानी", "नल", "सीवेज", "पाइप"],
    "electricity": ["electricity", "power", "light", "wire", "transformer", "blackout",
                    "street light", "बिजली", "लाइट", "तार"],
    "garbage": ["garbage", "waste", "trash", "dustbin", "collection", "litter", "dump",
                "कचरा", "गंदगी", "कूड़ा"],
    "sanitation": ["toilet", "sanitation", "swachh", "hygiene", "open defecation",
                   "शौचालय", "स्वच्छता"],
    "health": ["hospital", "clinic", "doctor", "ambulance", "medicine", "covid",
               "अस्पताल", "डॉक्टर", "दवा"],
    "safety": ["crime", "police", "theft", "assault", "harassment", "safety", "accident",
               "चोरी", "पुलिस", "हमला", "सुरक्षा"],
    "land": ["land", "encroachment", "property", "construction", "illegal", "building",
             "जमीन", "अतिक्रमण", "संपत्ति"],
}

SEVERITY_KEYWORDS = {
    "critical": ["urgent", "emergency", "critical", "life", "death", "accident", "fire",
                 "flood", "collapse", "no water", "hospital", "immediate",
                 "तुरंत", "आपातकाल", "जीवन", "मौत", "आग"],
    "high": ["serious", "dangerous", "major", "weeks", "month", "blocked", "broken",
             "गंभीर", "हफ्तों", "खतरनाक"],
    "medium": ["issue", "problem", "not working", "inconvenience",
               "समस्या", "काम नहीं कर", "परेशानी"],
    "low": ["minor", "small", "request", "suggestion", "छोटा", "सुझाव"],
}

SUBCATEGORY_MAP = {
    "roads": {"pothole": ["pothole", "hole", "गड्ढा"],
               "broken": ["broken", "damaged", "टूटी"],
               "traffic": ["traffic", "signal", "यातायात"]},
    "water": {"no_supply": ["no water", "no supply", "पानी नहीं"],
               "leak": ["leak", "leakage", "टपकना"],
               "quality": ["dirty", "smell", "गंदा"]},
    "electricity": {"street_light": ["street light", "light", "लाइट"],
                     "power_cut": ["power cut", "no power", "बिजली नहीं"],
                     "wire": ["wire", "cable", "तार"]},
    "garbage": {"collection": ["collection", "not collected", "कचरा नहीं"],
                 "dump": ["dump", "illegal", "अवैध"]},
}

def detect_language(text: str) -> str:
    """Simple language detection based on Unicode ranges."""
    devanagari = len(re.findall(r'[\u0900-\u097F]', text))
    arabic = len(re.findall(r'[\u0600-\u06FF]', text))
    chinese = len(re.findall(r'[\u4E00-\u9FFF]', text))
    bengali = len(re.findall(r'[\u0980-\u09FF]', text))
    tamil = len(re.findall(r'[\u0B80-\u0BFF]', text))
    telugu = len(re.findall(r'[\u0C00-\u0C7F]', text))
    kannada = len(re.findall(r'[\u0C80-\u0CFF]', text))

    if devanagari > 3:
        return "hi"
    if arabic > 3:
        return "ar"
    if chinese > 3:
        return "zh"
    if bengali > 3:
        return "bn"
    if tamil > 3:
        return "ta"
    if telugu > 3:
        return "te"
    if kannada > 3:
        return "kn"
    return "en"

def classify_complaint(title: str, description: str) -> dict:
    """Keyword-based complaint classification."""
    text = (title + " " + description).lower()

    # Detect category
    category = "other"
    max_score = 0
    for cat, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw.lower() in text)
        if score > max_score:
            max_score = score
            category = cat

    # Detect subcategory
    subcategory = "general"
    if category in SUBCATEGORY_MAP:
        for sub, keywords in SUBCATEGORY_MAP[category].items():
            if any(kw.lower() in text for kw in keywords):
                subcategory = sub
                break

    # Detect severity
    severity = "medium"
    for sev in ["critical", "high", "low"]:
        if any(kw.lower() in text for kw in SEVERITY_KEYWORDS[sev]):
            severity = sev
            break

    return {"category": category, "subcategory": subcategory, "severity": severity}

# Mock translations for demo (Hindi phrases to English)
MOCK_TRANSLATIONS = {
    "hi": "This complaint has been submitted in Hindi and automatically translated to English by the GovTech AI translation system for processing.",
    "bn": "This complaint has been submitted in Bengali and automatically translated to English for processing.",
    "mr": "This complaint has been submitted in Marathi and automatically translated to English for processing.",
    "ta": "This complaint has been submitted in Tamil and automatically translated to English for processing.",
    "te": "This complaint has been submitted in Telugu and automatically translated to English for processing.",
    "ar": "This complaint has been submitted in Arabic and automatically translated to English for processing.",
}

def translate_text(text: str, source_lang: str, target_lang: str = "en") -> dict:
    """Mock translation — in production replace with Google Translate API."""
    if source_lang == target_lang or source_lang == "en":
        return {"translated_text": text, "translated": False, "confidence": 1.0}

    # Return a description of translation (mock)
    translated = MOCK_TRANSLATIONS.get(source_lang, f"[Auto-translated from {LANGUAGES.get(source_lang, source_lang)}]: {text}")
    return {
        "translated_text": translated,
        "translated": True,
        "source_language": source_lang,
        "source_language_name": LANGUAGES.get(source_lang, source_lang),
        "confidence": round(random.uniform(0.88, 0.97), 2),
    }

def auto_assign_department(category: str) -> str:
    from data.store import CATEGORY_TO_DEPT
    return CATEGORY_TO_DEPT.get(category, "GENERAL")

def generate_complaint_id(counter: int) -> str:
    year = datetime.utcnow().year
    return f"GOV-{year}-{str(counter).zfill(5)}"
