# NeuroScope-AI: A Smart Real-Time Multimodal Diagnostic Engine

NeuroScope-AI is an AI-powered multimodal screening system designed to assist in the early assessment of Parkinsonian symptoms by analyzing multiple behavioral and physiological signals.

The system combines **voice analysis, facial movement analysis, and sensor-based movement analysis** to generate a unified Parkinsonian risk assessment.

> **Disclaimer:** NeuroScope-AI is an academic/research screening project and is not a replacement for professional medical diagnosis.

---

## 🚀 Key Features

* 🎤 **Voice Analysis**

  * Analyzes voice characteristics associated with Parkinsonian symptoms.
  * Extracts acoustic features such as pitch, jitter, shimmer, and Harmonic-to-Noise Ratio (HNR).
  * Uses a trained machine learning model for screening prediction.

* 🙂 **Facial Analysis**

  * Uses MediaPipe FaceMesh for real-time facial landmark detection.
  * Analyzes facial movement characteristics.
  * Contributes facial analysis results to the overall risk assessment.

* 🚶 **Movement Analysis**

  * Analyzes accelerometer and gyroscope sensor data.
  * Supports:

    * Walking
    * Sitting
    * Standing
  * Uses trained machine learning models for activity-specific analysis.

* 🧠 **Multimodal Risk Assessment**

  * Combines results from multiple modalities.
  * Generates a unified Parkinsonian risk assessment.
  * Categorizes the result into Low, Moderate, or High risk.

* 📊 **Interactive Dashboard**

  * Provides a user-friendly interface for performing different assessments.
  * Displays predictions, risk scores, and analysis results.

---

# 🧠 How NeuroScope-AI Works

The system follows a multimodal analysis pipeline:

```text
                  ┌──────────────────┐
                  │   NeuroScope-AI  │
                  └────────┬─────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
     Voice Analysis   Facial Analysis   Movement Analysis
          │                │                │
          ▼                ▼                ▼
   Acoustic Features  Facial Features  Sensor Features
          │                │                │
          └────────────────┼────────────────┘
                           │
                           ▼
                 Multimodal Risk Engine
                           │
                           ▼
                  Unified Risk Report
```

---

# 🎤 Voice Analysis

The voice analysis module processes recorded speech/audio to extract acoustic characteristics that can be associated with Parkinsonian symptoms.

### Features

* Pitch
* Jitter
* Shimmer
* Harmonic-to-Noise Ratio (HNR)

### Processing Pipeline

```text
Audio Input
     ↓
Audio Preprocessing
     ↓
Acoustic Feature Extraction
     ↓
Machine Learning Model
     ↓
Prediction + Confidence/Risk Score
```

The audio processing pipeline uses **Parselmouth/Praat** for extracting relevant acoustic features.

---

# 🙂 Facial Analysis

The facial analysis module uses computer vision to track facial landmarks and analyze facial movement characteristics.

### Technologies

* MediaPipe
* MediaPipe FaceMesh
* Facial landmark detection
* Real-time video processing

### Processing Pipeline

```text
Camera Input
     ↓
Face Detection
     ↓
Facial Landmark Extraction
     ↓
Facial Movement Analysis
     ↓
Risk Assessment
```

---

# 🚶 Movement Analysis

The movement module analyzes motion data obtained from accelerometer and gyroscope sensors.

The system supports three activity modes:

```text
Walking
Sitting
Standing
```

### Processing Pipeline

```text
Accelerometer + Gyroscope Data
              ↓
       Data Preprocessing
              ↓
       Feature Extraction
              ↓
     Activity-Specific Model
              ↓
       Prediction + Score
```

The movement analysis module uses trained machine learning classification models to analyze activity-specific sensor patterns.

---

# 🧠 Machine Learning

NeuroScope-AI uses machine learning models for analyzing the different modalities.

### Machine Learning Technologies

* Scikit-learn
* Random Forest
* Joblib
* NumPy
* Pandas

### Movement Models

Separate trained models can be used for:

```text
Sitting
Standing
Walking
```

The models process extracted sensor features and generate predictions used by the multimodal risk assessment system.

---

# 📊 Risk Assessment

The system converts analysis results into an overall risk category.

| Risk Score | Risk Level |
| ---------- | ---------- |
| < 45%      | Low        |
| 45% – 69%  | Moderate   |
| ≥ 70%      | High       |

The risk score is generated from the application's machine learning analysis and should be interpreted only as a **screening indicator**, not a medical diagnosis.

---

# 🏗️ System Architecture

```text
                         USER
                          │
                          ▼
                 ┌─────────────────┐
                 │    Frontend     │
                 │ HTML/CSS/JS     │
                 └────────┬────────┘
                          │
                     HTTP Requests
                          │
                          ▼
                 ┌─────────────────┐
                 │     FastAPI     │
                 │     Backend     │
                 └────────┬────────┘
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
     Voice Model     Facial Module    Movement Models
          │               │                │
          ▼               ▼                ▼
     Voice Risk      Facial Risk      Movement Risk
          │               │                │
          └───────────────┼────────────────┘
                          │
                          ▼
                Multimodal Risk Engine
                          │
                          ▼
                 Unified Risk Report
                          │
                          ▼
                     FRONTEND
```

---

# 🛠️ Technology Stack

## Frontend

* HTML5
* CSS3
* JavaScript
* Tailwind CSS
* Web APIs

## Backend

* Python
* FastAPI
* Uvicorn
* Python Multipart

## Machine Learning

* Scikit-learn
* Random Forest
* Joblib
* NumPy
* Pandas

