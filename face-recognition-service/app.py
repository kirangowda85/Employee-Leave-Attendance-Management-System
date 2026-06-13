import os
import pickle
import numpy as np
import cv2
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

# Use OpenCV's pre-trained Haar Cascade (no compilation needed)
FACE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
FACE_AVAILABLE = FACE_CASCADE.empty() == False

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
    if not FACE_AVAILABLE:
        return jsonify({"error": "Face detection not available"}), 503
    if 'image' not in request.files or 'employeeId' not in request.form:
        return jsonify({"error": "Missing image or employeeId"}), 400
    
    employee_id = request.form['employeeId']
    file = request.files['image']
    
    # Save the image
    image_path = os.path.join(KNOWN_FACES_DIR, f"{employee_id}.jpg")
    file.save(image_path)
    
    # Verify face was detected
    image = cv2.imread(image_path)
    if image is None:
        os.remove(image_path)
        return jsonify({"error": "Could not read image"}), 400
    
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = FACE_CASCADE.detectMultiScale(gray, 1.3, 5)
    
    if len(faces) == 0:
        os.remove(image_path)
        return jsonify({"error": "No face found in the image"}), 400
    
    # Store face encoding (path + feature hash)
    known_encodings_dict[employee_id] = image_path
    save_encodings(known_encodings_dict)
    
    return jsonify({"message": f"Face registered successfully for employee {employee_id}"}), 200

@app.route('/recognize-face', methods=['POST'])
def recognize_face():
    if not FACE_AVAILABLE:
        return jsonify({"error": "Face detection not available"}), 503
    if 'image' not in request.files or 'eventType' not in request.form:
        return jsonify({"error": "Missing image or eventType"}), 400
    
    event_type = request.form['eventType']
    file = request.files['image']
    
    # Save temp image
    temp_path = "temp.jpg"
    file.save(temp_path)
    
    try:
        current_image = cv2.imread(temp_path)
        if current_image is None:
            return jsonify({"error": "Could not read image"}), 400
        
        # Detect face using Haar Cascade
        gray = cv2.cvtColor(current_image, cv2.COLOR_BGR2GRAY)
        faces = FACE_CASCADE.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            return jsonify({"error": "No face found in the image"}), 400
        
        # Simple template matching using ORB features
        best_match = None
        best_score = 0.5  # minimum confidence threshold
        
        for emp_id, known_face_path in known_encodings_dict.items():
            if not os.path.exists(known_face_path):
                continue
                
            known_image = cv2.imread(known_face_path)
            if known_image is None:
                continue
            
            # ORB feature matching
            try:
                orb = cv2.ORB_create(nfeatures=500)
                kp1, des1 = orb.detectAndCompute(known_image, None)
                kp2, des2 = orb.detectAndCompute(current_image, None)
                
                if des1 is None or des2 is None or len(des1) < 10 or len(des2) < 10:
                    continue
                
                # Use BFMatcher to match features
                bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
                matches = bf.match(des1, des2)
                matches = sorted(matches, key=lambda x: x.distance)
                
                # Calculate match score (normalized)
                if len(matches) > 10:
                    avg_distance = np.mean([m.distance for m in matches[:20]])
                    match_score = max(0, 1.0 - (avg_distance / 100.0))
                    match_score = min(1, match_score)  # Clamp to 0-1
                    
                    if match_score > best_score:
                        best_score = match_score
                        best_match = emp_id
            except Exception as e:
                continue
        
        if best_match and best_score > 0.5:
            # Face recognized! Notify Spring Boot
            payload = {
                "employeeId": int(best_match),
                "eventType": event_type
            }
            
            response = requests.post('http://localhost:8080/api/attendance/events', json=payload)
            
            if response.status_code in [200, 201]:
                return jsonify({
                    "message": "Attendance marked successfully",
                    "employeeId": best_match,
                    "eventType": event_type,
                    "confidence": float(best_score)
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
