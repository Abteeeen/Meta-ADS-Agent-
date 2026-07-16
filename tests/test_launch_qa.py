import pytest

from agent.launch_qa import LaunchQaError, build_launch_qa
from agent.strategy import build_strategy_brief


def complete_brief() -> dict:
    return {
        "businessModel": "LEAD_GENERATION",
        "market": "United States",
        "offer": "Free roof inspection",
        "primaryGoal": "LEADS",
        "conversionEvent": "Qualified lead",
        "landingDestination": "https://example.com/inspection",
        "monthlyBudget": 3000,
        "accountMaturity": "EXISTING_ACCOUNT",
        "trackingStatus": "VERIFIED",
    }


def reviewed_claim() -> dict:
    return {
        "id": "campaign-structure-guidance",
        "statement": "Choose campaign structure to match the business objective and conversion event.",
        "sourceId": "youtube-PakHu2sKTvQ",
        "sourceLocation": "00:38:00",
        "classification": "COURSE_GUIDANCE",
        "confidence": "MEDIUM",
        "reviewedAt": "2026-07-16",
        "status": "ACTIVE",
    }


def launch_inputs() -> dict:
    return {
        "creativeReady": True,
        "policyReviewStatus": "PASSED",
        "humanApprovalStatus": "PENDING",
    }


def strategy() -> dict:
    return build_strategy_brief(complete_brief(), [reviewed_claim()])


def test_complete_launch_qa_is_ready_for_human_approval() -> None:
    audit = build_launch_qa(complete_brief(), strategy(), launch_inputs())

    assert audit["launchStatus"] == "READY_FOR_HUMAN_APPROVAL"
    assert audit["recommendedAction"] == "Request explicit human approval before publishing any ads."
    assert audit["findings"] == []


def test_missing_creative_blocks_launch() -> None:
    inputs = launch_inputs()
    inputs["creativeReady"] = False

    audit = build_launch_qa(complete_brief(), strategy(), inputs)

    assert audit["launchStatus"] == "BLOCKED"
    assert audit["findings"][0]["id"] == "CREATIVE_NOT_READY"


def test_unverified_tracking_blocks_launch() -> None:
    brief = complete_brief()
    brief["trackingStatus"] = "UNVERIFIED"

    audit = build_launch_qa(brief, strategy(), launch_inputs())

    assert audit["launchStatus"] == "BLOCKED"
    assert "TRACKING_NOT_VERIFIED" in [finding["id"] for finding in audit["findings"]]


def test_invalid_strategy_is_rejected() -> None:
    with pytest.raises(LaunchQaError, match="response contract"):
        build_launch_qa(complete_brief(), {}, launch_inputs())
