import requests

resp = requests.post(
    "http://127.0.0.1:8000/predict-text",
    json={"text": "There is a dangerous pothole on the road"}
)
print(resp.json())
