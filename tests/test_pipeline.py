from agent.pipeline import run_pipeline


def brief() -> dict:
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


def claims() -> list[dict]:
    return [
        {
            "id": "campaign-guidance",
            "statement": "Use campaign structure that matches the business objective.",
            "sourceId": "youtube-PakHu2sKTvQ",
            "sourceLocation": "00:38:00",
            "classification": "COURSE_GUIDANCE",
            "confidence": "MEDIUM",
            "reviewedAt": "2026-07-16",
            "status": "ACTIVE",
        }
    ]


def test_full_pipeline_returns_all_core_outputs() -> None:
    result = run_pipeline(
        brief(),
        claims(),
        {"creativeReady": True, "policyReviewStatus": "PASSED", "humanApprovalStatus": "PENDING"},
        {"spend": 1000, "impressions": 100000, "clicks": 700, "conversions": 35},
        {"spend": 1000, "impressions": 100000, "clicks": 1200, "conversions": 60},
    )

    assert result["overallStatus"] == "ANALYZED"
    assert result["strategy"]["mode"] == "STRATEGIST"
    assert result["launchQa"]["launchStatus"] == "READY_FOR_HUMAN_APPROVAL"
    assert result["diagnosis"]["mode"] == "ANALYST"


def test_blocked_business_brief_stops_downstream_stages() -> None:
    incomplete = brief()
    del incomplete["offer"]

    result = run_pipeline(incomplete, claims(), {"creativeReady": True})

    assert result["overallStatus"] == "BLOCKED"
    assert result["strategy"] is None
    assert result["launchQa"] is None
    assert result["diagnosis"] is None
