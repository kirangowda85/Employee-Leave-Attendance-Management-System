# Face Recognition Service

Flask-based microservice for employee face registration and attendance recognition.

## Prerequisites

- Python 3.10 or higher
- The service requires `dlib` and `face_recognition` libraries for face processing

## Installation

### Option 1: Using Conda (Recommended for Windows)

Conda provides precompiled `dlib` wheels, avoiding Windows C++ build tool requirements.

```bash
# Create a new conda environment
conda create -n face-py python=3.10 -y

# Activate the environment
conda activate face-py

# Install packages from conda-forge (has prebuilt dlib)
conda install -c conda-forge dlib face_recognition opencv -y

# Install remaining packages
pip install flask flask-cors requests numpy
```

Then run the app:
```bash
python app.py
```

### Option 2: Using Windows with Visual Studio Build Tools

If you don't have conda, install Visual Studio Build Tools:

1. Download [Build Tools for Visual Studio 2022](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
2. Install and select **"Desktop development with C++"** workload
3. After installation, install requirements:
```bash
pip install -r requirements.txt
```

Then run the app:
```bash
python app.py
```

### Option 3: Ubuntu/Linux (easiest)

```bash
sudo apt-get install python3-dev cmake libfaceapi-dev
pip install -r requirements.txt
python app.py
```

## Running the Service

### Full Features (with dlib installed)

```bash
python app.py
```

Service will run on `http://localhost:5000`

### Degraded Mode (without dlib)

The app will still start but face endpoints return 503 Service Unavailable. This is useful for development/testing backend without face processing:

```bash
python app.py
```

## API Endpoints

### 1. Register Employee Face

**POST** `/register-face`

- Requires: multipart form data with `image` file and `employeeId` field
- Response: `{"message": "Face registered successfully for employee {employeeId}"}`

### 2. Recognize and Mark Attendance

**POST** `/recognize-face`

- Requires: multipart form data with `image` file and `eventType` field (e.g., "CHECK_IN", "CHECK_OUT")
- Response: `{"message": "Attendance marked successfully", "employeeId": "...", "eventType": "..."}`
- On error: Returns appropriate error message with HTTP status code

## Architecture

- **Port**: 5000
- **Backend URL**: Connects to Spring Boot backend at `http://localhost:8080/api/attendance/events`
- **Image Processing**: Uses `face_recognition` library (powered by `dlib`)
- **CORS**: Enabled for all origins

## Files

- `app.py` - Main Flask application
- `requirements.txt` - Python dependencies
- `known_faces/` - Directory for storing registered employee face images
- `encodings.pkl` - Pickle file storing face encodings for quick comparison

## Troubleshooting

### "face_recognition module not available"

The service is running in **degraded mode** (Flask is running but face processing is unavailable).

**Solution**: Follow Option 1 (Conda) or Option 2 (Visual Studio Build Tools) above.

### dlib build fails on Windows

Windows requires C/C++ build tools to compile dlib from source.

**Solutions**:
1. **Use Conda** (Recommended) - See Option 1 above
2. **Install Visual Studio Build Tools** - See Option 2 above

### CMake not found

```
CMake Error: could not find cmake executable
```

**Solution**: Install CMake via Chocolatey or conda:
```bash
# Via Chocolatey
choco install cmake

# Via conda
conda install -c conda-forge cmake
```

## Development Notes

- Flask debug mode is enabled by default
- Use `FLASK_ENV=production` to disable debug mode for deployment
- Face encodings are cached in `encodings.pkl` for performance
