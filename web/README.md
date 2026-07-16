# Meta Ads Agent Web App

The web app is the private operator interface for the Meta Ads workflow. It is intentionally separate from the public knowledge base: source claims stay in the repository, while company profiles, decisions, metrics, and approvals belong in Supabase.

## Current state

The dashboard can run in demo mode without credentials. When public Supabase variables are set, it supports email sign-in and secure organization/company workspace creation. It does not connect to a Meta account or AI provider, and it cannot publish ads.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/0001_workspace_foundation.sql`, `supabase/migrations/0002_auth_bootstrap.sql`, then `supabase/migrations/0003_knowledge_foundation.sql`, in the SQL editor or through the Supabase CLI.
3. Copy `.env.example` to `.env.local` and set the project URL plus either a publishable key or anonymous key.
4. In Supabase Auth URL Configuration, add local and deployed dashboard URLs as redirect URLs for magic-link sign-in.
4. Keep the service-role key server-only. Do not add it to browser code or commit it.

The migration is multi-company from the beginning: every company record is associated with an organization, and Row-Level Security limits records to the signed-in member's organization. The service-role key must remain server-only and must never be committed.

The knowledge migration adds source-linked, reviewed claims and full-text retrieval. It seeds only short paraphrased claims from official sources, not copies of third-party documentation. Semantic embeddings and an AI model remain a later, separately approved integration.
