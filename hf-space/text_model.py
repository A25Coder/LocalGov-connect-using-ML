# text_model.py
from transformers import pipeline

# Load the text classification pipeline
classifier = pipeline(
    "text-classification",
    model="distilbert/distilbert-base-uncased-finetuned-sst-2-english"
)

# Map sentiment → severity
def classify_text(text: str):
    result = classifier(text)[0]  # Take first result
    label = result["label"]
    score = result["score"]

    # Custom mapping
    if label == "NEGATIVE":
        severity = "HIGH"
    else:
        severity = "LOW"

    return {"severity": severity, "label": label, "score": score}
