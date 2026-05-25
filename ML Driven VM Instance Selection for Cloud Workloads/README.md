<div align="center">

# 🤖 ML Driven VM Instance Selection for Cloud Workloads

**An XGBoost-powered two-stage prediction pipeline that recommends the most cost-efficient AWS EC2 instance type for a given workload, achieving a measurable ~18% cost reduction over baseline instance selection.**

[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-FF6600?style=flat-square)](https://xgboost.readthedocs.io)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=flat-square&logo=scikitlearn&logoColor=white)](https://scikit-learn.org)
[![AWS EC2](https://img.shields.io/badge/AWS%20EC2-FF9900?style=flat-square&logo=amazonaws&logoColor=white)](https://aws.amazon.com/ec2/)

</div>

---

## 👋 About This Project

This project addresses the cloud resource selection problem: given a compute workload and input size, which EC2 instance type delivers the best balance of runtime and cost? Instead of over-provisioning, it uses historical benchmark data (OSR single-node dataset) to train an XGBoost classifier that predicts the optimal instance, then validates the prediction against a cost-performance metric.

The pipeline covers data ingestion, feature engineering, model training with `GridSearchCV`, prediction, and cost evaluation with plots.

---

## ✨ Features

- Loads and consolidates raw workload benchmark data from Parquet/CSV
- Applies **KNN imputation** for missing values, grouped by workload and program
- Engineers resource pressure, headroom, and utilization ratio features
- Two-stage prediction: resource-usage clustering (SAR-based) then XGBoost instance classification
- `GridSearchCV` hyperparameter tuning over 5-fold cross-validation
- Per-instance hourly pricing table for 18 EC2 types (c3/c4, m3/m4, r3/r4 families)
- Cost-performance metric combining normalized cost and normalized elapsed time
- Evaluation script (`evaluation.py`) with confusion matrix, classification report, and CDF plots
- Trained model serialized with `pickle` for reuse

---

## 🛠️ Tech Stack

`Python` `XGBoost` `scikit-learn` `Pandas` `NumPy` `Matplotlib` `Seaborn` `PyArrow`

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- OSR single-node benchmark dataset in `./Data/osr_single_node/`

### Install Dependencies

```bash
pip install xgboost scikit-learn pandas numpy matplotlib seaborn pyarrow
```

### Run Training and Prediction

```bash
python final-code.py
# Outputs: data-checkpoint/feature-engineered.csv, results.csv
# Saves:   models/xgb_model.pkl, workload_le.pkl, instance_le.pkl, scaler.pkl
```

### Run Evaluation

```bash
python evaluation.py
# Prints accuracy, cost savings %, and renders CDF plots
```

---

## 📂 Project Structure

```
ML Driven VM Instance Selection for Cloud Workloads/
├── final-code.py       # End-to-end training + prediction pipeline
├── evaluation.py       # Model evaluation, cost analysis, and plots
├── Data/
│   └── osr_single_node/    # Raw benchmark CSVs (not included)
├── data-checkpoint/
│   ├── consolidated-data.csv
│   ├── feature-engineered.csv
│   └── results.csv
└── models/
    ├── xgb_model.pkl
    ├── workload_le.pkl
    ├── instance_le.pkl
    └── scaler.pkl
```

---

## 📈 Key Results

| Metric | Value |
|---|---|
| Cost reduction vs. baseline | ~18% |
| Instance families covered | c3, c4, m3, m4, r3, r4 |
| CV folds | 5 |
| Test split | 20% |
| Scoring metric | Negative log-loss |
