"""Regression guards for the multi-tenant SaaS foundation."""

from pathlib import Path


MIGRATIONS = Path("web/supabase/migrations")
PUBLIC_TABLES = (
    "organizations",
    "organization_members",
    "companies",
    "company_profiles",
    "agent_runs",
    "metric_snapshots",
    "experiments",
    "decision_log",
    "knowledge_documents",
    "knowledge_claims",
    "company_memory_items",
    "lead_quality_definitions",
    "integration_connections",
    "intelligence_runs",
    "intelligence_tasks",
    "intelligence_artifacts",
    "evidence_gaps",
    "approval_requests",
    "company_members",
    "company_invitations",
    "company_onboarding",
)


def test_every_current_public_data_table_enables_row_level_security() -> None:
    sql = "\n".join(path.read_text(encoding="utf-8").lower() for path in MIGRATIONS.glob("*.sql"))

    for table in PUBLIC_TABLES:
        assert f"alter table public.{table} enable row level security" in sql


def test_privileged_helpers_are_not_defined_as_public_security_definer_functions() -> None:
    helpers = (MIGRATIONS / "0005_private_security_helpers.sql").read_text(encoding="utf-8").lower()

    assert "create or replace function private.bootstrap_organization" in helpers
    assert "create or replace function private.is_company_member" in helpers
    assert "create or replace function public.bootstrap_organization" in helpers
    public_function = helpers.split("create or replace function public.bootstrap_organization", maxsplit=1)[1]
    assert "security invoker" in public_function.split("create or replace function public.is_company_member", maxsplit=1)[0]


def test_client_membership_is_company_scoped_and_uses_the_existing_private_helpers() -> None:
    sql = (MIGRATIONS / "0007_client_workspace_onboarding.sql").read_text(encoding="utf-8").lower()

    assert "create table public.company_members" in sql
    assert "role in ('client_admin', 'client_viewer')" in sql
    assert "create table public.company_invitations" in sql
    assert "invite_token_hash" in sql
    assert "create table public.company_onboarding" in sql
    assert "create or replace function private.is_company_member" in sql
    assert "create or replace function private.can_operate_company" in sql
    assert "for all to authenticated" in sql


def test_client_members_can_read_only_their_company_and_profile_without_agency_membership() -> None:
    sql = (MIGRATIONS / "0008_company_member_access.sql").read_text(encoding="utf-8").lower()

    assert "drop policy \"members can read companies in their organization\"" in sql
    assert "drop policy \"owners and operators can create companies\"" in sql
    assert "company members can read their company" in sql
    assert "company members can read their profile" in sql
    assert "public.is_company_member" in sql
    assert "agency operators can create companies" in sql


def test_browser_code_does_not_reference_server_only_secrets() -> None:
    browser_source = "\n".join(
        path.read_text(encoding="utf-8").lower()
        for path in Path("web/app").rglob("*.ts*")
    )

    for forbidden in ("service_role", "meta_app_secret", "meta_access_token", "hubspot_access_token", "openai_api_key"):
        assert forbidden not in browser_source
