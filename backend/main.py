from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

import joblib
import numpy as np
import pandas as pd
import parselmouth
import tempfile
import os
import io
from pydantic import BaseModel

from movement_utils import extract_patient_features

app = FastAPI()

# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# LOAD MODELS
# =========================================================

# Voice Model
voice_model = joblib.load("parkinson_model.pkl")

# Movement Models
movement_models = {
    "sitting": joblib.load("patient_model_sitting.pkl"),
    "standing": joblib.load("patient_model_standing.pkl"),
    "walking": joblib.load("patient_model_walking.pkl")
}

# =========================================================
# HOME ROUTE
# =========================================================

@app.get("/")
def home():

    return {
        "message": "NeuroScope-AI Backend Running Successfully"
    }

# =========================================================
# VOICE FEATURE EXTRACTION
# =========================================================

def extract_voice_features(audio_file):

    sound = parselmouth.Sound(audio_file)

    # Pitch
    pitch = sound.to_pitch()

    pitch_values = pitch.selected_array['frequency']

    pitch_values = pitch_values[pitch_values != 0]

    mean_pitch = np.mean(pitch_values)

    # HNR
    harmonicity = sound.to_harmonicity()

    hnr_values = harmonicity.values[
        harmonicity.values != -200
    ]

    if len(hnr_values) == 0:
        hnr = 0
    else:
        hnr = np.mean(hnr_values)

    # Jitter
    point_process = parselmouth.praat.call(
        sound,
        "To PointProcess (periodic, cc)",
        75,
        500
    )

    jitter = parselmouth.praat.call(
        point_process,
        "Get jitter (local)",
        0,
        0,
        0.0001,
        0.02,
        1.3
    )

    # Shimmer
    shimmer = parselmouth.praat.call(
        [sound, point_process],
        "Get shimmer (local)",
        0,
        0,
        0.0001,
        0.02,
        1.3,
        1.6
    )

    features = np.array([
        mean_pitch,
        hnr,
        jitter,
        shimmer
    ])

    return features

# =========================================================
# VOICE PREDICTION API
# =========================================================

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    temp_path = None

    try:

        # Save uploaded audio
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".wav"
        ) as temp:

            content = await file.read()

            temp.write(content)

            temp_path = temp.name

        # Feature Extraction
        features = extract_voice_features(temp_path)

        # Reshape for model
        features = features.reshape(1, -1)

        # Prediction
        prediction = voice_model.predict(features)

        # Probability
        probability = voice_model.predict_proba(features)[0][1] * 100

        if prediction[0] == 1:
            result = "Parkinson Detected"
        else:
            result = "Healthy Voice"

        return {
            "success": True,
            "prediction": result,
            "confidence": round(probability, 2)
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }

    finally:

        # Delete temp file safely
        if temp_path and os.path.exists(temp_path):

            try:
                os.remove(temp_path)

            except:
                pass

# =========================================================
# MOVEMENT PREDICTION API
# =========================================================

@app.post("/movement_predict")
async def movement_predict(
    activity_mode: str = Form(...),
    accel_file: UploadFile = File(...),
    gyro_file: UploadFile = File(...)
):

    try:

        # =================================================
        # READ CSV FILES
        # =================================================

        accel_data = pd.read_csv(
            io.BytesIO(await accel_file.read())
        )

        gyro_data = pd.read_csv(
            io.BytesIO(await gyro_file.read())
        )

        # =================================================
        # VALIDATE EMPTY FILES
        # =================================================

        if accel_data.empty:

            return {
                "success": False,
                "error": "Accelerometer CSV is empty"
            }

        if gyro_data.empty:

            return {
                "success": False,
                "error": "Gyroscope CSV is empty"
            }

        # =================================================
        # CONTEXT CODE
        # =================================================

        if activity_mode.lower() == "sitting":
            context_code = 0

        elif activity_mode.lower() == "standing":
            context_code = 1

        elif activity_mode.lower() == "walking":
            context_code = 2

        else:

            return {
                "success": False,
                "error": "Invalid activity mode"
            }

        # =================================================
        # FEATURE EXTRACTION
        # =================================================

        features = extract_patient_features(
            accel_data,
            gyro_data,
            context_code
        )

        # =================================================
        # CHECK FEATURES
        # =================================================

        if len(features) == 0:

            return {
                "success": False,
                "error": "Insufficient movement data"
            }

        X_live = features.values

        # =================================================
        # LOAD MODEL
        # =================================================

        model = movement_models[
            activity_mode.lower()
        ]

        # =================================================
        # PREDICT
        # =================================================

        probabilities = model.predict_proba(
            X_live
        )[:, 1]

        risk_score = np.mean(
            probabilities
        ) * 100

        # =================================================
        # DYNAMIC THRESHOLD
        # =================================================

        if activity_mode.lower() == "walking":
            threshold = 40

        else:
            threshold = 50

        # =================================================
        # FINAL RESULT
        # =================================================

        if risk_score >= threshold:

            result = "Parkinson Detected"

        else:

            result = "Healthy Movement"

        # =================================================
        # RETURN RESPONSE
        # =================================================

        return {
            "success": True,
            "activity": activity_mode,
            "risk_score": round(float(risk_score), 2),
            "prediction": result
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }