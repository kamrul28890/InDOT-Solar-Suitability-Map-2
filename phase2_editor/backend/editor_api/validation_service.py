from __future__ import annotations

from typing import Any

from .session_store import SessionStore


def validate_store(store: SessionStore) -> dict[str, Any]:
    session = store.require_session()
    issues: list[dict[str, Any]] = []
    score_fields = set(store.config.get("score_fields", []))

    for layer_name, fields in session.field_config.items():
        for field_name, config in fields.items():
            if config.get("visible") and not str(config.get("label", "")).strip():
                issues.append(
                    issue("error", layer_name, None, field_name, "Visible fields must have a display label.")
                )

    for layer_name, layer_state in store.layers.items():
        for layer_summary in session.import_summary["layers"]:
            if layer_summary["name"] == layer_name and layer_summary.get("fixed_geometries", 0):
                issues.append(
                    issue(
                        "warning",
                        layer_name,
                        None,
                        None,
                        f"{layer_summary['fixed_geometries']} invalid source geometries will be repaired during export.",
                    )
                )

        layer_field_config = session.field_config.get(layer_name, {})
        required_fields = [field for field, config in layer_field_config.items() if config.get("required")]
        for feature_id in layer_state.original_records:
            record = store.materialized_record(layer_name, feature_id)
            for field_name in required_fields:
                if is_blank(record.get(field_name)):
                    issues.append(
                        issue("error", layer_name, feature_id, field_name, "Required field is blank.")
                    )
            for field_name in score_fields.intersection(record):
                value = record.get(field_name)
                if is_blank(value):
                    continue
                try:
                    number = float(value)
                except (TypeError, ValueError):
                    issues.append(
                        issue("error", layer_name, feature_id, field_name, "Score field must be numeric.")
                    )
                    continue
                if number < 0 or number > 5:
                    issues.append(
                        issue("error", layer_name, feature_id, field_name, "Score field must be between 0 and 5.")
                    )

    return {
        "valid": not any(item["severity"] == "error" for item in issues),
        "error_count": sum(1 for item in issues if item["severity"] == "error"),
        "warning_count": sum(1 for item in issues if item["severity"] == "warning"),
        "issues": issues,
    }


def issue(severity: str, layer: str, feature_id: str | None, field: str | None, message: str) -> dict[str, Any]:
    return {
        "severity": severity,
        "layer": layer,
        "feature_id": feature_id,
        "field": field,
        "message": message,
    }


def is_blank(value: Any) -> bool:
    return value is None or (isinstance(value, str) and not value.strip())

