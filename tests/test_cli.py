import json
import subprocess
import sys

import pytest

from agent.__main__ import _load_json, main

def test_cli_outputs_a_workflow_plan(tmp_path) -> None:
    brief_path = tmp_path / "brief.json"
    brief_path.write_text(
        json.dumps(
            {
                "businessModel": "ECOMMERCE",
                "market": "United States",
                "offer": "Starter skincare kit",
                "primaryGoal": "SALES",
                "conversionEvent": "Purchase",
                "landingDestination": "https://example.com/product",
                "monthlyBudget": 5000,
                "accountMaturity": "NEW_ACCOUNT",
                "trackingStatus": "VERIFIED",
            }
        ),
        encoding="utf-8",
    )

    result = subprocess.run(
        [sys.executable, "-m", "agent", "workflow", "--input", str(brief_path)],
        check=True,
        capture_output=True,
        text=True,
    )

    output = json.loads(result.stdout)
    assert output["overallStatus"] == "READY_FOR_STRATEGY"
    assert output["nextAction"] == "Create a campaign strategy brief."


def test_main_reads_a_brief_and_prints_the_plan(tmp_path, monkeypatch, capsys) -> None:
    brief_path = tmp_path / "brief.json"
    brief_path.write_text(
        json.dumps(
            {
                "businessModel": "ECOMMERCE",
                "market": "United States",
                "offer": "Starter skincare kit",
                "primaryGoal": "SALES",
                "conversionEvent": "Purchase",
                "landingDestination": "https://example.com/product",
                "monthlyBudget": 5000,
                "accountMaturity": "NEW_ACCOUNT",
                "trackingStatus": "VERIFIED",
            }
        ),
        encoding="utf-8",
    )
    monkeypatch.setattr(sys, "argv", ["agent", "workflow", "--input", str(brief_path)])

    assert main() == 0

    assert json.loads(capsys.readouterr().out)["overallStatus"] == "READY_FOR_STRATEGY"


def test_load_json_rejects_non_object_payload(tmp_path) -> None:
    brief_path = tmp_path / "brief.json"
    brief_path.write_text("[]", encoding="utf-8")

    with pytest.raises(SystemExit, match="Input JSON must be an object"):
        _load_json(brief_path)


def test_load_json_explains_invalid_json(tmp_path) -> None:
    brief_path = tmp_path / "brief.json"
    brief_path.write_text("{bad json", encoding="utf-8")

    with pytest.raises(SystemExit, match="Input file is not valid JSON"):
        _load_json(brief_path)


def test_main_builds_a_strategy_brief_from_reviewed_claims(tmp_path, monkeypatch, capsys) -> None:
    brief_path = tmp_path / "brief.json"
    claims_path = tmp_path / "source" / "reviewed"
    claims_path.mkdir(parents=True)
    brief_path.write_text(
        json.dumps(
            {
                "businessModel": "ECOMMERCE",
                "market": "United States",
                "offer": "Starter skincare kit",
                "primaryGoal": "SALES",
                "conversionEvent": "Purchase",
                "landingDestination": "https://example.com/product",
                "monthlyBudget": 5000,
                "accountMaturity": "NEW_ACCOUNT",
                "trackingStatus": "VERIFIED",
            }
        ),
        encoding="utf-8",
    )
    (claims_path / "claims.json").write_text(
        json.dumps(
            [
                {
                    "id": "campaign-guidance",
                    "statement": "Use a campaign structure that matches the conversion goal.",
                    "sourceId": "course-source",
                    "classification": "COURSE_GUIDANCE",
                    "status": "ACTIVE",
                }
            ]
        ),
        encoding="utf-8",
    )
    monkeypatch.setattr(
        sys,
        "argv",
        ["agent", "strategy", "--input", str(brief_path), "--claims-dir", str(tmp_path)],
    )

    assert main() == 0

    output = json.loads(capsys.readouterr().out)
    assert output["mode"] == "STRATEGIST"
    assert output["evidence"][0]["sourceId"] == "course-source"


def test_main_routes_company_intelligence_work(tmp_path, monkeypatch, capsys) -> None:
    context_path = tmp_path / "company-context.json"
    context_path.write_text(
        json.dumps(
            {
                "companyName": "Five Star Training Academy",
                "accountMaturity": "EXISTING_ACCOUNT",
                "knownFacts": {
                    "offer": "CPP20218 Security Operations",
                    "market": "Brisbane and Gold Coast",
                    "landingDestination": "https://fivestartraining.edu.au/",
                    "primaryGoal": "Eligible leads and paid students",
                    "conversionEvent": "Eligible lead",
                    "trackingStatus": "unknown",
                },
                "connections": {"meta": "NOT_CONNECTED", "crm": "NOT_CONNECTED"},
            }
        ),
        encoding="utf-8",
    )
    monkeypatch.setattr(
        sys,
        "argv",
        ["agent", "company-intelligence", "--input", str(context_path)],
    )

    assert main() == 0

    output = json.loads(capsys.readouterr().out)
    assert output["mode"] == "COMPANY_INTELLIGENCE"
    assert output["companyName"] == "Five Star Training Academy"
    assert output["strategySynthesis"]["status"] == "WAITING_FOR_CLIENT_INPUT"


def test_main_diagnoses_performance_with_strategy_evidence(tmp_path, monkeypatch, capsys) -> None:
    current_path = tmp_path / "current.json"
    baseline_path = tmp_path / "baseline.json"
    strategy_path = tmp_path / "strategy.json"
    current_path.write_text(
        json.dumps({"spend": 1000, "impressions": 100000, "clicks": 700, "conversions": 35}),
        encoding="utf-8",
    )
    baseline_path.write_text(
        json.dumps({"spend": 1000, "impressions": 100000, "clicks": 1200, "conversions": 60}),
        encoding="utf-8",
    )
    strategy_path.write_text(
        json.dumps(
            {
                "evidence": [
                    {
                        "sourceId": "course-source",
                        "classification": "COURSE_GUIDANCE",
                        "supports": "Use structured testing.",
                    }
                ]
            }
        ),
        encoding="utf-8",
    )
    monkeypatch.setattr(
        sys,
        "argv",
        [
            "agent",
            "diagnose",
            "--current",
            str(current_path),
            "--baseline",
            str(baseline_path),
            "--strategy",
            str(strategy_path),
        ],
    )

    assert main() == 0

    output = json.loads(capsys.readouterr().out)
    assert output["mode"] == "ANALYST"
    assert output["experimentPlan"]["primaryVariable"] == "creative"
