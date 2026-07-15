"""Builds tiny synthetic artifact bundles matching docs/ARTIFACT_CONTRACTS.md.

These stand in for the real Colab-exported artifacts (which are gitignored and
not present in this repo) so sub-phase 3.2 inference wiring can be tested
end-to-end without the actual thesis model files.
"""

import json
from pathlib import Path

DISEASE_CLASS_NAMES = {"0": "Diseased", "1": "Healthy"}

ADVISOR_NUTRIENT_COLUMNS = [
    "ph",
    "organic_carbon",
    "nitrogen",
    "phosphorus",
    "potassium",
    "sulphur",
    "zinc",
    "boron",
    "iron",
    "manganese",
    "copper",
]


def build_disease_artifacts(root: Path) -> None:
    import tensorflow as tf

    root.mkdir(parents=True, exist_ok=True)

    (root / "class_names.json").write_text(json.dumps(DISEASE_CLASS_NAMES), encoding="utf-8")
    (root / "image_config.json").write_text(
        json.dumps({"custom.keras": {"height": 16, "width": 16, "preprocess_mode": "rescale"}}),
        encoding="utf-8",
    )
    (root / "metrics.json").write_text(
        json.dumps(
            {
                "active_model": "Custom CNN",
                "benchmark": [{"Model": "Custom CNN", "Test_Accuracy": 0.5, "Test_Loss": 1.0}],
            }
        ),
        encoding="utf-8",
    )

    model = tf.keras.Sequential(
        [
            tf.keras.layers.Input(shape=(16, 16, 3)),
            tf.keras.layers.Flatten(),
            tf.keras.layers.Dense(len(DISEASE_CLASS_NAMES), activation="softmax"),
        ]
    )
    model.save(root / "custom.keras")


def build_yield_artifacts(root: Path) -> None:
    import joblib
    import numpy as np
    import pandas as pd
    from sklearn.compose import ColumnTransformer
    from sklearn.impute import KNNImputer
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import OneHotEncoder, StandardScaler
    from xgboost import XGBRegressor

    root.mkdir(parents=True, exist_ok=True)
    (root / "models").mkdir(parents=True, exist_ok=True)

    feature_config = {
        "numeric_features_full": ["Annual_Rainfall", "Area", "Fertilizer_per_ha", "Pesticide_per_ha", "Crop_Year"],
        "numeric_features_min": ["Annual_Rainfall", "Area"],
        "categorical_features": ["State", "Crop", "Season"],
        "target": "Yield",
        "target_transform": "log1p",
        "inverse_transform": "expm1",
    }
    (root / "feature_config.json").write_text(json.dumps(feature_config), encoding="utf-8")
    (root / "best_model.json").write_text(
        json.dumps({"best_full_model": "XGBoost        (full)", "r2": 0.9}), encoding="utf-8"
    )

    train_frame = pd.DataFrame(
        {
            "Annual_Rainfall": [1000.0, 1500.0, 2000.0, 2500.0],
            "Area": [10.0, 20.0, 30.0, 40.0],
            "Fertilizer_per_ha": [5.0, 6.0, 7.0, 8.0],
            "Pesticide_per_ha": [0.5, 0.6, 0.7, 0.8],
            "Crop_Year": [2018, 2019, 2020, 2021],
            "State": ["Kerala", "Kerala", "Punjab", "Punjab"],
            "Crop": ["Rice", "Rice", "Wheat", "Wheat"],
            "Season": ["Kharif", "Kharif", "Rabi", "Rabi"],
        }
    )
    target = np.log1p([2.0, 2.5, 3.0, 3.5])

    preprocessor = ColumnTransformer(
        [
            (
                "numeric",
                Pipeline([("impute", KNNImputer(n_neighbors=2)), ("scale", StandardScaler())]),
                feature_config["numeric_features_full"],
            ),
            ("categorical", OneHotEncoder(handle_unknown="ignore"), feature_config["categorical_features"]),
        ]
    )
    transformed = preprocessor.fit_transform(train_frame)
    joblib.dump(preprocessor, root / "preprocessor_full.pkl")

    model = XGBRegressor(n_estimators=5, max_depth=2)
    model.fit(transformed, target)
    joblib.dump(model, root / "models" / "xgb_full.pkl")


def build_advisor_artifacts(root: Path) -> None:
    import joblib
    import numpy as np
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import LabelEncoder

    root.mkdir(parents=True, exist_ok=True)

    thresholds = {
        "ph": {"low": 6.5, "high": 7.5},
        "organic_carbon": {"low": 0.50, "high": 0.75},
        "nitrogen": {"low": 280, "high": 560},
        "phosphorus": {"low": 10, "high": 25},
        "potassium": {"low": 110, "high": 280},
        "sulphur": {"low": 10, "high": 20},
        "zinc": {"low": 0.6, "high": 1.2},
        "boron": {"low": 0.5, "high": 1.0},
        "iron": {"low": 4.5, "high": 9.0},
        "manganese": {"low": 2.0, "high": 4.0},
        "copper": {"low": 0.2, "high": 0.4},
    }
    recommendations = {
        column: {
            "Deficient": f"Apply corrective input for {column}.",
            "Excessive": f"Reduce {column} application.",
            "Sufficient": f"{column} levels are adequate.",
            "Acidic": "Apply agricultural lime.",
            "Alkaline": "Apply gypsum.",
            "Neutral": "pH is balanced.",
        }
        for column in ADVISOR_NUTRIENT_COLUMNS
    }
    units = {column: "units" for column in ADVISOR_NUTRIENT_COLUMNS}
    rules = {
        "THRESHOLDS": thresholds,
        "RECOMMENDATIONS": recommendations,
        "UNITS": units,
        "NUTRIENT_LABELS": {},
        "NUTRIENT_COLS": [],
    }
    (root / "rules.json").write_text(json.dumps(rules), encoding="utf-8")

    feature_config = {
        "feature_cols": ADVISOR_NUTRIENT_COLUMNS + ["soil_type_enc", "state_enc"],
        "target_col": "label_encoded",
        "label_names": ["Poor", "Moderate", "Good"],
        "label_map": {"Poor": 0, "Moderate": 1, "Good": 2},
    }
    (root / "feature_config.json").write_text(json.dumps(feature_config), encoding="utf-8")
    (root / "language_codes.json").write_text(json.dumps({"English": "en"}), encoding="utf-8")
    (root / "prompt_template.txt").write_text("You are an agricultural soil health advisor.", encoding="utf-8")

    le_soil = LabelEncoder().fit(["Black", "Red", "Alluvial"])
    le_state = LabelEncoder().fit(["Maharashtra", "Kerala", "Punjab"])
    joblib.dump({"le_soil": le_soil, "le_state": le_state}, root / "label_encoders.pkl")

    rng = np.random.default_rng(42)
    features = rng.uniform(low=0.0, high=10.0, size=(30, len(feature_config["feature_cols"])))
    labels = rng.integers(low=0, high=3, size=30)
    rf_model = RandomForestClassifier(n_estimators=10, random_state=42)
    rf_model.fit(features, labels)
    joblib.dump(rf_model, root / "rf_model.pkl")
