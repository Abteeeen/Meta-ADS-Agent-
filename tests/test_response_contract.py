from agent.response_contract import validate_response


def valid_response() -> dict:
    return {
        "mode": "ANALYST",
        "dataAccess": "USER_PROVIDED",
        "observations": ["Spend moved toward one ad during the first day."],
        "inferences": [
            {
                "statement": "Delivery may be concentrating before there is enough evidence to name a winner.",
                "confidence": "MEDIUM",
                "alternativeExplanations": ["Audience size and optimization event can affect delivery."],
            }
        ],
        "evidence": [
            {
                "sourceId": "youtube-PakHu2sKTvQ",
                "classification": "COURSE_GUIDANCE",
                "supports": "Learning-phase caution",
            }
        ],
        "missingData": ["Date range", "Optimization event", "Attributed conversion count"],
        "recommendedAction": "Collect a stable date range before changing the campaign.",
        "doNotChangeYet": ["Do not declare a winning ad from first-day delivery alone."],
    }


def test_valid_evidence_led_response_is_accepted() -> None:
    assert validate_response(valid_response()) == []


def test_missing_required_top_level_section_is_rejected() -> None:
    response = valid_response()
    del response["evidence"]

    errors = validate_response(response)

    assert "evidence is required" in errors


def test_consequential_response_requires_evidence() -> None:
    response = valid_response()
    response["evidence"] = []

    errors = validate_response(response)

    assert "evidence must contain at least one item" in errors


def test_inference_requires_confidence_and_alternative_explanations() -> None:
    response = valid_response()
    response["inferences"] = [{"statement": "The ad is the winner."}]

    errors = validate_response(response)

    assert "inferences[0].confidence is required" in errors
    assert "inferences[0].alternativeExplanations is required" in errors


def test_evidence_rejects_unknown_classification() -> None:
    response = valid_response()
    response["evidence"][0]["classification"] = "TRUST_ME"

    errors = validate_response(response)

    assert "evidence[0].classification must be one of" in errors[0]


def test_platform_fact_requires_official_source_type() -> None:
    response = valid_response()
    response["evidence"][0]["classification"] = "PLATFORM_FACT"
    response["evidence"][0]["sourceType"] = "VIDEO_COURSE"

    errors = validate_response(response)

    assert "PLATFORM_FACT evidence must use an official source type" in errors


def test_unknown_live_account_access_is_rejected() -> None:
    response = valid_response()
    response["dataAccess"] = "LIVE_ACCOUNT"

    errors = validate_response(response)

    assert "dataAccess must be one of" in errors[0]
