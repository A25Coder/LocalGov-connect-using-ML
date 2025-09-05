# LocalGov Connect — Severity Checker (Text + Image)

This Hugging Face Space provides a simple severity-check API using pretrained Hugging Face models.
It supports text + image inputs, returns per-modality results plus an overall severity (Low/Medium/High).

## Files
- `app.py`             - Gradio UI + FastAPI `/predict` endpoint.
- `backend/text_model.py`
- `backend/image_model.py`
- `backend/utils.py`
- `requirements.txt`

## How to call (from your frontend)
POST `multipart/form-data` to:
`https://<YOUR-SPACE-NAME>.hf.space/predict`

Fields:
- `text` (string) — required (pass empty string `""` if not available)
- `file` (file) — optional image file

**Example fetch (JS):**
```js
const fd = new FormData();
fd.append("text", "Large pothole causing traffic jam on Main St.");
fd.append("file", imageFile); // optional

const res = await fetch("https://<YOUR-SPACE-NAME>.hf.space/predict", {
  method: "POST",
  body: fd
});
const data = await res.json();
console.log(data);
