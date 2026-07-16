"""Deterministic retrieval for reviewed research claims."""

from __future__ import annotations

import re
from typing import Any


USABLE_STATUSES = {"ACTIVE", "NEEDS_REVIEW"}
USABLE_CLASSIFICATIONS = {"PLATFORM_FACT", "COURSE_GUIDANCE", "AGENCY_RULE", "CASE_STUDY"}


def select_relevant_claims(
    claims: list[dict[str, Any]], query: str, maximum: int = 3
) -> list[dict[str, Any]]:
    """Return the highest-relevance usable claims without known contradictions."""

    query_terms = _terms(query)
    ranked = sorted(
        (
            (claim, _relevance_score(claim, query_terms))
            for claim in claims
            if _is_usable(claim)
        ),
        key=lambda item: (-item[1], str(item[0].get("id", ""))),
    )

    selected: list[dict[str, Any]] = []
    selected_ids: set[str] = set()
    for claim, _score in ranked:
        conflicts = {str(item) for item in claim.get("conflictsWith", [])}
        if conflicts & selected_ids:
            continue
        selected.append(claim)
        claim_id = str(claim.get("id", ""))
        if claim_id:
            selected_ids.add(claim_id)
        if len(selected) == maximum:
            break
    return selected


def _is_usable(claim: dict[str, Any]) -> bool:
    return (
        claim.get("status") in USABLE_STATUSES
        and claim.get("classification") in USABLE_CLASSIFICATIONS
        and all(claim.get(field) for field in ("sourceId", "classification", "statement"))
    )


def _relevance_score(claim: dict[str, Any], query_terms: set[str]) -> int:
    statement_terms = _terms(str(claim["statement"]))
    condition_terms = _terms(" ".join(str(item) for item in claim.get("conditions", [])))
    return (len(statement_terms & query_terms) * 2) + len(condition_terms & query_terms)


def _terms(text: str) -> set[str]:
    return {term for term in re.findall(r"[a-z0-9]+", text.lower()) if len(term) > 1}
