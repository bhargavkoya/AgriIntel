"""Soil health advisor inference extracted from the Module C notebook."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping, Protocol

from .common import load_joblib, pretty_label, read_json, read_text, resolve_artifact_dir, safe_float

DEFAULT_LLM_MODEL = "llama-3.1-8b-instant"
DEFAULT_LLM_TEMPERATURE = 0.3
DEFAULT_LLM_MAX_TOKENS = 400
DEFAULT_LANGUAGE_CODES = {
    "English": "en",
    "Hindi": "hi",
    "Telugu": "te",
}

DEFICIENT_STATUSES = {"Deficient", "Acidic", "Alkaline", "Excessive"}
EXCESSIVE_STATUS = "Excessive"


class LLMProvider(Protocol):
    def generate(self, prompt: str, *, temperature: float = DEFAULT_LLM_TEMPERATURE, max_tokens: int = DEFAULT_LLM_MAX_TOKENS) -> str:
        """Generate a text response for the supplied prompt."""


@dataclass(slots=True)
class AdvisorArtifacts:
    artifact_dir: Path
    rules: dict[str, Any]
    rf_model: Any | None
    label_encoders: dict[str, Any]
    feature_config: dict[str, Any]
    prompt_template: str
    language_codes: dict[str, str]
    llm_model: str = DEFAULT_LLM_MODEL
    llm_temperature: float = DEFAULT_LLM_TEMPERATURE
    llm_max_tokens: int = DEFAULT_LLM_MAX_TOKENS

    @property
    def feature_columns(self) -> list[str]:
        return list(self.feature_config["feature_cols"])

    @property
    def label_map(self) -> dict[str, int]:
        return dict(self.feature_config["label_map"])


def load_advisor_artifacts(artifact_dir: str | Path, load_model: bool = True) -> AdvisorArtifacts:
    root = resolve_artifact_dir(artifact_dir)
    rules = read_json(root / "rules.json")
    feature_config = read_json(root / "feature_config.json")
    language_codes = read_json(root / "language_codes.json") if (root / "language_codes.json").exists() else dict(DEFAULT_LANGUAGE_CODES)
    prompt_template = read_text(root / "prompt_template.txt") if (root / "prompt_template.txt").exists() else ""

    rf_model = load_joblib(root / "rf_model.pkl") if load_model and (root / "rf_model.pkl").exists() else None
    label_encoders = load_joblib(root / "label_encoders.pkl") if (root / "label_encoders.pkl").exists() else {}

    return AdvisorArtifacts(
        artifact_dir=root,
        rules=rules,
        rf_model=rf_model,
        label_encoders=label_encoders,
        feature_config=feature_config,
        prompt_template=prompt_template,
        language_codes=language_codes,
    )


def _thresholds(rules: Mapping[str, Any]) -> Mapping[str, Any]:
    return rules.get("THRESHOLDS") or rules.get("thresholds") or {}


def _recommendations(rules: Mapping[str, Any]) -> Mapping[str, Any]:
    return rules.get("RECOMMENDATIONS") or rules.get("recommendations") or {}


def classify_nutrient(column: str, value: Any, rules: Mapping[str, Any]) -> str:
    thresholds = _thresholds(rules)
    if column not in thresholds:
        raise KeyError(f"Unknown nutrient column: {column}")

    threshold = thresholds[column]
    numeric_value = safe_float(value)

    low = threshold.get("low")
    high = threshold.get("high")

    if column == "ph":
        if low is None or high is None:
            raise KeyError("pH thresholds must define both low and high values")
        if numeric_value < float(low):
            return "Acidic"
        if numeric_value > float(high):
            return "Alkaline"
        return "Neutral"

    if low is not None and high is not None:
        if numeric_value < float(low):
            return "Deficient"
        if numeric_value > float(high):
            return "Excessive"
        return "Sufficient"

    if low is not None:
        return "Deficient" if numeric_value < float(low) else "Sufficient"

    if high is not None:
        return "Excessive" if numeric_value > float(high) else "Sufficient"

    raise KeyError(f"Thresholds for {column} do not contain low or high values")


def derive_overall_label(statuses: Mapping[str, str]) -> tuple[str, int]:
    problem_count = sum(1 for status in statuses.values() if status in DEFICIENT_STATUSES)
    if problem_count >= 6:
        return "Poor", problem_count
    if problem_count >= 3:
        return "Moderate", problem_count
    return "Good", problem_count


def build_advisory_context(row: Mapping[str, Any], l2_result: Mapping[str, Any], rules: Mapping[str, Any]) -> dict[str, Any]:
    nutrient_columns = list(rules.get("NUTRIENT_COLS") or [key[:-7] for key in row if key.endswith("_status")])
    if not nutrient_columns:
        nutrient_columns = [key for key in row.keys() if key in _thresholds(rules)]

    statuses = {column: str(row.get(f"{column}_status", "")) for column in nutrient_columns}
    overall_label, problem_count = derive_overall_label(statuses)
    recommendations = _recommendations(rules)

    deficient = [column for column, status in statuses.items() if status in {"Deficient", "Acidic", "Alkaline"}]
    excessive = [column for column, status in statuses.items() if status == EXCESSIVE_STATUS]

    nutrient_details = []
    for column in nutrient_columns:
        nutrient_details.append(
            {
                "column": column,
                "label": pretty_label(column),
                "value": row.get(column),
                "status": statuses.get(column, ""),
                "unit": (rules.get("UNITS") or {}).get(column, ""),
                "recommendation": (recommendations.get(column) or {}).get(statuses.get(column, ""), ""),
            }
        )

    return {
        "state": row.get("state") or row.get("State", ""),
        "soil_type": row.get("soil_type") or row.get("Soil_Type", ""),
        "overall_label": overall_label,
        "problem_count": problem_count,
        "l1_statuses": statuses,
        "deficient": deficient,
        "excessive": excessive,
        "nutrients": nutrient_details,
        "l2_prediction": l2_result.get("prediction") or l2_result.get("label") or "",
        "l2_confidence": l2_result.get("confidence") or l2_result.get("probability") or {},
        "l1_l2_match": l2_result.get("prediction") == overall_label or l2_result.get("label") == overall_label,
    }


def build_prompt(context: Mapping[str, Any], prompt_template: str, language: str = "English") -> str:
    nutrient_lines = []
    for nutrient in context["nutrients"]:
        recommendation = nutrient.get("recommendation") or "No corrective action needed."
        nutrient_lines.append(
            f"- {nutrient['label']}: {nutrient.get('value')} {nutrient.get('unit', '')} | {nutrient.get('status', '')} | {recommendation}"
        )

    prompt_body = "\n".join(
        [
            f"Language: {language}",
            f"Overall Soil Health: {context['overall_label']}",
            f"Problem Count: {context['problem_count']}",
            f"State: {context.get('state', '')}",
            f"Soil Type: {context.get('soil_type', '')}",
            f"Layer 2 Prediction: {context.get('l2_prediction', '')}",
            "",
            "Deficient nutrients: " + (", ".join(context["deficient"]) if context["deficient"] else "None"),
            "Excessive nutrients: " + (", ".join(context["excessive"]) if context["excessive"] else "None"),
            "",
            "Nutrient details:",
            *nutrient_lines,
        ]
    )

    if prompt_template.strip():
        return f"{prompt_template.rstrip()}\n\n{prompt_body}"
    return prompt_body


def translate_text(text: str, target_language: str, language_codes: Mapping[str, str] | None = None) -> str:
    codes = dict(DEFAULT_LANGUAGE_CODES)
    if language_codes:
        codes.update(language_codes)

    language_code = codes.get(target_language)
    if not language_code:
        raise KeyError(f"Unsupported target language: {target_language}")

    try:
        from deep_translator import GoogleTranslator
    except ImportError as exc:  # pragma: no cover - optional runtime dependency
        raise ImportError(
            "deep-translator is required to translate advisor output"
        ) from exc

    if target_language == "English":
        return text

    translator = GoogleTranslator(source="en", target=language_code)
    return translator.translate(text)


def generate_english_advisory(
    context: Mapping[str, Any],
    provider: LLMProvider,
    prompt_template: str,
    *,
    temperature: float = DEFAULT_LLM_TEMPERATURE,
    max_tokens: int = DEFAULT_LLM_MAX_TOKENS,
) -> str:
    prompt = build_prompt(context, prompt_template, language="English")
    return provider.generate(prompt, temperature=temperature, max_tokens=max_tokens)


def predict_soil_health(
    row: Mapping[str, Any],
    artifacts: AdvisorArtifacts,
) -> dict[str, Any]:
    if artifacts.rf_model is None:
        raise KeyError("Advisor RF model has not been loaded")

    feature_row = []
    for column in artifacts.feature_columns:
        if column == "soil_type_enc":
            encoder = artifacts.label_encoders.get("le_soil")
            if encoder is None:
                raise KeyError("Missing soil type label encoder")
            encoded = encoder.transform([str(row.get("soil_type", ""))])[0]
            feature_row.append(encoded)
        elif column == "state_enc":
            encoder = artifacts.label_encoders.get("le_state")
            if encoder is None:
                raise KeyError("Missing state label encoder")
            encoded = encoder.transform([str(row.get("state", ""))])[0]
            feature_row.append(encoded)
        else:
            feature_row.append(row.get(column))

    prediction_index = int(artifacts.rf_model.predict([feature_row])[0])
    if hasattr(artifacts.rf_model, "predict_proba"):
        probabilities = artifacts.rf_model.predict_proba([feature_row])[0]
    else:
        probabilities = [0.0, 0.0, 0.0]
        probabilities[prediction_index] = 1.0

    label_names = list(artifacts.feature_config.get("label_names", ["Poor", "Moderate", "Good"]))
    label_map = {index: label for index, label in enumerate(label_names)}

    return {
        "prediction": label_map.get(prediction_index, str(prediction_index)),
        "confidence": {label_map[index]: round(float(probability) * 100, 1) for index, probability in enumerate(probabilities)},
        "feature_row": feature_row,
    }


def run_full_pipeline(
    rows: list[Mapping[str, Any]],
    artifacts: AdvisorArtifacts,
    *,
    generate_llm: bool = False,
    llm_provider: LLMProvider | None = None,
    llm_languages: list[str] | None = None,
) -> list[dict[str, Any]]:
    if llm_languages is None:
        llm_languages = list(artifacts.language_codes)

    results: list[dict[str, Any]] = []
    for row in rows:
        statuses = {
            column: classify_nutrient(column, row.get(column), artifacts.rules)
            for column in artifacts.rules.get("NUTRIENT_COLS") or artifacts.feature_config.get("feature_cols", [])
            if column not in {"soil_type_enc", "state_enc"}
        }

        overall_label, problem_count = derive_overall_label(statuses)
        enriched_row = dict(row)
        for column, status in statuses.items():
            enriched_row[f"{column}_status"] = status
        enriched_row["overall_label"] = overall_label

        l2_result = predict_soil_health(enriched_row, artifacts)
        context = build_advisory_context(enriched_row, l2_result, artifacts.rules)

        advisories: dict[str, str] = {}
        if generate_llm and llm_provider is not None:
            english_advisory = generate_english_advisory(
                context,
                llm_provider,
                artifacts.prompt_template,
                temperature=artifacts.llm_temperature,
                max_tokens=artifacts.llm_max_tokens,
            )
            advisories["English"] = english_advisory
            for language in llm_languages:
                if language != "English":
                    advisories[language] = translate_text(english_advisory, language, artifacts.language_codes)

        results.append(
            {
                "overall_label": overall_label,
                "problem_count": problem_count,
                "l2_prediction": l2_result["prediction"],
                "l2_confidence": l2_result["confidence"],
                "l1_l2_match": context["l1_l2_match"],
                "advisories": advisories,
                "context": context,
            }
        )

    return results
