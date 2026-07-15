# Project Plan

## Product statement

Build a trustworthy Meta Ads AI operating system that helps a human operator make better decisions across campaign planning, launch, creative production, analysis, testing, and scaling.

The first product is a read-only, evidence-led copilot. It does not autonomously publish, pause, edit, or scale ads.

## Primary users

- Founder or small business owner who needs a guided, plain-language workflow.
- Performance marketer who needs a fast diagnostic partner and disciplined test plans.
- Agency operator who needs repeatable onboarding, QA, reporting, and change logging.

## Product modes

| Mode | Core output | Must include |
| --- | --- | --- |
| Tutor | Plain-language explanation | Definitions, source type, limits |
| Strategist | Campaign strategy brief | Objective, funnel, audience, budget assumptions, unknowns |
| Launch builder | Build specification/checklist | Campaign, ad set, ad, tracking, policy checks |
| Creative engine | Testable creative concepts | Audience tension, angle, hook, proof, CTA, test variable |
| Auditor | Pre-launch or account audit | Finding, evidence, severity, remediation, confidence |
| Analyst | Performance diagnosis | Observations, hypotheses, missing data, next test, do-not-change list |
| Experiment manager | Experiment plan | Hypothesis, variable, success metric, guardrail, duration, decision rule |
| Scaling advisor | Human-review scaling proposal | Eligibility, risk, incremental action, rollback condition |

## Non-negotiable response contract

Every consequential recommendation must state:

1. What was observed or supplied by the user.
2. What is inferred, including confidence and alternate explanations.
3. What evidence supports it and its source classification.
4. What data is missing or could change the recommendation.
5. One recommended next action and what should not change yet.

## Delivery phases

### Phase 1: Foundation

Create the repository contract, source governance, task ownership, and schemas. Seed the source register with the three provided videos and official Meta documentation.

Definition of done: a new contributor can understand scope, add evidence safely, and choose a task without a meeting.

### Phase 2: Research and operational knowledge

Import structured claims from videos, comments, and official documentation. Build beginner glossary, campaign planning checklist, launch checklist, audit taxonomy, and common diagnostic hypotheses.

Definition of done: at least 30 reviewed claims with source links, classifications, dates, and confidence; no unlabelled advice in the knowledge base.

### Phase 3: Read-only copilot MVP

Implement a local or hosted interface/API that accepts a business brief or synthetic account snapshot and returns the defined response contract for strategy, audit, and diagnosis modes.

Definition of done: each mode has validated structured output and evaluation examples; no live account write capability exists.

### Phase 4: Decision intelligence

Implement metric interpretation, testing plans, change logs, budget/scaling eligibility, and profitability-aware recommendations. Add evaluation cases for incomplete, contradictory, and misleading data.

### Phase 5: Meta integration

Add approved read-only integrations for ad account, campaign, ad set, ad, creative, and Insights data. Build an explicit human approval layer before any future write action.

## Initial success measures

- A user receives a source-aware answer instead of generic marketing advice.
- Every audit and experiment can be stored and reviewed as structured data.
- The system declines or qualifies recommendations when core business/account data is missing.
- Evaluation cases detect fabricated metrics, fake policy claims, and overconfident causal conclusions.
