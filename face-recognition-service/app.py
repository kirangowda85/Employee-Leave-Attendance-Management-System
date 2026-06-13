import os
import pickle
import numpy as np
import face_recognition
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

KNOWN_FACES_DIR = "known_faces"
ENCODINGS_FILE = "encodings.pkl"
SPRING_BOOT_URL = "http://localhost:8080/api/attendance/events"

os.makedirs(KNOWN_FACES_DIR, exist_ok=True)

# Load encodings from file if it exists
def load_encodings():
    if os.path.exists(ENCODINGS_FILE):
        with open(ENCODINGS_FILE, "rb") as f:
            return pickle.load(f)
    return {}

def save_encodings(encodings):
    with open(ENCODINGS_FILE, "wb") as f:
        pickle.dump(encodings, f)

known_encodings_dict = load_encodings()

@app.route('/register-face', methods=['POST'])
def register_face():
    if 'image' not in request.files or 'employeeId' not in request.form:
        return jsonify({"error": "Missing image or employeeId"}), 400
    
    employee_id = request.form['employeeId']
    file = request.files['image']
    
    # Save the image
    image_path = os.path.join(KNOWN_FACES_DIR, f"{employee_id}.jpg")
    file.save(image_path)
    
    # Load the image and calculate encoding
    image = face_recognition.load_image_file(image_path)
    encodings = face_recognition.face_encodings(image)
    
    if len(encodings) > 0:
        known_encodings_dict[employee_id] = encodings[0]
        save_encodings(known_encodings_dict)
        return jsonify({"message": f"Face registered successfully for employee {employee_id}"}), 200
    else:
        # Clean up image if no face found
        os.remove(image_path)
        return jsonify({"error": "No face found in the image"}), 400

@app.route('/recognize-face', methods=['POST'])
def recognize_face():
    if 'image' not in request.files or 'eventType' not in request.form:
        return jsonify({"error": "Missing image or eventType"}), 400
    
    event_type = request.form['eventType']
    file = request.files['image']
    
    # Save temp image for processing
    temp_path = "temp.jpg"
    file.save(temp_path)
    
    try:
        # Load the image and calculate encodings
        image = face_recognition.load_image_file(temp_path)
        encodings = face_recognition.face_encodings(image)
        
        if len(encodings) == 0:
            return jsonify({"error": "No face found in the image"}), 400
            
        current_encoding = encodings[0]
        
        # Compare with known encodings
        best_match = None
        best_distance = 0.6  # lower distance means closer match (0.6 is a common threshold)
        
        for emp_id, known_encoding in known_encodings_dict.items():
            matches = face_recognition.compare_faces([known_encoding], current_encoding, tolerance=0.5)
            if matches[0]:
                face_distances = face_recognition.face_distance([known_encoding], current_encoding)
                if face_distances[0] < best_distance:
                    best_distance = face_distances[0]
                    best_match = emp_id
                    
        if best_match:
            # Face recognized! Notify Spring Boot
            payload = {
                "employeeId": int(best_match),
                "eventType": event_type
            }
            
            # Since SecurityConfig allows public access to /api/attendance/events, we don't need a token here.
            # If a token was required, we would pass it in the headers.
            response = requests.post(SPRING_BOOT_URL, json=payload)
            
            if response.status_code in [200, 201]:
                return jsonify({
                    "message": "Attendance marked successfully",
                    "employeeId": best_match,
                    "eventType": event_type
                }), 200
            else:
                return jsonify({
                    "error": f"Failed to mark attendance in Spring Boot system. Status: {response.status_code}"
                }), 500
        else:
            return jsonify({"error": "Face not recognized"}), 401
            
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
