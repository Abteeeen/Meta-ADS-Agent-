"""End-to-end orchestration for the generic Meta Ads operator workflow."""

from __future__ import annotations

from typing import Any

from agent.diagnostics import diagnose_performance
from agent.launch_qa import build_launch_qa
from agent.strategy import build_strategy_brief
from agent.workflow import build_workflow_plan


def run_pipeline(
    brief: dict[str, Any],
    claims: list[dict[str, Any]],
    launch_inputs: dict[str, Any],
    current_metrics: dict[str, Any] | None = None,
    baseline_metrics: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Run every core stage without writing to a Meta account."""

    workflow = build_workflow_plan(brief)
    if workflow["overallStatus"] == "BLOCKED":
        return {
            "overallStatus": "BLOCKED",
            "workflow": workflow,
            "strategy": None,
            "launchQa": None,
            "diagnosis": None,
        }

    strategy = build_strategy_brief(brief, claims)
    launch_qa = build_launch_qa(brief, strategy, launch_inputs)
    diagnosis = None
    if current_metrics is not None and baseline_metrics is not None:
        diagnosis = diagnose_performance(current_metrics, baseline_metrics, strategy["evidence"])

    overall_status = "ANALYZED" if diagnosis else launch_qa["launchStatus"]
    return {
        "overallStatus": overall_status,
        "workflow": workflow,
        "strategy": strategy,
        "launchQa": launch_qa,
        "diagnosis": diagnosis,
    }
