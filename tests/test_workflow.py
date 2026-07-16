from agent.workflow import build_workflow_plan


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


def test_complete_brief_produces_a_ready_main_workflow() -> None:
    plan = build_workflow_plan(complete_brief())

    assert plan["overallStatus"] == "READY_FOR_STRATEGY"
    assert [step["id"] for step in plan["steps"]] == [
        "BUSINESS_CONTEXT",
        "MEASUREMENT_READINESS",
        "STRATEGY",
        "LAUNCH_QA",
        "LEARNING_LOOP",
    ]
    assert plan["nextAction"] == "Create a campaign strategy brief."


def test_missing_commercial_inputs_block_strategy() -> None:
    brief = complete_brief()
    del brief["offer"]
    del brief["monthlyBudget"]

    plan = build_workflow_plan(brief)

    assert plan["overallStatus"] == "BLOCKED"
    assert plan["missingData"] == ["offer", "monthlyBudget"]
    assert plan["nextAction"] == "Complete the missing business inputs before strategy work."


def test_unverified_tracking_blocks_launch_but_not_strategy() -> None:
    brief = complete_brief()
    brief["trackingStatus"] = "UNVERIFIED"

    plan = build_workflow_plan(brief)

    statuses = {step["id"]: step["status"] for step in plan["steps"]}
    assert plan["overallStatus"] == "READY_FOR_STRATEGY"
    assert statuses["STRATEGY"] == "READY"
    assert statuses["LAUNCH_QA"] == "BLOCKED"
    assert any("Verify tracking" in warning for warning in plan["warnings"])


def test_invalid_budget_is_reported_as_missing_data() -> None:
    brief = complete_brief()
    brief["monthlyBudget"] = 0

    plan = build_workflow_plan(brief)

    assert plan["overallStatus"] == "BLOCKED"
    assert plan["missingData"] == ["monthlyBudget"]
