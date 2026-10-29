"""VidyaDwaar Pre-Trained Anomaly Detection Model Inference Script.
Loads pre-trained Random Forest + Isolation Forest weights and predicts
ghost batches, birthday clustering, quota surges, and deadline dumps.
"""
import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd

MODELS_DIR = Path(__file__).resolve().parent

def load_model():
    model_path = MODELS_DIR / "vidyadwaar_anomaly_detector.joblib"
    scaler_path = MODELS_DIR / "vidyadwaar_scaler.joblib"
    config_path = MODELS_DIR / "config.json"
    
    if not model_path.exists():
        raise FileNotFoundError(f"Model file missing: {model_path}")
        
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path) if scaler_path.exists() else None
    config = json.loads(config_path.read_text(encoding="utf-8")) if config_path.exists() else {}
    return model, scaler, config

def predict_batch_anomaly(
    fill_ratio: float = 0.95,
    supernumerary_pct: float = 0.04,
    max_dob_cluster: int = 2,
    seq_apaar_run: int = 1,
    minutes_before_deadline: float = 5000.0,
    hist_3yr_variance: float = 0.05
):
    """Predicts anomaly probability and regulatory audit flag for an admission batch.
    
    Features:
      - fill_ratio: Ratio of enrolled regular students to sanctioned intake (e.g. 0.95 = 95%)
      - supernumerary_pct: Percentage of supernumerary seats (OCI/NRI/FN/TFWS) (e.g. 0.04 = 4%)
      - max_dob_cluster: Maximum candidates sharing the exact same birthdate
      - seq_apaar_run: Longest run of consecutively generated APAAR IDs
      - minutes_before_deadline: Minutes elapsed between batch upload and AICTE reporting deadline
      - hist_3yr_variance: Deviation in enrollment numbers compared to 3-year historical average
    """
    model, scaler, config = load_model()
    
    cols = [
        "fill_ratio",
        "supernumerary_pct",
        "max_dob_cluster",
        "seq_apaar_run",
        "minutes_before_deadline",
        "hist_3yr_variance"
    ]
    df = pd.DataFrame([[fill_ratio, supernumerary_pct, max_dob_cluster, seq_apaar_run, minutes_before_deadline, hist_3yr_variance]], columns=cols)
    
    if scaler is not None:
        scaled = scaler.transform(df)
    else:
        scaled = df.values
        
    pred = int(model.predict(scaled)[0])
    is_anomaly = (pred == 1)
    
    if hasattr(model, "predict_proba"):
        prob = float(model.predict_proba(scaled)[0][1])
    else:
        prob = 0.95 if is_anomaly else 0.05
        
    return {
        "is_anomaly": is_anomaly,
        "risk_probability": round(prob, 4),
        "status": "FLAGGED_FOR_AICTE_AUDIT" if is_anomaly else "NORMAL_ADMISSION_BATCH",
        "risk_level": "CRITICAL" if prob > 0.8 else ("ELEVATED" if prob > 0.5 else "LOW"),
        "confidence_pct": round((prob if is_anomaly else (1.0 - prob)) * 100, 2),
        "inputs": {
            "fill_ratio": fill_ratio,
            "supernumerary_pct": supernumerary_pct,
            "max_dob_cluster": max_dob_cluster,
            "seq_apaar_run": seq_apaar_run,
            "minutes_before_deadline": minutes_before_deadline,
            "hist_3yr_variance": hist_3yr_variance
        }
    }

if __name__ == "__main__":
    print("==================================================================")
    print("   VidyaDwaar AICTE Anomaly Detection Model - Live Inference Test  ")
    print("==================================================================")
    
    # 1. Normal genuine admission batch
    res_normal = predict_batch_anomaly(
        fill_ratio=0.92,
        supernumerary_pct=0.03,
        max_dob_cluster=2,
        seq_apaar_run=1,
        minutes_before_deadline=14400.0,
        hist_3yr_variance=0.04
    )
    print("\n[TEST 1: Normal Admission Batch]")
    print(json.dumps(res_normal, indent=2))
    
    # 2. Ghost batch / Quota surge anomaly
    res_ghost = predict_batch_anomaly(
        fill_ratio=1.45,
        supernumerary_pct=0.42,
        max_dob_cluster=48,
        seq_apaar_run=36,
        minutes_before_deadline=12.0,
        hist_3yr_variance=0.88
    )
    print("\n[TEST 2: Ghost Batch / Quota Breach Anomaly]")
    print(json.dumps(res_ghost, indent=2))
