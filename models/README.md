---
language:
- en
license: apache-2.0
tags:
- academic-integrity
- anomaly-detection
- fraud-detection
- smart-india-hackathon
- aicte
- isolation-forest
- explainable-ai
metrics:
- roc_auc: 0.992
- accuracy: 0.984
- precision: 0.981
- recall: 0.965
model-index:
- name: vidyadwaar-academic-anomaly-detector-v2
  results:
  - task:
      type: tabular-anomaly-detection
      name: Regulatory Intake Anomaly & Ghost Enrolment Detection
    metrics:
    - type: roc_auc
      value: 0.992
      name: ROC-AUC Score
    - type: accuracy
      value: 0.984
      name: Overall Accuracy
---

# 🏛️ VidyaDwaar Academic Anomaly Detector (v2.0)

**Trained for AICTE National Regulatory & Academic Integrity Monitoring**  
*SIH 2026 Problem Statement: SIH26263*

## 📌 Model Overview
This model is a hybrid ensemble consisting of an **Isolation Forest** (for unsupervised high-dimensional outlier scoring) and a **Balanced Random Forest Classifier** (for supervised regulatory breach classification).

It monitors 5 statutory fraud patterns in student enrolment data without requiring plaintext PII:
1. **Intake Cap Breach**: Detects sudden spikes in regular student enrolment exceeding approved intake.
2. **Category-Mix Manipulation**: Identifies abnormal shifts in supernumerary and foreign quota pools.
3. **DOB Birthday Clustering**: Flags synthetic "ghost batches" created with identical or non-random birth dates.
4. **Sequential APAAR Runs**: Discovers algorithmically generated 12-digit APAAR runs.
5. **Deadline Dumping**: Catches bulk submissions uploaded within minutes of statutory cutoffs to evade validation.

## 🚀 Quick Inference (Python)

```python
import joblib
import numpy as np

# Load pipeline artifacts
model = joblib.load('models/vidyadwaar_anomaly_detector.joblib')
scaler = joblib.load('models/vidyadwaar_scaler.joblib')

# Feature vector: [fill_ratio, supernumerary_pct, max_dob_cluster, seq_apaar_run, minutes_before_deadline, hist_3yr_variance]
sample_batch = np.array([[1.15, 0.22, 18, 12, 4.5, 0.24]])
scaled = scaler.transform(sample_batch)

# Predict: 0 = Compliant, 1 = Flagged for AICTE Regulatory Review
prediction = model.predict(scaled)
confidence = model.predict_proba(scaled)[0][1]

print(f"Prediction: {'FLAGGED' if prediction[0] == 1 else 'COMPLIANT'}")
print(f"Anomaly Probability: {confidence * 100:.2f}%")
```

## 📊 Performance Benchmarks
- **ROC-AUC**: `0.992`
- **Precision**: `98.1%`
- **Recall**: `96.5%`
- **Inference Latency**: `1.8ms per batch`

