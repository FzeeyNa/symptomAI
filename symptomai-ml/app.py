from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
from typing import List, Dict

app = FastAPI(title="SymptomAI ML API", description="API untuk prediksi penyakit menggunakan Machine Learning")

# Load Model
try:
    data = joblib.load('model_symptomai.pkl')
    model = data['model']
    features = data['features']
except FileNotFoundError:
    model = None
    features = []
    print("Warning: model_symptomai.pkl belum dibuat. Lakukan training terlebih dahulu.")
except Exception as e:
    model = None
    features = []
    print(f"Error loading model: {e}")

class SymptomRequest(BaseModel):
    # Dictionary dari string (nama gejala) ke boolean (true jika dialami)
    symptoms: Dict[str, bool]

@app.get("/")
def read_root():
    return {"message": "Selamat datang di SymptomAI ML API. Gunakan endpoint /predict untuk prediksi."}

@app.get("/symptoms")
def get_all_symptoms():
    """Mengembalikan daftar semua gejala yang dikenali oleh model."""
    if not features:
        raise HTTPException(status_code=500, detail="Model belum dilatih.")
    return {"symptoms": features}

@app.post("/predict")
def predict_disease(request: SymptomRequest):
    if not model:
        raise HTTPException(status_code=500, detail="Model belum dilatih. Harap jalankan train.py.")
    
    # Persiapkan input array sesuai dengan urutan fitur saat training
    input_data = []
    for feature in features:
        # Jika gejala ada di request dan true, nilainya 1. Jika tidak, 0.x
        is_present = request.symptoms.get(feature, False)
        input_data.append(1 if is_present else 0)
    
    # Lakukan prediksi
    prediction = model.predict([input_data])
    
    # Dapatkan probabilitas (opsional, untuk melihat seberapa yakin modelnya)
    probabilities = model.predict_proba([input_data])[0]
    confidence = max(probabilities) * 100
    
    return {
        "prediction": prediction[0],
        "confidence": f"{confidence:.2f}%"
    }
