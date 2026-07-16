"""Deterministic orchestration for the Meta Ads operator workflow."""

from __future__ import annotations

from typing import Any


BUSINESS_FIELDS = (
    "businessModel",
    "market",
    "offer",
    "primaryGoal",
    "conversionEvent",
    "landingDestination",
    "monthlyBudget",
    "accountMaturity",
)


def build_workflow_plan(brief: dict[str, Any]) -> dict[str, Any]:
    """Turn a business brief into the next safe operating steps.

    This module deliberately does not make performance claims or create ads. It
    determines whether the inputs support strategy work and whether measurement
    is sufficiently verified to progress toward a launch decision.
    """

    missing_data = _missing_business_data(brief)
    business_ready = not missing_data
    tracking_verified = brief.get("trackingStatus") == "VERIFIED"

    steps = [
        _step(
            "BUSINESS_CONTEXT",
            "Confirm the offer, buyer, economics, and conversion goal.",
            "READY" if business_ready else "BLOCKED",
            missing_data,
        ),
        _step(
            "MEASUREMENT_READINESS",
            "Verify the conversion event and tracking before launch.",
            "READY" if tracking_verified else "BLOCKED",
            [] if tracking_verified else ["trackingStatus"],
        ),
        _step(
            "STRATEGY",
            "Create a campaign strategy brief with explicit assumptions.",
            "READY" if business_ready else "BLOCKED",
            missing_data,
        ),
        _step(
            "LAUNCH_QA",
            "Audit setup, creative, destination, tracking, and policy risk.",
            "PENDING" if business_ready and tracking_verified else "BLOCKED",
            [] if business_ready and tracking_verified else _launch_dependencies(missing_data, tracking_verified),
        ),
        _step(
            "LEARNING_LOOP",
            "Log changes, review evidence, and plan one controlled experiment.",
            "PENDING",
            [],
        ),
    ]

    warnings = []
    if not tracking_verified:
        warnings.append("Verify tracking before any launch decision.")

    if not business_ready:
        return {
            "overallStatus": "BLOCKED",
            "missingData": missing_data,
            "warnings": warnings,
            "nextAction": "Complete the missing business inputs before strategy work.",
            "steps": steps,
        }

    return {
        "overallStatus": "READY_FOR_STRATEGY",
        "missingData": [],
        "warnings": warnings,
        "nextAction": "Create a campaign strategy brief.",
        "steps": steps,
    }


def _missing_business_data(brief: dict[str, Any]) -> list[str]:
    missing = [field for field in BUSINESS_FIELDS if _is_missing(field, brief.get(field))]
    return missing


def _is_missing(field: str, value: Any) -> bool:
    if field == "monthlyBudget":
        return not isinstance(value, (int, float)) or isinstance(value, bool) or value <= 0
    return not isinstance(value, str) or not value.strip()


def _launch_dependencies(missing_data: list[str], tracking_verified: bool) -> list[str]:
    dependencies = list(missing_data)
    if not tracking_verified:
        dependencies.append("trackingStatus")
    return dependencies


def _step(
    step_id: str, description: str, status: str, missing_data: list[str]
) -> dict[str, Any]:
    return {
        "id": step_id,
        "description": description,
        "status": status,
        "missingData": missing_data,
    }
