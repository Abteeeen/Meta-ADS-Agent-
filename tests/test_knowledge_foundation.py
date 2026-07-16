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
