# Meta Ads Agent Web App

The web app is the private operator interface for the Meta Ads workflow. It is intentionally separate from the public knowledge base: source claims stay in the repository, while company profiles, decisions, metrics, and approvals belong in Supabase.

## Current state

The dashboard uses demo data for a security-course agency. It has no connected Supabase project, AI provider, or Meta account. It cannot publish ads.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/0001_workspace_foundation.sql` in the SQL editor or through the Supabase CLI.
3. Copy `.env.example` to `.env.local` and set the project URL and anonymous key.
4. Keep the service-role key server-only. Do not add it to browser code or commit it.

The migration is multi-company from the beginning: every company record is associated with an organization, and Row-Level Security limits records to the signed-in member's organization.
