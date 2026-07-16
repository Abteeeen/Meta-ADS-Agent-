# First 30 Days

A practical onboarding plan for one operator running Meta Ads for one real
company. Work top to bottom: do not launch spend before discovery and setup
validation are complete. Fill in dates and owners; keep every account change
in `decision-log.md`.

This plan is operating guidance, not a Meta platform specification. Where it
mentions platform behavior (learning phase, attribution, event setup),
confirm the current details in official Meta documentation before relying on
them — see `docs/SOURCE_POLICY.md`.

- Company slug:
- Operator (accountable owner):
- Start date:
- Target first-launch date:
- Total budget available for this 30-day window:

---

## Phase 1 — Discovery (roughly days 1–7)

Goal: understand the business well enough that recommendations are specific to
it, not generic best practice.

| Task | Feeds | Owner | Done when | Date |
| --- | --- | --- | --- | --- |
| Complete `client-intake.md` | Everything below | | Offer, economics, access, assets, constraints captured | |
| Complete `business-profile.md` | Objective and economics | | Commercial goal and target economics are explicit | |
| Complete `offer-and-positioning.md` | Creative angles | | Buyer promise, proof, and objections written | |
| Complete `customer-research.md` and start `creative-research.md` | Creative and audience | | At least one priority segment and its top pains/objections captured | |

Exit criteria: you can state the business goal, the conversion event, the
target CPA/CAC or ROAS, and the single priority customer segment in plain
language.

Do not yet: pick campaign settings, write ads, or promise a result.

---

## Phase 2 — Setup validation (roughly days 5–12, may overlap Phase 1)

Goal: prove that what happens in the account can be trusted before spending on
it. Tracking that is wrong is worse than no tracking.

| Task | Feeds | Owner | Done when | Date |
| --- | --- | --- | --- | --- |
| Complete `measurement-plan.md` | Decision thresholds | | Source of truth, event, attribution context agreed | |
| Confirm access (Business Manager, ad account, page, pixel/dataset, payment) | Launch readiness | | Operator has the roles needed to build and read results | |
| Verify tracking end to end with a real test action | Trust in results | | The intended event fires and is visible in the system of record | |
| Run `launch-qa.md` for setup items | Launch readiness | | Tracking, domain, billing, and access items pass with evidence | |

Exit criteria: a test conversion is visible in both Meta and the business
system of record, and the discrepancy between them is understood.

Do not yet: scale, add many ad sets, or interpret early numbers as
performance.

Never store passwords, access tokens, or card details in the workspace.
Record only who holds which access.

---

## Phase 3 — First campaign (roughly days 10–18)

Goal: launch one deliberately simple campaign that can produce a readable
learning, not a complex structure that hides cause and effect.

| Task | Feeds | Owner | Done when | Date |
| --- | --- | --- | --- | --- |
| Draft `campaign-brief.md` (one campaign, one hypothesis) | Launch | | Objective, audience approach, budget hypothesis, and unknowns written | |
| Build creative from `creative-research.md` into `creative-brief.md` | Launch | | Each concept names its single test variable | |
| Complete `launch-qa.md` fully and get approval | Go/no-go | | Every blocker resolved or explicitly accepted by the owner | |
| Launch and log it in `decision-log.md` | Learning loop | | Launch recorded with date, budget, and expected outcome | |

Exit criteria: campaign is live, its expected outcome and guardrail are
written down, and the approval is on record.

Do not yet: change budgets or creative in the first days out of impatience.
Note the planned minimum evidence window from `measurement-plan.md`.

---

## Phase 4 — Learning loop (roughly days 15–30, then repeating)

Goal: turn spend into evidence and make one deliberate change at a time.

| Task | Cadence | Owner | Done when | Date |
| --- | --- | --- | --- | --- |
| Check delivery and tracking health (not performance verdicts) | Early, then as needed | | Confirmed ads are delivering and events still fire | |
| Reach the agreed minimum evidence window before judging results | Per `measurement-plan.md` | | Enough data to compare against the threshold | |
| Complete `weekly-review.md` | Weekly | | Facts, interpretation, caveats, and next action separated | |
| Send `reporting-note.md` to the client | Weekly | | Client has a plain-language summary and the "not changing yet" list | |
| Record every change in `decision-log.md` before making it | Each change | | One primary variable per change, with a guardrail | |

Exit criteria for the 30 days: at least one full review cycle completed, one
evidence-based decision made and logged, and a clear plan for the next 30
days.

---

## End-of-window summary (fill in around day 30)

- What the business goal was, and how close we are:
- What the account and tracking can now be trusted to tell us:
- The single strongest evidence-based learning so far:
- The biggest remaining unknown:
- Recommended focus for days 31–60:
- What should explicitly not change yet:
