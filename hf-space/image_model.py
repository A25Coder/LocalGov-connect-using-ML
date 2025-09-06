import requests
from io import BytesIO
from PIL import Image
from transformers import pipeline

# Load the Hugging Face model
classifier = pipeline("image-classification", model="microsoft/resnet-50")

def classify_image(image_url: str):
    try:
        # Fetch image from URL
        response = requests.get(image_url)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content)).convert("RGB")

        results = classifier(img)

        if not results:
            return {"severity": "LOW", "label": "Unknown", "score": 0.0}

        top_result = results[0]

        # Example severity mapping
        if "damage" in top_result["label"].lower() or "hole" in top_result["label"].lower():
            severity = "HIGH"
        else:
            severity = "LOW"

        return {
            "severity": severity,
            "label": top_result["label"],
            "score": float(top_result["score"]),
        }

    except Exception as e:
        return {"error": str(e)}
