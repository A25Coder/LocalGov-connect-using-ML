import os
from flask import Flask, request, jsonify
from google.cloud import vision

# --- Setup ---
# Initialize the Flask app
app = Flask(__name__)

# Set the path to your Google Cloud credentials file here
# You need to download this file from Google Cloud
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'path_to_your_credentials.json'

# Initialize the Google Vision client
client = vision.ImageAnnotatorClient()


# --- Main Function ---
@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    # 1. Receive the photo sent from the frontend
    if 'photo' not in request.files:
        return jsonify({'error': 'No photo part in the request'}), 400
    
    file = request.files['photo']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Read the content of the photo
    content = file.read()
    image = vision.Image(content=content)

    # 2. Detect people in the photo (Privacy Check)
    response_faces = client.face_detection(image=image)
    if response_faces.face_annotations:
        print("Face found! Rejecting the photo.")
        return jsonify({'error': 'Photo contains people. Please upload a photo without faces for privacy.'}), 400

    # 3. If no person is found, identify the photo's category
    print("No face found. Now identifying the category.")
    response_labels = client.label_detection(image=image)
    labels = response_labels.label_annotations

    detected_category = "Other" # Default category

    # Check the labels provided by the AI
    for label in labels:
        print(f"Label: {label.description}, Score: {label.score:.2f}")
        
        # You can write your own logic here
        if label.description.lower() in ['pothole', 'road', 'asphalt']:
            detected_category = "Potholes / Road Damage"
            break
        elif label.description.lower() in ['garbage', 'waste', 'trash', 'dump']:
            detected_category = "Waste Management"
            break
        elif label.description.lower() in ['street light', 'lamp post']:
            detected_category = "Streetlight Outage"
            break
        elif label.description.lower() in ['water', 'leak', 'pipe']:
            detected_category = "Water Leakage"
            break

    print(f"Detected Category: {detected_category}")
    
    # 4. Send the detected category back to the frontend
    return jsonify({'detected_category': detected_category})

# --- Run the Server ---
if __name__ == '__main__':
    app.run(debug=True)