"""Command-line entry point for the Meta Ads operator workflow."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from agent.workflow import build_workflow_plan


def main() -> int:
    parser = argparse.ArgumentParser(description="Run a Meta Ads operator workflow.")
    subparsers = parser.add_subparsers(dest="command", required=True)
    workflow_parser = subparsers.add_parser("workflow", help="Plan the next workflow steps.")
    workflow_parser.add_argument("--input", required=True, type=Path, help="Business brief JSON file.")
    args = parser.parse_args()

    brief = _load_json(args.input)
    plan = build_workflow_plan(brief)
    print(json.dumps(plan, indent=2))
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
