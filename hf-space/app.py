from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from text_model import classify_text
from image_model import classify_image

app = FastAPI()

# Enable CORS so frontend (localhost:5173) can call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schemas
class TextRequest(BaseModel):
    text: str

class ImageRequest(BaseModel):
    image_url: str

# ---------- Routes ----------
@app.post("/predict-text")
def predict_text(request: TextRequest):
    result = classify_text(request.text)
    return {"result": result}

@app.post("/predict-image")
def predict_image(request: ImageRequest):
    result = classify_image(request.image_url)
    return {"result": result}

@app.get("/")
def read_root():
    return {"message": "API is running!"}
