"""Command-line entry point for the Meta Ads operator workflow."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from agent.launch_qa import build_launch_qa
from agent.strategy import build_strategy_brief, load_claims
from agent.workflow import build_workflow_plan


def main() -> int:
    parser = argparse.ArgumentParser(description="Run a Meta Ads operator workflow.")
    subparsers = parser.add_subparsers(dest="command", required=True)
    workflow_parser = subparsers.add_parser("workflow", help="Plan the next workflow steps.")
    workflow_parser.add_argument("--input", required=True, type=Path, help="Business brief JSON file.")
    strategy_parser = subparsers.add_parser("strategy", help="Build an evidence-led strategy brief.")
    strategy_parser.add_argument("--input", required=True, type=Path, help="Business brief JSON file.")
    strategy_parser.add_argument(
        "--claims-dir", required=True, type=Path, help="Directory containing source reviewed/claims.json files."
    )
    qa_parser = subparsers.add_parser("launch-qa", help="Audit pre-launch readiness.")
    qa_parser.add_argument("--input", required=True, type=Path, help="Business brief JSON file.")
    qa_parser.add_argument("--strategy", required=True, type=Path, help="Strategy brief JSON file.")
    qa_parser.add_argument("--checklist", required=True, type=Path, help="Launch checklist JSON file.")
    args = parser.parse_args()

    brief = _load_json(args.input)
    if args.command == "workflow":
        output = build_workflow_plan(brief)
    elif args.command == "strategy":
        output = build_strategy_brief(brief, load_claims(args.claims_dir))
    else:
        output = build_launch_qa(brief, _load_json(args.strategy), _load_json(args.checklist))
    print(json.dumps(output, indent=2))
    return 0


def _load_json(path: Path) -> dict[str, Any]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as error:
        raise SystemExit(f"Input file not found: {path}") from error
    except json.JSONDecodeError as error:
        raise SystemExit(f"Input file is not valid JSON: {path}") from error
    if not isinstance(payload, dict):
        raise SystemExit("Input JSON must be an object.")
    return payload


if __name__ == "__main__":
    raise SystemExit(main())