## Audio Processing

* Parselmouth
* Praat

## Computer Vision

* MediaPipe
* MediaPipe FaceMesh

## Development Tools

* Visual Studio Code
* Git
* GitHub

---

# 📁 Project Structure

```text
NeuroScope-AI/
│
├── backend/
│   ├── main.py
│   ├── movement_utils.py
│   ├── parkinson_model.pkl
│   ├── patient_model_sitting.pkl
│   ├── patient_model_standing.pkl
│   ├── patient_model_walking.pkl
│   └── ...
│
├── frontend/
│   ├── index.html
│   ├── index_final_corrected.html
│   └── ...
│
├── .gitignore
├── README.md
└── ...
```

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/Prachidhekule/NeuroScope-AI-A-Smart-Real-Time-Multimodal-Diagnostic-Engine.git
```

Move into the project directory:

```bash
cd NeuroScope-AI-A-Smart-Real-Time-Multimodal-Diagnostic-Engine
```

---

# 🐍 Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install the required dependencies:

```bash
pip install fastapi uvicorn python-multipart joblib numpy pandas praat-parselmouth scikit-learn
```

If additional dependencies are required by the current implementation, install them using the project's dependency file.

---

# ▶️ Run the Backend

From the `backend` directory, run:

```bash
python -m uvicorn main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

FastAPI automatically provides interactive API documentation at:

```text
http://127.0.0.1:8000/docs
```

---

# 🌐 Run the Frontend

Open the `frontend` directory in Visual Studio Code.

Open:

```text
index_final_corrected.html
```

You can run the frontend using the **Live Server** extension in VS Code.

```text
Right Click
     ↓
Open with Live Server
```

The frontend communicates with the FastAPI backend through HTTP requests.

---

# 🔌 API Endpoints

## Voice Prediction

### Endpoint

```text
POST /predict
```

### Input

A WAV audio file containing the user's voice recording.

### Example Response

```json
{
    "success": true,
    "prediction": "Model Prediction",
    "confidence": 82.45
}
```

---

## Movement Prediction

### Endpoint

```text
POST /movement_predict
```

### Input

The endpoint accepts:

```text
activity_mode
accel_file
gyro_file
```

### Supported Activities

```text
sitting
standing
walking
```

### Example Response

```json
{
    "success": true,
    "activity": "walking",
    "risk_score": 82.45,
    "prediction": "Model Prediction"
}
```

The exact response fields may vary depending on the current backend implementation.

---

# 📊 Model Evaluation

Model performance should be evaluated using appropriate metrics such as:

* Accuracy
* Precision
* Recall
* F1-score
* Confusion Matrix

Evaluation results should be reported based on the actual experimental results obtained during model testing.

---

# 📂 Dataset

The project uses datasets relevant to the individual analysis modalities.

The preprocessing pipeline may include:

```text
Raw Dataset
     ↓
Data Cleaning
     ↓
Feature Extraction
     ↓
Feature Preprocessing
     ↓
Train / Test Split
     ↓
Model Training
     ↓
Model Evaluation
```

Dataset sources and detailed experimental results should be documented according to the datasets actually used in the implementation.

---

# 🔐 Security

Do not commit sensitive information to the repository.

Never upload:

```text
.env
API keys
Passwords
Secret tokens
Private credentials
```

Use `.gitignore` to prevent sensitive files and unnecessary generated files from being committed.

---

# ⚠️ Limitations

* NeuroScope-AI is intended for screening and research purposes.
* Machine learning predictions may be affected by dataset quality and diversity.
* Voice analysis can be influenced by recording quality, microphone characteristics, background noise, and speaking conditions.
* Facial analysis can be affected by lighting, camera quality, face orientation, and occlusion.
* Sensor-based movement analysis can vary depending on device placement and sensor quality.
* The system does not provide a clinical diagnosis.

---

# 🚀 Future Enhancements

Future versions of NeuroScope-AI can include:

* Real-time mobile sensor integration
* Larger and more diverse clinical datasets
* Improved multimodal fusion techniques
* Explainable AI for model predictions
* Real-time cloud deployment
* Mobile application integration
* Patient history and longitudinal analysis
* Doctor-facing monitoring dashboard
* Secure database integration
* Improved model generalization and validation

---

# 🔬 Project Highlights

NeuroScope-AI demonstrates the integration of multiple areas of computer science and artificial intelligence:

```text
Artificial Intelligence
        +
Machine Learning
        +
Computer Vision
        +
Audio Signal Processing
        +
Sensor Data Analysis
        +
FastAPI
        +
Web Development
```

The project demonstrates how heterogeneous data sources can be combined to build a unified AI-assisted screening system.

---

# 👩‍💻 Contributors

**NeuroScope-AI Team**

* Rutika Kolhapure
* Pranjal Yallurkar
* Prachi Dhekule
* Rakshita Handage

---

# ⚖️ Disclaimer

NeuroScope-AI is an academic and research-oriented AI screening project.

The predictions generated by this system are not intended to diagnose, treat, prevent, or cure Parkinson's disease or any other medical condition.

The system should not be used as a substitute for evaluation by a qualified healthcare professional.

---

# ⭐ Acknowledgements

This project was developed as an academic implementation exploring the application of artificial intelligence, machine learning, computer vision, audio processing, and sensor-based analysis for healthcare-oriented screening.

---

## 📌 Repository

**NeuroScope-AI: A Smart Real-Time Multimodal Diagnostic Engine**

Built with Python, FastAPI, Machine Learning, MediaPipe, Parselmouth, and modern web technologies.
