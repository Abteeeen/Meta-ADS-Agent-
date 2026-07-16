import pytest

from agent.diagnostics import DiagnosticError, diagnose_performance


def evidence() -> list[dict]:
    return [
        {
            "sourceId": "youtube-PakHu2sKTvQ",
            "classification": "COURSE_GUIDANCE",
            "supports": "Use structured testing and optimization guidance.",
        }
    ]


def baseline() -> dict:
    return {
        "spend": 1000,
        "impressions": 100000,
        "clicks": 1200,
        "conversions": 60,
    }


def test_diagnosis_calculates_metrics_and_recommends_one_experiment() -> None:
    current = {
        "spend": 1000,
        "impressions": 100000,
        "clicks": 700,
        "conversions": 35,
    }

    diagnosis = diagnose_performance(current, baseline(), evidence())

    assert diagnosis["mode"] == "ANALYST"
    assert diagnosis["metrics"]["ctr"] == pytest.approx(0.007)
    assert diagnosis["experimentPlan"]["primaryVariable"] == "creative"
    assert diagnosis["experimentPlan"]["guardrails"]


def test_lower_conversion_rate_prioritizes_landing_or_offer_hypothesis() -> None:
    current = {
        "spend": 1000,
        "impressions": 100000,
        "clicks": 1200,
        "conversions": 30,
    }

    diagnosis = diagnose_performance(current, baseline(), evidence())

    assert diagnosis["experimentPlan"]["primaryVariable"] == "landing_destination_or_offer"


def test_diagnosis_requires_positive_metric_inputs() -> None:
    current = {"spend": 0, "impressions": 0, "clicks": 0, "conversions": 0}

    with pytest.raises(DiagnosticError, match="positive impressions"):
        diagnose_performance(current, baseline(), evidence())


def test_diagnosis_requires_source_classified_evidence() -> None:
    with pytest.raises(DiagnosticError, match="response contract"):
        diagnose_performance(baseline(), baseline(), [])
