from pathlib import Path


def test_knowledge_foundation_migration_has_governed_retrieval() -> None:
    migration = Path("web/supabase/migrations/0003_knowledge_foundation.sql")

    assert migration.exists()
    sql = migration.read_text(encoding="utf-8")

    assert "create table public.knowledge_documents" in sql
    assert "create table public.knowledge_claims" in sql
    assert "create or replace function public.search_knowledge" in sql
    assert "enable row level security" in sql
    assert "last_verified_at" in sql
    assert "review_due_at" in sql
    assert "order by relevance" not in sql


def test_privileged_database_helpers_are_kept_out_of_the_public_api_schema() -> None:
    sql = (Path("web/supabase/migrations/0005_private_security_helpers.sql").read_text(encoding="utf-8")).lower()

    assert "create schema if not exists private" in sql
    assert "private.bootstrap_organization" in sql
    assert "private.is_company_member" in sql
    assert "security invoker" in sql
    assert "revoke all on function public.bootstrap_organization(text) from public" in sql
