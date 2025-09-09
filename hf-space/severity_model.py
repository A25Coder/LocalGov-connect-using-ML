from transformers import pipeline
import requests
from io import BytesIO
from PIL import Image

# -------------------------------
# Text Classifier
# -------------------------------
text_classifier = pipeline(
    "text-classification",
    model="distilbert/distilbert-base-uncased-finetuned-sst-2-english"
)

# -------------------------------
# Image Classifier
# -------------------------------
image_classifier = pipeline("image-classification", model="microsoft/resnet-50")

# -------------------------------
# Keyword-based mappings
# -------------------------------
CATEGORY_KEYWORDS = {
    "road": ["pothole", "road damage", "crack", "traffic jam", "accident", "blocked road"],
    "water": ["water leakage", "flood", "water pipe", "water shortage", "sewage"],
    "electricity": ["streetlight", "power outage", "electric short-circuit", "traffic signal", "electricity failure"],
    "sanitation": ["garbage", "trash", "waste", "dirty street", "blocked drain", "sewage"],
    "nature": ["fallen tree", "park maintenance", "plant", "green area", "forest damage"],
    "other": ["noise", "construction", "vandalism", "graffiti", "other"]
}

MEDIUM_KEYWORDS = ["streetlight", "traffic signal", "garbage collection", "park maintenance", "sanitation", "leakage"]
HIGH_KEYWORDS = ["collapsed bridge", "road accident", "major pothole", "flood", "electric short-circuit", "fire", "structural damage"]

# -------------------------------
# Text classification
# -------------------------------
def classify_text(text: str):
    text_lower = text.lower()
    result = text_classifier(text)[0]  
    label = result["label"]
    score = float(result["score"])

    # Determine category
    category = "other"
    for cat, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            category = cat
            break

    # Determine severity
    if any(kw in text_lower for kw in HIGH_KEYWORDS):
        severity = "high"
    elif any(kw in text_lower for kw in MEDIUM_KEYWORDS):
        severity = "medium"
    else:
        # Sentiment-based fallback
        if label == "NEGATIVE":
            if score > 0.85:   
                severity = "high"
            elif score > 0.6:  
                severity = "medium"
            else:
                severity = "low"
        else:
            severity = "low"

    return {"severity": severity, "category": category, "label": label, "score": score}

# -------------------------------
# Image classification
# -------------------------------
def classify_image(image_url: str):
    try:
        response = requests.get(image_url)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content)).convert("RGB")

        results = image_classifier(img)
        if not results:
            return {"severity": "low", "category": "other", "label": "Unknown", "score": 0.0}

        top_result = results[0]
        label_lower = top_result["label"].lower()

        # Determine category
        category = "other"
        for cat, keywords in CATEGORY_KEYWORDS.items():
            if any(kw in label_lower for kw in keywords):
                category = cat
                break

        # Determine severity
        if any(x in label_lower for x in HIGH_KEYWORDS):
            severity = "high"
        elif any(x in label_lower for x in MEDIUM_KEYWORDS):
            severity = "medium"
        else:
            severity = "low"

        return {
            "severity": severity,
            "category": category,
            "label": top_result["label"],
            "score": float(top_result["score"]),
        }

    except Exception as e:
        return {"error": str(e)}

# -------------------------------
# Combined text + image classification
# -------------------------------
def classify_issue(text: str = None, image_url: str = None):
    final_category = "other"
    final_severity = "low"
    labels = []
    scores = []

    # Text classification
    if text:
        text_result = classify_text(text)
        labels.append(text_result["label"])
        scores.append(text_result["score"])
        final_category = text_result["category"]
        final_severity = text_result["severity"]

    # Image classification
    if image_url:
        image_result = classify_image(image_url)
        labels.append(image_result.get("label", "Unknown"))
        scores.append(image_result.get("score", 0.0))

        # Merge category: prioritize non-other
        if image_result.get("category") != "other":
            final_category = image_result["category"]

        # Merge severity: pick higher severity
        severity_priority = {"low": 1, "medium": 2, "high": 3}
        if severity_priority.get(image_result.get("severity", "low"), 1) > severity_priority.get(final_severity, 1):
            final_severity = image_result["severity"]

    return {
        "severity": final_severity,
        "category": final_category,
        "labels": labels,
        "scores": scores
    }

# -------------------------------
# Example usage
# -------------------------------
if __name__ == "__main__":
    text_example = "Streetlight not working in my area."
    image_example = "https://example.com/image_of_pothole.jpg"  # replace with a real image URL

    combined_result = classify_issue(text=text_example, image_url=image_example)
    print(combined_result)
