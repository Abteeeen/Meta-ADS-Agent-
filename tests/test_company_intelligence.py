from agent.company_intelligence import build_company_intelligence_plan


def five_star_context() -> dict:
    return {
        "companyName": "Five Star Training Academy",
        "accountMaturity": "EXISTING_ACCOUNT",
        "knownFacts": {
            "offer": "CPP20218 Certificate II in Security Operations",
            "market": "Brisbane and Gold Coast, Queensland",
            "landingDestination": "https://fivestartraining.edu.au/courses/certificate-ii-in-security-operations/",
            "primaryGoal": "Eligible leads and paid students",
            "conversionEvent": "Qualified enrolment lead",
        },
        "connections": {"meta": "NOT_CONNECTED", "crm": "NOT_CONNECTED"},
    }


def test_intelligence_run_routes_work_to_specialists_and_asks_only_for_client_facts() -> None:
    plan = build_company_intelligence_plan(five_star_context())

    jobs = {job["id"]: job["status"] for job in plan["specialistJobs"]}
    question_keys = [gap["key"] for gap in plan["questionQueue"]]

    assert jobs["PUBLIC_COMPANY_RESEARCH"] == "READY"
    assert jobs["MARKET_AND_AUDIENCE_RESEARCH"] == "READY"
    assert jobs["META_ACCOUNT_AUDIT"] == "WAITING_FOR_CONNECTION"
    assert "monthlyBudget" in question_keys
    assert "capacityAndCourseDates" in question_keys
    assert "offer" not in question_keys
    assert plan["strategySynthesis"]["status"] == "WAITING_FOR_CLIENT_INPUT"


def test_intelligence_run_is_ready_for_strategy_when_required_evidence_is_available() -> None:
    context = five_star_context()
    context["knownFacts"].update(
        {
            "monthlyBudget": 5000,
            "capacityAndCourseDates": "Confirmed by operations",
            "leadQualityDefinition": "Location and course fit confirmed; contactable; ready to discuss enrolment",
            "approvedClaims": "Approved by compliance",
            "trackingStatus": "VERIFIED",
        }
    )
    context["connections"] = {"meta": "READ_ONLY_CONNECTED", "crm": "READ_ONLY_CONNECTED"}

    plan = build_company_intelligence_plan(context)

    assert plan["strategySynthesis"]["status"] == "READY_FOR_SYNTHESIS"
    assert plan["overallStatus"] == "READY_FOR_SYNTHESIS"
    assert plan["questionQueue"] == []


def test_intelligence_run_keeps_a_connection_request_out_of_the_client_question_queue() -> None:
    plan = build_company_intelligence_plan(five_star_context())

    integration_keys = [gap["key"] for gap in plan["integrationRequests"]]
    client_keys = [gap["key"] for gap in plan["questionQueue"]]

    assert "metaAccountHistory" in integration_keys
    assert "crmOutcomeData" in integration_keys
    assert "metaAccountHistory" not in client_keys
