from agent.retrieval import select_relevant_claims


def claim(claim_id: str, statement: str, **extra: object) -> dict:
    return {
        "id": claim_id,
        "statement": statement,
        "sourceId": "research-source",
        "classification": "COURSE_GUIDANCE",
        "status": "ACTIVE",
        **extra,
    }


def test_retrieval_ranks_claims_that_match_the_business_context() -> None:
    claims = [
        claim("ecommerce", "Use broad targeting for low-ticket ecommerce purchases."),
        claim("leads", "For lead generation, qualify leads against the sales outcome."),
    ]

    selected = select_relevant_claims(claims, "LEAD_GENERATION qualified lead security course")

    assert [item["id"] for item in selected] == ["leads", "ecommerce"]


def test_retrieval_excludes_outdated_and_conflicting_claims() -> None:
    claims = [
        claim("broad", "Lead generation can test broad audiences."),
        claim(
            "lookalike",
            "Lead generation can test lookalike audiences.",
            conflictsWith=["broad"],
        ),
        claim("old", "Lead generation guidance from an outdated interface.", status="OUTDATED"),
    ]

    selected = select_relevant_claims(claims, "lead generation")

    assert [item["id"] for item in selected] == ["broad"]
