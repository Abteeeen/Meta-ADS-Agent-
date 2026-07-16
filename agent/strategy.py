"""Evidence-led campaign strategy briefs."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from agent.response_contract import validate_response
from agent.workflow import build_workflow_plan


USABLE_STATUSES = {"ACTIVE", "NEEDS_REVIEW"}
USABLE_CLASSIFICATIONS = {"PLATFORM_FACT", "COURSE_GUIDANCE", "AGENCY_RULE", "CASE_STUDY"}


class StrategyBuildError(ValueError):
    """Raised when the available context cannot support a safe strategy brief."""


def load_claims(root: Path) -> list[dict[str, Any]]:
    """Load reviewed claim records from every `reviewed/claims.json` below root."""

    claims: list[dict[str, Any]] = []
    for claims_path in sorted(root.glob("*/reviewed/claims.json")):
        payload = json.loads(claims_path.read_text(encoding="utf-8"))
        if not isinstance(payload, list):
            raise StrategyBuildError(f"Claim file must contain a JSON array: {claims_path}")
        for claim in payload:
            if not isinstance(claim, dict):
                raise StrategyBuildError(f"Claim records must be JSON objects: {claims_path}")
            claims.append(claim)
    return claims


def build_strategy_brief(brief: dict[str, Any], claims: list[dict[str, Any]]) -> dict[str, Any]:
    """Build a reviewable campaign strategy from a validated brief and knowledge claims."""

    workflow = build_workflow_plan(brief)
    if workflow["overallStatus"] != "READY_FOR_STRATEGY":
        raise StrategyBuildError("Cannot build strategy: missing business inputs.")

    evidence = _select_evidence(claims)
    if not evidence:
        raise StrategyBuildError("Cannot build strategy: no usable reviewed evidence is available.")

    confidence = "LOW" if any(item["status"] == "NEEDS_REVIEW" for item in evidence) else "MEDIUM"
    response = {
        "mode": "STRATEGIST",
        "dataAccess": "USER_PROVIDED",
        "observations": [
            f"Business model: {brief['businessModel']}.",
            f"Primary goal: {brief['primaryGoal']} via {brief['conversionEvent']}.",
            f"Declared monthly budget: {brief['monthlyBudget']}.",
            f"Tracking status: {brief['trackingStatus']}.",
        ],
        "inferences": [
            {
                "statement": (
                    "Start with one strategy brief tied to the declared conversion event, "
                    "then validate the audience and creative hypotheses through controlled testing."
                ),
                "confidence": confidence,
                "alternativeExplanations": [
                    "The offer, landing experience, or sales follow-up may be the primary constraint.",
                    "The declared conversion event may not reflect the most valuable business outcome.",
                ],
            }
        ],
        "evidence": [_evidence_record(claim) for claim in evidence],
        "missingData": [
            "Priority customer segment and its strongest buying trigger.",
            "Target cost per acquisition or qualified lead based on unit economics.",
            "Available proof, creative assets, and claim-approval constraints.",
        ],
        "recommendedAction": "Review and confirm the campaign strategy brief before creating launch assets.",
        "doNotChangeYet": [
            "Do not create several unrelated audience, offer, and creative tests at the same time.",
            "Do not treat course guidance as a guaranteed account outcome.",
        ],
        "campaignPlan": {
            "objective": brief["primaryGoal"],
            "optimizationEvent": brief["conversionEvent"],
            "budget": {"monthly": brief["monthlyBudget"], "currency": "UNSPECIFIED"},
            "market": brief["market"],
            "offer": brief["offer"],
            "landingDestination": brief["landingDestination"],
            "audienceHypothesis": "Define one priority segment and its buying trigger before targeting.",
            "creativeHypothesis": "Test creative concepts that connect the buyer tension, offer proof, and call to action.",
        },
    }

    errors = validate_response(response)
    if errors:
        raise StrategyBuildError(f"Generated strategy violates response contract: {', '.join(errors)}")
    return response


def _select_evidence(claims: list[dict[str, Any]], maximum: int = 3) -> list[dict[str, Any]]:
    selected = []
    for claim in claims:
        if claim.get("status") not in USABLE_STATUSES:
            continue
        if claim.get("classification") not in USABLE_CLASSIFICATIONS:
            continue
        if not all(claim.get(field) for field in ("sourceId", "classification", "statement")):
            continue
        selected.append(claim)
        if len(selected) == maximum:
            break
    return selected


def _evidence_record(claim: dict[str, Any]) -> dict[str, str]:
    return {
        "sourceId": str(claim["sourceId"]),
        "classification": str(claim["classification"]),
        "supports": str(claim["statement"]),
    }
