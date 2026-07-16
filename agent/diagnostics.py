"""Evidence-led performance diagnosis and controlled experiment planning."""

from __future__ import annotations

from typing import Any

from agent.response_contract import validate_response


class DiagnosticError(ValueError):
    """Raised when supplied performance data cannot support a diagnosis."""


def diagnose_performance(
    current: dict[str, Any], baseline: dict[str, Any], evidence: list[dict[str, Any]]
) -> dict[str, Any]:
    """Compare two supplied periods and create one controlled experiment proposal."""

    current_metrics = _metrics(current, "current")
    baseline_metrics = _metrics(baseline, "baseline")
    variable, hypothesis = _priority_hypothesis(current_metrics, baseline_metrics)
    response = {
        "mode": "ANALYST",
        "dataAccess": "USER_PROVIDED",
        "observations": [
            _metric_observation("Current", current_metrics),
            _metric_observation("Baseline", baseline_metrics),
        ],
        "inferences": [
            {
                "statement": hypothesis,
                "confidence": "LOW",
                "alternativeExplanations": [
                    "Attribution settings, tracking quality, or sales follow-up may explain part of the change.",
                    "The periods may differ in audience mix, seasonality, or offer availability.",
                ],
            }
        ],
        "evidence": evidence,
        "missingData": [
            "Attribution setting and reporting window for both periods.",
            "Business-quality outcome after the selected conversion event.",
        ],
        "recommendedAction": "Run the single proposed experiment while holding the listed controls stable.",
        "doNotChangeYet": [
            "Do not change budget, audience, creative, and landing destination in the same experiment.",
            "Do not attribute the observed change to one cause without the experiment result.",
        ],
        "metrics": current_metrics,
        "baselineMetrics": baseline_metrics,
        "experimentPlan": _experiment_plan(variable, hypothesis),
    }
    errors = validate_response(response)
    if errors:
        raise DiagnosticError(f"Diagnosis does not satisfy the response contract: {', '.join(errors)}")
    return response


def _metrics(snapshot: dict[str, Any], label: str) -> dict[str, float]:
    impressions = _positive_number(snapshot, "impressions", label)
    clicks = _positive_number(snapshot, "clicks", label)
    conversions = _non_negative_number(snapshot, "conversions", label)
    spend = _non_negative_number(snapshot, "spend", label)
    return {
        "spend": spend,
        "impressions": impressions,
        "clicks": clicks,
        "conversions": conversions,
        "cpm": spend / impressions * 1000,
        "ctr": clicks / impressions,
        "cpc": spend / clicks,
        "conversionRate": conversions / clicks,
        "cpa": spend / conversions if conversions else 0.0,
    }


def _positive_number(snapshot: dict[str, Any], field: str, label: str) -> float:
    value = snapshot.get(field)
    if not isinstance(value, (int, float)) or isinstance(value, bool) or value <= 0:
        raise DiagnosticError(f"{label} period requires positive {field}.")
    return float(value)


def _non_negative_number(snapshot: dict[str, Any], field: str, label: str) -> float:
    value = snapshot.get(field)
    if not isinstance(value, (int, float)) or isinstance(value, bool) or value < 0:
        raise DiagnosticError(f"{label} period requires non-negative {field}.")
    return float(value)


def _priority_hypothesis(
    current: dict[str, float], baseline: dict[str, float]
) -> tuple[str, str]:
    if current["conversionRate"] < baseline["conversionRate"]:
        return (
            "landing_destination_or_offer",
            "The lower conversion rate may be constrained by the landing destination, offer, or traffic quality.",
        )
    if current["ctr"] < baseline["ctr"]:
        return (
            "creative",
            "The lower click-through rate may be constrained by the creative message, format, or audience resonance.",
        )
    return (
        "measurement_or_offer",
        "The supplied periods do not isolate a clear upstream metric decline; verify measurement and offer quality before broad changes.",
    )


def _metric_observation(label: str, metrics: dict[str, float]) -> str:
    return (
        f"{label} metrics: spend={metrics['spend']:.2f}, CPM={metrics['cpm']:.2f}, "
        f"CTR={metrics['ctr']:.4f}, CPC={metrics['cpc']:.2f}, "
        f"conversion rate={metrics['conversionRate']:.4f}, CPA={metrics['cpa']:.2f}."
    )


def _experiment_plan(variable: str, hypothesis: str) -> dict[str, Any]:
    return {
        "id": f"test-{variable}",
        "hypothesis": hypothesis,
        "primaryVariable": variable,
        "controlledVariables": ["budget", "optimization event", "attribution setting"],
        "successMetric": "Improvement in the metric associated with the selected hypothesis against the baseline.",
        "guardrails": [
            "Keep the primary variable isolated from unrelated campaign changes.",
            "Stop and review if tracking changes or business constraints invalidate comparison.",
        ],
        "minimumRunCondition": "Use a pre-agreed evidence threshold appropriate to account volume and economics.",
        "decisionRule": "Keep, iterate, or stop only after comparing the chosen success metric with the baseline under stable conditions.",
        "rollbackCondition": "Stop the test if measurement is unreliable or the agreed business guardrail is breached.",
        "status": "DRAFT",
    }
