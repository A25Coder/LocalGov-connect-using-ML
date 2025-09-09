from transformers import pipeline

# Load Hugging Face DistilBERT sentiment model
classifier = pipeline(
    "text-classification",
    model="distilbert/distilbert-base-uncased-finetuned-sst-2-english"
)

def classify_text(text: str):
    result = classifier(text)[0]  
    label = result["label"]
    score = float(result["score"])

    # ---- Better Severity Mapping ----
    if label == "NEGATIVE":
        if score > 0.85:   # very strong negative
            severity = "HIGH"
        elif score > 0.6:  # somewhat negative
            severity = "MID"
        else:
            severity = "LOW"
    else:
        # Positive/neutral text = usually lower severity
        severity = "LOW" if score > 0.7 else "MID"

    return {"severity": severity, "label": label, "score": score}
