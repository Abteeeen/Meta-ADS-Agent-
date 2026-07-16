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


def test_company_invites_store_only_a_hash_and_require_the_invited_identity() -> None:
    sql = (MIGRATIONS / "0009_company_invitation_flow.sql").read_text(encoding="utf-8").lower()

    assert "gen_random_bytes(32)" in sql
    assert "digest(raw_token, 'sha256')" in sql
    assert "from auth.users" in sql
    assert "signed_in_email <> invitation.email" in sql
    assert "security invoker" in sql
    assert "grant execute on function public.accept_company_invitation(text) to authenticated" in sql
    assert "create or replace function private.list_company_access" in sql
    assert "not private.can_operate_company(target_company_id)" in sql
    assert "join auth.users agency_user" in sql
    assert "join auth.users client_user" in sql


def test_browser_code_does_not_reference_server_only_secrets() -> None:
    browser_source = "\n".join(
        path.read_text(encoding="utf-8").lower()
        for path in Path("web/app").rglob("*.ts*")
    )

    for forbidden in ("service_role", "meta_app_secret", "meta_access_token", "hubspot_access_token", "openai_api_key"):
        assert forbidden not in browser_source


def test_public_runtime_config_exposes_only_supabase_publishable_values() -> None:
    route = Path("web/app/api/public-config/route.ts").read_text(encoding="utf-8").lower()

    assert "next_public_supabase_url" in route
    assert "next_public_supabase_publishable_key" in route
    assert "cache-control" in route and "no-store" in route
    assert "service_role" not in route


def test_company_insert_returning_uses_the_row_organization_for_read_access() -> None:
    sql = (MIGRATIONS / "0010_company_returning_access.sql").read_text(encoding="utf-8").lower()

    assert "create or replace function private.can_read_company_row" in sql
    assert "membership.organization_id = target_organization_id" in sql
    assert "membership.company_id = target_company_id" in sql
    assert "security invoker" in sql
    assert "using ((select public.can_read_company_row(id, organization_id)))" in sql


def test_client_growth_review_is_generic_with_a_five_star_seed() -> None:
    review_data = Path("web/app/client-growth-review-data.ts").read_text(encoding="utf-8")
    review_panel = Path("web/app/client-growth-review-panel.tsx").read_text(encoding="utf-8")

    assert "export function buildGrowthReview" in review_data
    assert "export const fiveStarGrowthReview" in review_data
    assert "primaryLocations.map" in review_data
    assert "Client validation required" in review_panel
    assert "Not connected to Meta" in review_panel
    assert "No publishing, budget or audience change without named approval" in review_data


def test_client_growth_review_supports_a_local_service_booking_model() -> None:
    review_data = Path("web/app/client-growth-review-data.ts").read_text(encoding="utf-8")
    review_panel = Path("web/app/client-growth-review-panel.tsx").read_text(encoding="utf-8")

    assert "export const ecoCleanGrowthReview" in review_data
    assert "qualified WhatsApp enquiries and booked service jobs" in review_data
    assert "Approved click-to-WhatsApp or call route" in review_data
    assert "vehicle plates blurred" in review_data
    assert "demoGrowthReviews" in review_panel
    assert "Choose client growth review" in review_panel
