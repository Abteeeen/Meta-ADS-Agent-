# Launch QA

A pre-launch gate for one campaign. Nothing goes live until every item is
either passed with evidence or its blocker is explicitly accepted by the
accountable owner. One reviewer signs off; the owner approves spend.

For each item: record the **owner** (who verified it), the **evidence** (how it
was verified, not a promise it is fine), the **status**, and any **blocker**.

Platform behavior referenced here (event setup, attribution, Special Ad
Categories) should be confirmed against current official Meta documentation and
policy — do not treat this checklist as the authoritative platform spec.

- Company slug:
- Campaign / brief reference:
- QA date:
- Reviewer:
- Owner approving spend:

Status legend: `PASS` / `FAIL` / `N/A` / `ACCEPTED-RISK`.

## Tracking and measurement

| Check | Owner | Evidence | Status | Blocker |
| --- | --- | --- | --- | --- |
| Pixel/dataset installed and receiving events | | | | |
| Intended optimization event fires on a real test action | | | | |
| Conversions API / server events working (if used) | | | | |
| Event visible in the business system of record | | | | |
| Attribution setting matches `measurement-plan.md` | | | | |
| Domain verified (if required) | | | | |
| UTM / tracking parameters correct on destination links | | | | |

## Campaign structure

| Check | Owner | Evidence | Status | Blocker |
| --- | --- | --- | --- | --- |
| Objective and optimization event match the brief | | | | |
| Budget matches the approved hypothesis | | | | |
| Structure is simple enough to read a result | | | | |
| Schedule / start date correct | | | | |
| Naming convention followed | | | | |

## Audience and targeting

| Check | Owner | Evidence | Status | Blocker |
| --- | --- | --- | --- | --- |
| Audience matches the brief's priority segment | | | | |
| Geography, age, and language correct | | | | |
| Exclusions applied (e.g., existing customers, if intended) | | | | |
| Special Ad Category declared if applicable | | | | |

## Creative and policy

| Check | Owner | Evidence | Status | Blocker |
| --- | --- | --- | --- | --- |
| Every ad renders correctly on mobile and desktop | | | | |
| Each concept maps to a single test variable | | | | |
| All claims are true and cleared for policy/legal | | | | |
| No prohibited or restricted content | | | | |
| Primary text, headline, and CTA correct | | | | |
| Landing page matches the ad promise and loads fast | | | | |
| Landing page has required legal/privacy links | | | | |

## Budget, billing, and access

| Check | Owner | Evidence | Status | Blocker |
| --- | --- | --- | --- | --- |
| Valid payment method on the ad account | | | | |
| Spend limit / budget guardrail set as intended | | | | |
| Operator has the access needed to monitor and pause | | | | |

## Sign-off

- All blockers resolved or accepted:
- Accepted risks (list, with who accepted each):
- Expected outcome and guardrail (from the brief):
- Approved to launch by:
- Date / time launched:
- Logged in `decision-log.md`:
