# SaaS Implementation Status

**Audit date:** 2026-07-16
**Product target:** Multi-tenant Meta Ads operating system for an agency and its client companies.

## Verified Foundation

| Capability | Status | Evidence |
| --- | --- | --- |
| Agency organization and company hierarchy | Implemented | `organizations`, `organization_members`, `companies`, and `company_profiles` tables. |
| Private company workspace | Implemented for the first client flow | Email sign-in, organization bootstrap, multi-company creation, structured onboarding, company selection, and client access are available in the web app. |
| Tenant isolation | Implemented with regression coverage | All current public tables have RLS enabled. Organization and company memberships are tested as separate scopes. |
| Client roles and invitations | Implemented | Operators can issue hashed, expiring invitations for client admins and viewers; acceptance requires the matching authenticated email. |
| Agency team invitations | Not implemented | Organization roles exist, but inviting additional agency owners, operators, or viewers still needs a dedicated flow. |
| Company memory and evidence | Implemented | Company memory, evidence gaps, knowledge documents, reviewed claims, and retrieval tables are present. |
| Intelligence orchestration | Implemented | Company Intelligence Run records bounded specialist tasks and routes unknowns to research, client confirmation, or an approved connection. |
| Human approval records | Implemented for agent artifacts | The workspace can create, approve, and reject stored requests. No campaign-write approval workflow exists yet. |
| Meta integration | Not implemented | No OAuth callback, token vault, asset discovery, API adapter, synchronization, or write endpoint exists. |
| Campaign drafts and paused creation | Not implemented | There is no normalized campaign-draft model or Meta write layer. |
| CRM and outcome learning | Architecture only | The connection placeholder and lead-quality model exist; ingestion and attribution are not implemented. |
| LLM-backed agent execution | Not implemented | The Python modes are deterministic and evidence-aware. No model provider, background execution, or live research worker is configured. |
| Production operations | Partial | Private site deployment and environment variables exist. Health checks, worker queues, backup procedure, Docker workflow, and staging mocks are still required. |

## Current Database Baseline

The connected Supabase project contains nine applied migrations and twenty-one RLS-enabled public tables. It includes organization/company membership, onboarding, evidence and memory, intelligence runs, approval records, and reviewed global knowledge.

Security Advisor returned no active security findings on the audit date. The Performance Advisor still reports policy-shape and unused-index suggestions; these are tracked as a hardening task before broad client rollout, not silently treated as security clearance.

## Explicit Non-Claims

- The product does not connect to Meta, HubSpot, Google Analytics, or any CRM yet.
- The product cannot inspect a Meta account, create an ad, publish an ad, change spend, or send conversion data.
- The product does not hold Meta, CRM, or LLM credentials in browser code.
- A company workspace is not proof that the client has approved a strategy, claim, creative, campaign, or integration scope.

## Delivery Sequence

1. **Milestone 1: Audit and foundation guards** - record the baseline; maintain RLS and secret-exposure regression checks; remove unsafe findings.
2. **Milestone 2: Multi-tenant onboarding** - client invitations, company selector, intake, and role-aware access are implemented. Agency-team invitations, role management, invitation revocation UI, and the complete company status lifecycle remain.
3. **Milestone 3: Meta read-only integration** - server-only OAuth, encrypted token references, asset discovery, mock adapter, normalized read sync, and clear connection failures.
4. **Milestone 4: Intelligence workspaces** - source-linked strategy, creative, diagnosis, reporting, and retrieval using only approved company context and synced data.
5. **Milestone 5: Drafts and approvals** - normalized paused campaign drafts, exact change previews, approval center, audit log, and mocked write tests.
6. **Milestone 6: Learning and operations** - CRM/CAPI architecture, outcome feedback, background workers, health checks, deployment, backups, and controlled pilot evaluation.

## Credentials Still Required Later

- A Meta developer app with approved product access, redirect URL, and app secret, configured only in server-side environment variables.
- A client-authorized Meta Business portfolio, ad account, Page, Instagram account, and Dataset/Pixel for each company.
- A CRM OAuth/private-app connection with approved, minimal scopes.
- An LLM provider key and an explicit model/cost policy.

No credential should be collected in a browser form, committed to this repository, or placed in `NEXT_PUBLIC_*` environment variables.
