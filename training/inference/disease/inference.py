"""Crop disease detection inference extracted from the Module A notebook."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ..common import load_keras_model, read_json, resolve_artifact_dir

HEALTHY_LABEL = "Healthy"
CONFIDENCE_THRESHOLD = 0.60

MODEL_NAME_TO_FILE = {
    "Custom CNN": "custom.keras",
    "EfficientNetB0": "efficientnet.keras",
    "ResNet50": "resnet.keras",
    "VGG16": "vgg16.keras",
}
MODEL_FILE_TO_NAME = {file_name: model_name for model_name, file_name in MODEL_NAME_TO_FILE.items()}


@dataclass(frozen=True)
class DiseaseImageConfig:
    height: int
    width: int
    preprocess_mode: str


@dataclass(slots=True)
class DiseaseArtifacts:
    artifact_dir: Path
    class_names: list[str]
    image_config: dict[str, DiseaseImageConfig]
    metrics: dict[str, Any]
    models: dict[str, Any]
    active_model: str

    @property
    def available_models(self) -> list[str]:
        return list(self.models)


def load_disease_artifacts(artifact_dir: str | Path, load_models: bool = True) -> DiseaseArtifacts:
    root = resolve_artifact_dir(artifact_dir)

    class_names_raw = read_json(root / "class_names.json")
    class_names = [class_names_raw[str(index)] for index in range(len(class_names_raw))]

    image_config_raw = read_json(root / "image_config.json")
    image_config = {
        file_name: DiseaseImageConfig(
            height=int(config["height"]),
            width=int(config["width"]),
            preprocess_mode=str(config["preprocess_mode"]),
        )
        for file_name, config in image_config_raw.items()
    }

    metrics = read_json(root / "metrics.json")
    active_model = str(metrics.get("active_model") or next(iter(MODEL_NAME_TO_FILE)))

    models: dict[str, Any] = {}
    if load_models:
        for model_name, file_name in MODEL_NAME_TO_FILE.items():
            model_path = root / file_name
            if model_path.exists():
                models[model_name] = load_keras_model(model_path)

    return DiseaseArtifacts(
        artifact_dir=root,
        class_names=class_names,
        image_config=image_config,
        metrics=metrics,
        models=models,
        active_model=active_model,
    )


def resolve_disease_model_name(artifacts: DiseaseArtifacts, model_name: str | None = None) -> str:
    candidate = model_name or artifacts.active_model
    if candidate in artifacts.models:
        return candidate
    if candidate in MODEL_FILE_TO_NAME:
        return MODEL_FILE_TO_NAME[candidate]
    raise KeyError(f"Unknown disease model: {candidate}")


def _get_model_file(model_name: str) -> str:
    if model_name in MODEL_NAME_TO_FILE:
        return MODEL_NAME_TO_FILE[model_name]
    if model_name in MODEL_FILE_TO_NAME:
        return model_name
    raise KeyError(f"Unknown disease model: {model_name}")


def preprocess_image(pil_img: Any, img_size: tuple[int, int], mode: str):
    import numpy as np

    image = np.array(pil_img.convert("RGB").resize(img_size), dtype=np.float32)
    if mode == "rescale":
        image = image / 255.0
    elif mode == "resnet":
        from tensorflow.keras.applications.resnet50 import preprocess_input

        image = preprocess_input(image)
    elif mode == "vgg":
        from tensorflow.keras.applications.vgg16 import preprocess_input

        image = preprocess_input(image)
    return np.expand_dims(image, 0)


def _top_predictions(class_names: list[str], probabilities: list[float], limit: int = 3) -> list[dict[str, Any]]:
    ranked = sorted(enumerate(probabilities), key=lambda item: item[1], reverse=True)[:limit]
    return [
        {
            "label": class_names[index],
            "confidence": float(probability),
        }
        for index, probability in ranked
    ]


def predict_leaf(pil_img: Any, artifacts: DiseaseArtifacts, model_name: str | None = None) -> dict[str, Any]:
    resolved_name = resolve_disease_model_name(artifacts, model_name)
    model_file = _get_model_file(resolved_name)
    image_config = artifacts.image_config[model_file]

    if resolved_name not in artifacts.models:
        raise KeyError(f"Disease model has not been loaded: {resolved_name}")

    probabilities = artifacts.models[resolved_name].predict(
        preprocess_image(pil_img, (image_config.width, image_config.height), image_config.preprocess_mode),
        verbose=0,
    )[0]

    import numpy as np

    probabilities_list = [float(value) for value in np.asarray(probabilities).tolist()]
    index = int(np.argmax(probabilities_list))
    confidence = float(max(probabilities_list))
    label = artifacts.class_names[index]

    healthy = label == HEALTHY_LABEL
    status = "HEALTHY" if healthy else "DISEASED"
    message = (
        "No disease detected. The leaf appears healthy."
        if healthy
        else f"Detected: {label}. Consider treatment and agronomist consultation."
    )

    return {
        "model_name": resolved_name,
        "model_file": model_file,
        "label": label,
        "confidence": confidence,
        "healthy": healthy,
        "status": status,
        "message": message,
        "low_confidence": confidence < CONFIDENCE_THRESHOLD,
        "top_predictions": _top_predictions(artifacts.class_names, probabilities_list),
    }
