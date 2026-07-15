# Source Policy

## Why this exists

Meta Ads advice becomes unsafe when platform behavior, a creator's workflow, an agency preference, and an anecdote are blended into one confident answer. This policy keeps the system honest about what it knows.

## Source classifications

| Classification | Meaning | Example use |
| --- | --- | --- |
| `PLATFORM_FACT` | Directly supported by current official Meta documentation or product behavior | API fields, policy requirements, account setup steps |
| `COURSE_GUIDANCE` | Advice taught in a course or tutorial | A campaign structure taught by a creator |
| `AGENCY_RULE` | An internal operating preference | A QA checklist or client handoff policy |
| `HYPOTHESIS` | A plausible but unverified explanation | "Creative fatigue may be contributing" |
| `CASE_STUDY` | A context-specific reported outcome | A creator's account result |
| `OUTDATED_OR_UNVERIFIED` | Material that cannot currently support a recommendation | Old UI instructions or unsourced benchmarks |

## Evidence hierarchy

1. Current official Meta product, API, and advertising-policy documentation.
2. Direct account data with defined dates, attribution settings, and enough context.
3. Well-documented experiments or case studies.
4. Reputable course guidance and practitioner patterns.
5. Comments, anecdotes, and unsupported claims.

Lower-ranked evidence can inspire a hypothesis but cannot become a platform fact.

## Required fields for a source

- Stable identifier and URL
- Title, author/publisher, and publication date when available
- Source type and extraction date
- Relevant platform or API version, when applicable
- Notes about access, reliability, and known limitations

## Required fields for every claim

- Exact claim or faithful paraphrase
- Source identifier and location within source
- Classification and confidence
- Validity status and review date
- Conditions, limitations, and conflicts

## Writing rules

- Cite a platform fact only after checking official documentation current at the time of review.
- Mark dates on UI steps because Meta changes its interface frequently.
- Do not turn a comment into a benchmark, universal rule, or causal explanation.
- Never claim a winning ad, attribution result, or policy approval without account evidence.
- When data is incomplete, ask for it or explain the limits rather than guessing.

## Source retirement

Mark records `OUTDATED_OR_UNVERIFIED` when documentation changes, a source loses context, or an instruction cannot be reproduced. Keep the record for traceability; do not delete it silently.
