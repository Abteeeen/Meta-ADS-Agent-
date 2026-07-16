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
