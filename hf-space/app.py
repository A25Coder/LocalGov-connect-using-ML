from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from severity_model import classify_text, classify_image, classify_issue  # import all from single file

app = FastAPI()

# Enable CORS so frontend (localhost:5173) can call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Request schemas ----------
class TextRequest(BaseModel):
    text: str

class ImageRequest(BaseModel):
    image_url: str

class IssueRequest(BaseModel):
    text: str = None
    image_url: str = None

# ---------- Routes ----------
@app.post("/predict-text")
def predict_text_endpoint(request: TextRequest):
    """
    Predict severity and category based on text only
    """
    result = classify_text(request.text)
    return {"result": result}

@app.post("/predict-image")
def predict_image_endpoint(request: ImageRequest):
    """
    Predict severity and category based on image only
    """
    result = classify_image(request.image_url)
    return {"result": result}

@app.post("/predict-issue")
def predict_issue_endpoint(request: IssueRequest):
    """
    Predict severity and category based on text and/or image
    """
    if not request.text and not request.image_url:
        return {"error": "Provide at least text or image_url"}

    result = classify_issue(text=request.text, image_url=request.image_url)
    return {"result": result}

@app.get("/")
def read_root():
    return {"message": "API is running!"}