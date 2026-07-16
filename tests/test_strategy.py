import pytest

from agent.response_contract import validate_response
from agent.strategy import StrategyBuildError, build_strategy_brief, load_claims


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
        "status": "NEEDS_REVIEW",
    }


def test_strategy_brief_is_an_evidence_led_response() -> None:
    brief = build_strategy_brief(complete_brief(), [reviewed_claim()])

    assert brief["mode"] == "STRATEGIST"
    assert brief["campaignPlan"]["objective"] == "LEADS"
    assert brief["campaignPlan"]["optimizationEvent"] == "Qualified lead"
    assert brief["evidence"][0]["sourceId"] == "youtube-PakHu2sKTvQ"
    assert validate_response(brief) == []


def test_strategy_brief_requires_a_ready_workflow() -> None:
    brief = complete_brief()
    del brief["offer"]

    with pytest.raises(StrategyBuildError, match="missing business inputs"):
        build_strategy_brief(brief, [reviewed_claim()])


def test_strategy_brief_rejects_missing_usable_evidence() -> None:
    outdated_claim = reviewed_claim()
    outdated_claim["status"] = "OUTDATED"

    with pytest.raises(StrategyBuildError, match="reviewed evidence"):
        build_strategy_brief(complete_brief(), [outdated_claim])


def test_needs_review_evidence_lowers_inference_confidence() -> None:
    brief = build_strategy_brief(complete_brief(), [reviewed_claim()])

    assert brief["inferences"][0]["confidence"] == "LOW"


def test_load_claims_reads_all_reviewed_claim_files(tmp_path) -> None:
    first = tmp_path / "one" / "reviewed"
    second = tmp_path / "two" / "reviewed"
    first.mkdir(parents=True)
    second.mkdir(parents=True)
    (first / "claims.json").write_text('[{"id": "one"}]', encoding="utf-8")
    (second / "claims.json").write_text('[{"id": "two"}]', encoding="utf-8")

    assert [claim["id"] for claim in load_claims(tmp_path)] == ["one", "two"]
