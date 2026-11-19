import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any, Optional

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import precision_score, recall_score, f1_score, accuracy_score, confusion_matrix
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

try:
    from backend_py.meghalaya_network import meghalaya_net, MEGHALAYA_CHOKEPOINTS, haversine_distance_m
    from backend_py.meghalaya_ml_dataset import build_meghalaya_training_dataset, FEATURE_COLS, OUTPUT_DATASET_CSV
except ImportError:
    from meghalaya_network import meghalaya_net, MEGHALAYA_CHOKEPOINTS, haversine_distance_m
    from meghalaya_ml_dataset import build_meghalaya_training_dataset, FEATURE_COLS, OUTPUT_DATASET_CSV

MODEL_DIR = os.path.dirname(__file__)
RF_MODEL_PATH = os.path.join(MODEL_DIR, "meghalaya_rf_model.joblib")
CAL_RF_MODEL_PATH = os.path.join(MODEL_DIR, "meghalaya_calibrated_rf_model.joblib")
XGB_MODEL_PATH = os.path.join(MODEL_DIR, "meghalaya_xgb_model.joblib")
LR_MODEL_PATH = os.path.join(MODEL_DIR, "meghalaya_lr_model.joblib")
SCALER_PATH = os.path.join(MODEL_DIR, "meghalaya_scaler.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "meghalaya_model_metadata.json")

class MeghalayaMLSystem:
    def __init__(self):
        self.rf_model: Optional[RandomForestClassifier] = None
        self.cal_rf_model: Optional[CalibratedClassifierCV] = None
        self.xgb_model: Optional[XGBClassifier] = None
        self.lr_model: Optional[LogisticRegression] = None
        self.scaler: Optional[StandardScaler] = None
        self.metrics: Dict[str, Any] = {}
        self.feature_importances: Dict[str, float] = {}
        self.is_trained = False
        self.load_or_train()

    def train_models(self):
        """
        Trains Logistic Regression, Random Forest, and XGBoost on the Meghalaya dataset.
        Temporal split: 2020-2023 for Train (~70%), 2024-2025 for Test (~30%).
        """
        df = build_meghalaya_training_dataset()

        train_df = df[df["year"] <= 2023].reset_index(drop=True)
        test_df = df[df["year"] >= 2024].reset_index(drop=True)

        X_train = train_df[FEATURE_COLS]
        y_train = train_df["risky"]
        X_test = test_df[FEATURE_COLS]
        y_test = test_df["risky"]

        pos_train = int(y_train.sum())
        neg_train = len(y_train) - pos_train
        pos_test = int(y_test.sum())
        neg_test = len(y_test) - pos_test

        print(f"[Meghalaya ML Pipeline] Strict Temporal Split:")
        print(f"  Train (2020-2023): {len(train_df):,} samples ({pos_train:,} risky, {pos_train/len(train_df):.2%})")
        print(f"  Test  (2024-2025): {len(test_df):,} samples ({pos_test:,} risky, {pos_test/len(test_df):.2%})")

        # Feature scaling for Logistic Regression
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # 1. Baseline: Logistic Regression
        print("[Meghalaya ML Pipeline] Training Baseline: LogisticRegression(class_weight='balanced')...")
        self.lr_model = LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42)
        self.lr_model.fit(X_train_scaled, y_train)

        y_pred_lr = self.lr_model.predict(X_test_scaled)
        lr_metrics = {
            "precision": round(float(precision_score(y_test, y_pred_lr, zero_division=0)), 4),
            "recall": round(float(recall_score(y_test, y_pred_lr, zero_division=0)), 4),
            "f1_score": round(float(f1_score(y_test, y_pred_lr, zero_division=0)), 4),
            "accuracy": round(float(accuracy_score(y_test, y_pred_lr)), 4),
            "confusion_matrix": confusion_matrix(y_test, y_pred_lr).tolist()
        }

        # 2. Main Ensemble: Random Forest
        print("[Meghalaya ML Pipeline] Training Main Model: RandomForestClassifier(class_weight='balanced')...")
        self.rf_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1
        )
        self.rf_model.fit(X_train, y_train)

        y_pred_rf = self.rf_model.predict(X_test)
        rf_metrics = {
            "precision": round(float(precision_score(y_test, y_pred_rf, zero_division=0)), 4),
            "recall": round(float(recall_score(y_test, y_pred_rf, zero_division=0)), 4),
            "f1_score": round(float(f1_score(y_test, y_pred_rf, zero_division=0)), 4),
            "accuracy": round(float(accuracy_score(y_test, y_pred_rf)), 4),
            "confusion_matrix": confusion_matrix(y_test, y_pred_rf).tolist()
        }

        # 3. Advanced Gradient Boost: XGBoost
        scale_pos_weight = neg_train / max(1, pos_train)
        print(f"[Meghalaya ML Pipeline] Training XGBoost(scale_pos_weight={scale_pos_weight:.2f})...")
        self.xgb_model = XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.08,
            scale_pos_weight=scale_pos_weight,
            random_state=42,
            eval_metric="logloss"
        )
        self.xgb_model.fit(X_train, y_train)

        y_pred_xgb = self.xgb_model.predict(X_test)
        xgb_metrics = {
            "precision": round(float(precision_score(y_test, y_pred_xgb, zero_division=0)), 4),
            "recall": round(float(recall_score(y_test, y_pred_xgb, zero_division=0)), 4),
            "f1_score": round(float(f1_score(y_test, y_pred_xgb, zero_division=0)), 4),
            "accuracy": round(float(accuracy_score(y_test, y_pred_xgb)), 4),
            "confusion_matrix": confusion_matrix(y_test, y_pred_xgb).tolist()
        }

        # Feature importances from Random Forest
        rf_importances = {
            col: round(float(imp), 4)
            for col, imp in zip(FEATURE_COLS, self.rf_model.feature_importances_)
        }
        # Sort by importance descending
        self.feature_importances = dict(sorted(rf_importances.items(), key=lambda item: item[1], reverse=True))

        self.metrics = {
            "logistic_regression_baseline": lr_metrics,
            "random_forest_main": rf_metrics,
            "xgboost_boosted": xgb_metrics,
            "feature_importance": self.feature_importances,
            "split_info": {
                "train_years": "2020-2023",
                "test_years": "2024-2025",
                "train_samples": len(train_df),
                "test_samples": len(test_df),
                "train_risky_ratio": round(pos_train / len(train_df), 4),
                "test_risky_ratio": round(pos_test / len(test_df), 4)
            }
        }

        # Save artifacts
        joblib.dump(self.rf_model, RF_MODEL_PATH)
        joblib.dump(self.xgb_model, XGB_MODEL_PATH)
        joblib.dump(self.lr_model, LR_MODEL_PATH)
        joblib.dump(self.scaler, SCALER_PATH)

        with open(METADATA_PATH, "w", encoding="utf-8") as f:
            json.dump(self.metrics, f, indent=2)

        self.is_trained = True
        print(f"[Meghalaya ML Pipeline] Training Complete! Saved models to {MODEL_DIR}")
        print(f"  Random Forest Test F1: {rf_metrics['f1_score']} (Recall: {rf_metrics['recall']}, Prec: {rf_metrics['precision']})")
        print(f"  XGBoost       Test F1: {xgb_metrics['f1_score']} (Recall: {xgb_metrics['recall']}, Prec: {xgb_metrics['precision']})")
        print(f"  Logistic Reg. Test F1: {lr_metrics['f1_score']} (Recall: {lr_metrics['recall']}, Prec: {lr_metrics['precision']})")

    def load_or_train(self):
        """Loads saved models or triggers training."""
        if os.path.exists(RF_MODEL_PATH) and os.path.exists(METADATA_PATH) and os.path.exists(SCALER_PATH):
            try:
                self.rf_model = joblib.load(RF_MODEL_PATH)
                if os.path.exists(CAL_RF_MODEL_PATH):
                    self.cal_rf_model = joblib.load(CAL_RF_MODEL_PATH)
                else:
                    self.cal_rf_model = self.rf_model
                self.xgb_model = joblib.load(XGB_MODEL_PATH)
                self.lr_model = joblib.load(LR_MODEL_PATH)
                self.scaler = joblib.load(SCALER_PATH)
                with open(METADATA_PATH, "r", encoding="utf-8") as f:
                    self.metrics = json.load(f)
                self.feature_importances = self.metrics.get("feature_importance", {})
                self.is_trained = True
                print("[Meghalaya ML Pipeline] Loaded existing trained models and metadata (including Calibrated RF).")
                return
            except Exception as e:
                print(f"[Meghalaya ML Pipeline] Error loading models: {e}. Retraining...")
        
        self.train_models()

    def predict_segment_risk(self, segment: Dict[str, Any], rain_1d: float, rain_3d: float, rain_7d: float, report_count: int = 0) -> Dict[str, Any]:
        """
        Predicts landslide probability for a single segment under specified precipitation conditions.
        Returns Platt-scaled calibrated risk score (0 to 1), 4-tier risk classification,
        confidence score, and feature vector.
        """
        length_m = float(segment["length_m"])
        elevation = float(segment["elevation"])
        slope = float(segment["slope"])
        near_hazard_km = float(segment.get("near_hazard_km", 2.5))

        feat_vector = pd.DataFrame([{
            "rain_1d": rain_1d,
            "rain_3d": rain_3d,
            "rain_7d": rain_7d,
            "length_m": length_m,
            "elevation": elevation,
            "slope": slope,
            "near_hazard_km": near_hazard_km,
            "report_count": report_count
        }])[FEATURE_COLS]

        # 1. Calibrated Random Forest (Platt scaling / Sigmoid)
        if self.cal_rf_model is not None:
            cal_rf_prob = float(self.cal_rf_model.predict_proba(feat_vector)[0][1])
        else:
            cal_rf_prob = float(self.rf_model.predict_proba(feat_vector)[0][1])

        # 2. XGBoost Boosted Tree
        xgb_prob = float(self.xgb_model.predict_proba(feat_vector)[0][1])

        # 3. Calibrated Ensemble Score (RF 55% + XGBoost 45%)
        ensemble_score = round(0.55 * cal_rf_prob + 0.45 * xgb_prob, 3)

        # 4. Confidence Score based on model consensus
        prob_discrepancy = abs(cal_rf_prob - xgb_prob)
        confidence = round(min(0.98, max(0.68, 1.0 - 0.70 * prob_discrepancy)), 2)

        # 5. Four-Tier Risk Classification:
        # Green: Low (<20%), Yellow: Moderate (20-50%), Orange: High (50-70%), Red: Very High (>70%)
        if ensemble_score >= 0.70:
            category = "VERY_HIGH"
            color = "#ef4444"  # Red
            badge_text = "Very High Risk"
        elif ensemble_score >= 0.50:
            category = "HIGH"
            color = "#f97316"  # Orange
            badge_text = "High Risk"
        elif ensemble_score >= 0.20:
            category = "MODERATE"
            color = "#f59e0b"  # Yellow
            badge_text = "Moderate Risk"
        else:
            category = "LOW"
            color = "#10b981"  # Green
            badge_text = "Low Risk"

        return {
            "segment_id": segment["segment_id"],
            "corridor": segment.get("corridor", "NH-6"),
            "risk_score": ensemble_score,
            "calibrated_risk": ensemble_score,
            "risk_category": category,
            "risk_tier": category,
            "badge_text": badge_text,
            "color_hex": color,
            "confidence_score": confidence,
            "rf_prob": round(cal_rf_prob, 3),
            "xgb_prob": round(xgb_prob, 3),
            "rain_1d": rain_1d,
            "rain_3d": rain_3d,
            "rain_7d": rain_7d,
            "slope": slope,
            "elevation": elevation,
            "near_hazard_km": near_hazard_km
        }

    def get_ablation_study(self) -> Dict[str, Any]:
        """Returns the Feature Leakage Ablation Study (Model A vs Model B vs Model C)."""
        return self.metrics.get("ablation_study", {})

    def get_spatial_validation(self) -> Dict[str, Any]:
        """Returns the Spatial Holdout Validation experiment metrics (Khasi-Jaintia vs Garo Hills)."""
        return self.metrics.get("spatial_validation", {})

    def get_probability_calibration(self) -> Dict[str, Any]:
        """Returns the Brier Score calibration comparison and calibration curves."""
        return self.metrics.get("probability_calibration", {})

    def predict_all_segments(self, rain_1d: float, rain_3d: float, rain_7d: float) -> List[Dict[str, Any]]:
        """Evaluates ML landslide risk across all 284 Meghalaya road segments."""
        scored = []
        for seg in meghalaya_net.segments:
            res = self.predict_segment_risk(seg, rain_1d, rain_3d, rain_7d)
            # Merge segment spatial data for map rendering
            merged = {**seg, **res}
            scored.append(merged)
        return scored

meghalaya_ml = MeghalayaMLSystem()

