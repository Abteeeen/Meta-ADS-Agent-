"""Pre-launch quality assurance for strategy briefs."""

from __future__ import annotations

from typing import Any

from agent.response_contract import validate_response


class LaunchQaError(ValueError):
    """Raised when launch QA cannot evaluate the supplied strategy."""


def build_launch_qa(
    brief: dict[str, Any], strategy: dict[str, Any], launch_inputs: dict[str, Any]
) -> dict[str, Any]:
    """Audit launch readiness without publishing or modifying an ad account."""

    strategy_errors = validate_response(strategy)
    if strategy_errors:
        raise LaunchQaError(
            f"Strategy must satisfy the response contract: {', '.join(strategy_errors)}"
        )

    findings = _findings(brief, launch_inputs)
    launch_status = "BLOCKED" if findings else "READY_FOR_HUMAN_APPROVAL"
    missing_data = [finding["missingData"] for finding in findings]

    response = {
        "mode": "AUDITOR",
        "dataAccess": "USER_PROVIDED",
        "observations": [
            f"Tracking status: {brief.get('trackingStatus', 'UNKNOWN')}.",
            f"Creative ready: {launch_inputs.get('creativeReady', False)}.",
            f"Policy review status: {launch_inputs.get('policyReviewStatus', 'NOT_REVIEWED')}.",
            f"Human approval status: {launch_inputs.get('humanApprovalStatus', 'PENDING')}.",
        ],
        "inferences": [
            {
                "statement": (
                    "The launch can proceed only after all blockers are resolved and a human explicitly "
                    "approves the reviewed build."
                ),
                "confidence": "HIGH",
                "alternativeExplanations": [
                    "A clean pre-launch checklist cannot guarantee delivery or business performance.",
                    "Meta may still apply its own policy enforcement after submission.",
                ],
            }
        ],
        "evidence": strategy["evidence"],
        "missingData": missing_data,
        "recommendedAction": _recommended_action(launch_status),
        "doNotChangeYet": [
            "Do not publish, duplicate, or scale ads before explicit human approval.",
            "Do not treat this audit as a policy approval from Meta.",
        ],
        "launchStatus": launch_status,
        "findings": findings,
    }
    errors = validate_response(response)
    if errors:
        raise LaunchQaError(f"Generated audit violates response contract: {', '.join(errors)}")
    return response


def _findings(brief: dict[str, Any], launch_inputs: dict[str, Any]) -> list[dict[str, str]]:
    findings = []
    if brief.get("trackingStatus") != "VERIFIED":
        findings.append(
            _finding(
                "TRACKING_NOT_VERIFIED",
                "BLOCKER",
                "Verify the selected conversion event and tracking path before launch.",
                "trackingStatus",
            )
        )
    if launch_inputs.get("creativeReady") is not True:
        findings.append(
            _finding(
                "CREATIVE_NOT_READY",
                "BLOCKER",
                "Provide approved creative assets and a final destination review before launch.",
                "creativeReady",
            )
        )
    if launch_inputs.get("policyReviewStatus") != "PASSED":
        findings.append(
            _finding(
                "POLICY_REVIEW_INCOMPLETE",
                "BLOCKER",
                "Complete a human policy and claim review before launch.",
                "policyReviewStatus",
            )
        )
    return findings


def _finding(finding_id: str, severity: str, recommendation: str, missing_data: str) -> dict[str, str]:
    return {
        "id": finding_id,
        "severity": severity,
        "recommendation": recommendation,
        "missingData": missing_data,
    }


def _recommended_action(launch_status: str) -> str:
    if launch_status == "READY_FOR_HUMAN_APPROVAL":
        return "Request explicit human approval before publishing any ads."
    return "Resolve every launch blocker, then rerun launch QA."
