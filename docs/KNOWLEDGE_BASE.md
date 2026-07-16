# Governed Knowledge Base

The agent does not treat a large document dump as truth. It retrieves short, reviewed claims that always retain a source URL, classification, confidence, verification date, expiry/review date, conditions, and known conflicts.

## What is stored

- **Global knowledge:** Official Meta documentation and policy, approved regulatory guidance, and agency operating rules.
- **Company knowledge:** Client-approved offers, dates, capacity, approved claims, creative permissions, and operating rules. This belongs in the client's private Supabase workspace, not in this public repository.
- **No raw lead data:** Names, phone numbers, chat transcripts, IDs, financial details, health information, criminal-history information, and credentials do not belong in the knowledge base.

## Retrieval sequence

1. Select the company and agent mode.
2. Search approved, non-expired claims with `search_knowledge`.
3. Return claims with their source URL and verification date.
4. Treat missing, conflicted, or expired evidence as a review request instead of a fact.
5. Generate a draft only after retrieval. A person approves any client-facing, account-changing, or sensitive-data action.

## What exists now

`0003_knowledge_foundation.sql` adds secure document and claim tables, full-text retrieval, Row-Level Security, and an initial seed of short official-source claims relevant to lead quality, messaging, measurement, ad review, RTO advertising, privacy, and claim substantiation.

There is no embedding model connected yet. Full-text, source-aware retrieval works without a paid model. When an approved embedding provider is selected, vectors can be added as a second retrieval signal; citations, freshness checks, and human review remain mandatory.
