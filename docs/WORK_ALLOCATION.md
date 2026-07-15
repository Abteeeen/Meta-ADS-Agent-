# Work Allocation and Handoff Protocol

## Shared operating rules

- One task per branch and pull request.
- Claim research is not "done" until it has a source URL, source type, extraction date, claim classification, and confidence.
- Keep raw source material separate from reviewed knowledge.
- Do not modify schemas or shared contracts without calling out compatibility impact in the PR.
- Use synthetic or redacted account data only; never commit tokens, customer PII, exports, or screenshots containing private data.

## Claude ownership: research and operator experience

| Workstream | Deliverable | Acceptance criteria |
| --- | --- | --- |
| Video research | Per-video notes, chapters, claims, and comment pain points | Claims use `claim.schema.json`; advice is classified and dated |
| Beginner learning | Glossary and tutor lesson drafts | Explains acronyms; flags platform changes and unknowns |
| Creative system | Angles, hooks, scripts, copy templates, creative briefs | Every item identifies audience, hypothesis, proof, CTA, and test variable |
| Agency operations | Intake, reporting, QA, and change-log templates | Clear owner, trigger, input, output, and escalation |
| Research conflicts | Contradiction table | Contradictions remain visible; no forced consensus |

Claude should start with `sources/youtube/` and create one folder per source. Raw transcripts belong under `raw/`; structured, reviewable findings belong under `reviewed/`.

## Codex ownership: architecture and engineering

| Workstream | Deliverable | Acceptance criteria |
| --- | --- | --- |
| Repository contracts | Schemas, source policy, directory structure | JSON schemas validate representative records |
| Product architecture | Mode contracts, data models, decision boundaries | Every mode has a safe, structured output definition |
| MVP implementation | API/UI, retrieval, validation, persistence | No live write capability; errors and missing data are explicit |
| Meta integration | Read-only API adapter and normalization | Credentials remain local; data lineage is retained |
| Decision engine | Diagnostics, experiments, scaling eligibility | Distinguishes correlation from causation; preserves change history |
| Evaluation | Test fixtures, rubrics, regressions | Detects unsupported claims and unsafe recommendations |

## Cross-review protocol

1. Claude proposes knowledge and operator artifacts in a focused PR.
2. Codex validates schema compliance, source labels, and product fit.
3. Codex proposes engineering or contract changes in a focused PR.
4. Claude reviews whether language, workflow, and assumptions match real operator needs.
5. The human owner resolves product tradeoffs and approves all account-impacting actions.

## First sprint

| Owner | Task | Target artifact |
| --- | --- | --- |
| Claude | Extract the three provided videos and representative comments | `sources/youtube/<video-id>/reviewed/claims.json` |
| Claude | Draft a glossary of beginner terms found in the videos | `knowledge/glossary/` |
| Codex | Establish this foundation and seed schemas | Current branch |
| Codex | Define MVP input/output contracts and evaluation cases | `agent/` and `evals/` in Phase 3 |
| Human owner | Choose initial vertical and a synthetic example account | `examples/` |
