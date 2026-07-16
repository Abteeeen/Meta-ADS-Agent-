"""Validate evidence-led responses before they reach an operator."""

from __future__ import annotations

from typing import Any


ALLOWED_MODES = {
    "TUTOR",
    "STRATEGIST",
    "LAUNCH_BUILDER",
    "CREATIVE_ENGINE",
    "AUDITOR",
    "ANALYST",
    "EXPERIMENT_MANAGER",
    "SCALING_ADVISOR",
}
ALLOWED_DATA_ACCESS = {"USER_PROVIDED", "SYNTHETIC", "READ_ONLY_API"}
ALLOWED_CLASSIFICATIONS = {
    "PLATFORM_FACT",
    "COURSE_GUIDANCE",
    "AGENCY_RULE",
    "HYPOTHESIS",
    "CASE_STUDY",
    "OUTDATED_OR_UNVERIFIED",
}
ALLOWED_CONFIDENCE = {"LOW", "MEDIUM", "HIGH"}
OFFICIAL_SOURCE_TYPES = {"OFFICIAL_DOCUMENTATION", "OFFICIAL_POLICY", "API_REFERENCE"}
REQUIRED_SECTIONS = (
    "mode",
    "dataAccess",
    "observations",
    "inferences",
    "evidence",
    "missingData",
    "recommendedAction",
    "doNotChangeYet",
)


def validate_response(response: dict[str, Any]) -> list[str]:
    """Return user-actionable contract errors for an agent response.

    The validator is intentionally deterministic. It checks that a consequential
    recommendation is explicit about observed information, uncertainty, evidence,
    missing data, and actions that should remain unchanged.
    """

    errors = _required_section_errors(response)
    if errors:
        return errors

    _validate_choice(errors, "mode", response["mode"], ALLOWED_MODES)
    _validate_choice(errors, "dataAccess", response["dataAccess"], ALLOWED_DATA_ACCESS)
    _validate_non_empty_string_list(errors, "observations", response["observations"])
    _validate_inferences(errors, response["inferences"])
    _validate_evidence(errors, response["evidence"])
    _validate_string_list(errors, "missingData", response["missingData"])
    _validate_non_empty_string(errors, "recommendedAction", response["recommendedAction"])
    _validate_non_empty_string_list(errors, "doNotChangeYet", response["doNotChangeYet"])
    return errors


def _required_section_errors(response: dict[str, Any]) -> list[str]:
    return [f"{section} is required" for section in REQUIRED_SECTIONS if section not in response]


def _validate_choice(
    errors: list[str], field: str, value: Any, allowed_values: set[str]
) -> None:
    if value not in allowed_values:
        options = ", ".join(sorted(allowed_values))
        errors.append(f"{field} must be one of: {options}")


def _validate_non_empty_string_list(errors: list[str], field: str, value: Any) -> None:
    _validate_string_list(errors, field, value)
    if isinstance(value, list) and not value:
        errors.append(f"{field} must contain at least one item")


def _validate_string_list(errors: list[str], field: str, value: Any) -> None:
    if not isinstance(value, list):
        errors.append(f"{field} must be a list")
        return
    for index, item in enumerate(value):
        if not isinstance(item, str) or not item.strip():
            errors.append(f"{field}[{index}] must be a non-empty string")


def _validate_non_empty_string(errors: list[str], field: str, value: Any) -> None:
    if not isinstance(value, str) or not value.strip():
        errors.append(f"{field} must be a non-empty string")


def _validate_inferences(errors: list[str], inferences: Any) -> None:
    if not isinstance(inferences, list):
        errors.append("inferences must be a list")
        return

    for index, inference in enumerate(inferences):
        prefix = f"inferences[{index}]"
        if not isinstance(inference, dict):
            errors.append(f"{prefix} must be an object")
            continue
        for field in ("statement", "confidence", "alternativeExplanations"):
            if field not in inference:
                errors.append(f"{prefix}.{field} is required")
        if "statement" in inference:
            _validate_non_empty_string(errors, f"{prefix}.statement", inference["statement"])
        if "confidence" in inference:
            _validate_choice(
                errors,
                f"{prefix}.confidence",
                inference["confidence"],
                ALLOWED_CONFIDENCE,
            )
        if "alternativeExplanations" in inference:
            _validate_string_list(
                errors, f"{prefix}.alternativeExplanations", inference["alternativeExplanations"]
            )


def _validate_evidence(errors: list[str], evidence: Any) -> None:
    if not isinstance(evidence, list):
        errors.append("evidence must be a list")
        return
    if not evidence:
        errors.append("evidence must contain at least one item")
        return

    for index, item in enumerate(evidence):
        prefix = f"evidence[{index}]"
        if not isinstance(item, dict):
            errors.append(f"{prefix} must be an object")
            continue
        for field in ("sourceId", "classification", "supports"):
            if field not in item:
                errors.append(f"{prefix}.{field} is required")
        if "sourceId" in item:
            _validate_non_empty_string(errors, f"{prefix}.sourceId", item["sourceId"])
        if "supports" in item:
            _validate_non_empty_string(errors, f"{prefix}.supports", item["supports"])
        classification = item.get("classification")
        if classification is not None:
            _validate_choice(errors, f"{prefix}.classification", classification, ALLOWED_CLASSIFICATIONS)
        if classification == "PLATFORM_FACT":
            if item.get("sourceType") not in OFFICIAL_SOURCE_TYPES:
                errors.append("PLATFORM_FACT evidence must use an official source type")
