"""Plan bounded specialist work for a company's marketing intelligence run."""

from __future__ import annotations

from typing import Any


PUBLIC_FACTS = ("offer", "market", "landingDestination", "primaryGoal", "conversionEvent")
CLIENT_CONFIRMATIONS = (
    (
        "monthlyBudget",
        "Monthly budget",
        "Budget is a commercial constraint and cannot be inferred safely from public research.",
        "HIGH",
    ),
    (
        "capacityAndCourseDates",
        "Capacity and course dates",
        "Availability changes and must be confirmed by the company before any campaign recommendation.",
        "HIGH",
    ),
    (
        "leadQualityDefinition",
        "Lead-quality definition",
        "The sales team must define the approved criteria for an eligible lead.",
        "HIGH",
    ),
    (
        "approvedClaims",
        "Approved claims",
        "Only the company and compliance owner can approve course, funding, outcome, and testimonial wording.",
        "HIGH",
    ),
)


def build_company_intelligence_plan(context: dict[str, Any]) -> dict[str, Any]:
    """Route company discovery work before strategy synthesis.

    Public research, client confirmations, and account connections have different
    trust boundaries. The plan makes that distinction explicit so an operator is
    asked only for facts that cannot be discovered or read from an approved tool.
    """

    known_facts = context.get("knownFacts", {})
    connections = context.get("connections", {})
    public_gaps = [field for field in PUBLIC_FACTS if _missing(known_facts.get(field))]
    client_questions = _client_questions(known_facts)
    integration_requests = _integration_requests(context, known_facts, connections)
    jobs = _specialist_jobs(known_facts, connections, public_gaps)

    ready_for_synthesis = not public_gaps and not client_questions and not integration_requests
    strategy_status = "READY_FOR_SYNTHESIS" if ready_for_synthesis else _strategy_waiting_status(
        public_gaps, client_questions, integration_requests
    )

    return {
        "mode": "COMPANY_INTELLIGENCE",
        "companyName": _company_name(context),
        "overallStatus": "READY_FOR_SYNTHESIS" if ready_for_synthesis else "NEEDS_EVIDENCE",
        "specialistJobs": jobs,
        "autoDiscoveryGaps": [
            _gap(field, _label(field), "AUTO_DISCOVER", "HIGH", "Run the relevant research specialist.")
            for field in public_gaps
        ],
        "questionQueue": client_questions,
        "integrationRequests": integration_requests,
        "strategySynthesis": {
            "status": strategy_status,
            "rule": "Synthesis may use approved evidence and must label assumptions, conflicts, and unresolved gaps.",
        },
    }


def _specialist_jobs(
    known_facts: dict[str, Any], connections: dict[str, Any], public_gaps: list[str]
) -> list[dict[str, Any]]:
    return [
        _job("PUBLIC_COMPANY_RESEARCH", "Research the offer, locations, public proof, and public journey.", "READY"),
        _job("MARKET_AND_AUDIENCE_RESEARCH", "Research audience tensions, alternatives, and market language.", "READY"),
        _job(
            "COMPLIANCE_AND_CLAIM_REVIEW",
            "Check proposed claims against approved company and regulatory evidence.",
            "READY" if not public_gaps else "WAITING_FOR_RESEARCH",
        ),
        _job(
            "FUNNEL_AND_LANDING_AUDIT",
            "Audit the enquiry destination, qualification route, and hand-off experience.",
            "READY" if not _missing(known_facts.get("landingDestination")) else "WAITING_FOR_RESEARCH",
        ),
        _job(
            "META_ACCOUNT_AUDIT",
            "Inspect campaign, ad, placement, attribution, and delivery history in read-only mode.",
            _connection_job_status(connections.get("meta")),
        ),
        _job(
            "CRM_OUTCOME_AUDIT",
            "Inspect aggregated lead-quality, contact, enrolment, and paid-student outcomes.",
            _connection_job_status(connections.get("crm")),
        ),
    ]


def _client_questions(known_facts: dict[str, Any]) -> list[dict[str, str]]:
    return [
        _gap(key, label, "CLIENT_CONFIRM", priority, reason)
        for key, label, reason, priority in CLIENT_CONFIRMATIONS
        if _missing(known_facts.get(key))
    ]


def _integration_requests(
    context: dict[str, Any], known_facts: dict[str, Any], connections: dict[str, Any]
) -> list[dict[str, str]]:
    requests: list[dict[str, str]] = []
    if context.get("accountMaturity") == "EXISTING_ACCOUNT" and connections.get("meta") != "READ_ONLY_CONNECTED":
        requests.append(
            _gap(
                "metaAccountHistory",
                "Meta account history",
                "CONNECT_READ",
                "MEDIUM",
                "Connect Meta in read-only mode to audit campaigns and delivery history.",
            )
        )
    if connections.get("crm") != "READ_ONLY_CONNECTED":
        requests.append(
            _gap(
                "crmOutcomeData",
                "CRM outcome data",
                "CONNECT_READ",
                "MEDIUM",
                "Connect the CRM in read-only mode to compare lead quality with paid outcomes.",
            )
        )
    if _missing(known_facts.get("trackingStatus")):
        requests.append(
            _gap(
                "trackingStatus",
                "Tracking status",
                "CONNECT_READ",
                "HIGH",
                "Verify the current tracking setup through an approved technical audit.",
            )
        )
    return requests


def _strategy_waiting_status(
    public_gaps: list[str], client_questions: list[dict[str, str]], integration_requests: list[dict[str, str]]
) -> str:
    if public_gaps:
        return "WAITING_FOR_RESEARCH"
    if client_questions:
        return "WAITING_FOR_CLIENT_INPUT"
    if integration_requests:
        return "WAITING_FOR_CONNECTION"
    return "WAITING_FOR_EVIDENCE"


def _connection_job_status(value: Any) -> str:
    return "READY" if value == "READ_ONLY_CONNECTED" else "WAITING_FOR_CONNECTION"


def _job(job_id: str, purpose: str, status: str) -> dict[str, str]:
    return {"id": job_id, "purpose": purpose, "status": status}


def _gap(key: str, label: str, route: str, priority: str, reason: str) -> dict[str, str]:
    return {"key": key, "label": label, "route": route, "priority": priority, "reason": reason}


def _label(field: str) -> str:
    labels = {
        "offer": "Offer",
        "market": "Market",
        "landingDestination": "Landing destination",
        "primaryGoal": "Primary goal",
        "conversionEvent": "Conversion event",
    }
    return labels.get(field, field)


def _company_name(context: dict[str, Any]) -> str:
    value = context.get("companyName")
    return value.strip() if isinstance(value, str) and value.strip() else "Unnamed company"


def _missing(value: Any) -> bool:
    if isinstance(value, bool):
        return not value
    if isinstance(value, (int, float)):
        return value <= 0
    return not isinstance(value, str) or not value.strip()
