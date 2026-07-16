# Meta Ads AI Operating System

An evidence-led AI assistant for planning, launching, auditing, diagnosing, testing, and scaling Meta advertising.

This is not an autonomous spend-management bot. The system should explain its evidence, identify missing information, distinguish platform facts from strategy, and require human approval before any account change.

## Start here

1. Read [the project plan](docs/PROJECT_PLAN.md) for scope and delivery phases.
2. Read [the work allocation](docs/WORK_ALLOCATION.md) before taking a task.
3. Follow [the source policy](docs/SOURCE_POLICY.md) for every research contribution.
4. Register a source before extracting claims from it.
5. Use the schemas in `schemas/` when adding structured research, audits, or experiment plans.

## Repository map

```text
docs/        Product decisions, architecture, workflows, and research findings
sources/     Source register and source-specific research artifacts
knowledge/   Reviewed, reusable knowledge records (created in Phase 2)
operations/  Checklists and repeatable account workflows (created in Phase 2)
decisions/   Diagnostic and decision rules (created in Phase 3)
prompts/     Agent instructions and response contracts (created in Phase 3)
schemas/     JSON Schema contracts for structured outputs and records
agent/       Application and integration code (created in Phase 3)
evals/       Evaluation cases and rubrics (created in Phase 3)
examples/    Safe, synthetic example inputs and outputs (created in Phase 2)
workspaces/  Local, company-specific operating workspaces; only the template is committed
```

## Guardrails

- Never present course advice, anecdote, or a benchmark as a Meta platform fact.
- Never invent account performance, attribution results, policy status, or API data.
- Prefer a single measurable experiment over several simultaneous changes.
- Separate observation, inference, recommendation, confidence, and required missing data.
- Do not write to a live Meta account without explicit user approval and a reviewable change plan.

## Collaboration

Codex owns the technical contracts, product architecture, implementation, and evaluations. Claude owns structured research extraction, learning material, copy/creative ideation, and agency playbooks. Both agents must use the source policy and keep their work small, reviewable, and linked to a source or decision record.

See [the full allocation](docs/WORK_ALLOCATION.md).

## Applying the system to a real company

Use the committed [company workspace template](workspaces/README.md) to apply the generic agent to a specific business. Active company folders are intentionally ignored by Git because this public repository should not contain client data or account details.

## Engineering checks

Install development dependencies and run the safety suite with:

```bash
python -m pip install -e ".[dev]"
python -m pytest
```
