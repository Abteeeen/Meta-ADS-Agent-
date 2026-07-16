# Lead Quality Operating Playbook

## Purpose

More leads is not the same as more revenue. This playbook governs how the agent helps a company move from an ad interaction to a business-defined valuable outcome without pretending that Meta, a chat flow, or an AI agent can decide facts that only the company can verify.

## The operating loop

```text
Meta ad -> form, website, or message -> CRM -> human follow-up -> outcome status
    ^                                                                  |
    |---------------- approved conversion feedback -------------------|
```

1. Define the business outcome: for example, `eligible lead`, `booked call`, `enrolment started`, or `paid student`.
2. Capture leads through an appropriate route.
3. Record the company-approved outcome in the CRM.
4. Send a privacy-reviewed, approved downstream conversion event back to Meta when the integration and event quality support it.
5. Compare quality and commercial outcomes by campaign, location, creative, and route before changing budget or targeting.

## Lead routes to test

| Route | Best use | Qualification mechanism | Main risk |
| --- | --- | --- | --- |
| Meta instant form | Fast mobile lead capture | Explicit approved questions and a review step | Optimising for form volume alone can produce low-intent enquiries. |
| Website form | Higher-consideration offers or detail-heavy choices | Course, date, location, and next-step information on the page | Friction can reduce conversion rate; tracking must work. |
| Click to WhatsApp or messaging | Questions that are better answered in a conversation | Short approved chat flow, then a human hand-off | A message does not equal a qualified lead; response capacity and privacy matter. |
| Mixed lead strategy | Learning which route produces the right downstream result | Compare matched creative/audience cohorts | Do not declare a winner from cost per lead alone. |

## WhatsApp and messaging design

Meta supports lead ads that open a conversation in WhatsApp, Messenger, or Instagram Direct. For a course provider, messaging is a *testable qualification route*, not a replacement for a CRM or enrolment process.

Use a short, approved flow:

1. Confirm the intended course or learning goal.
2. Ask the preferred location or whether the person can attend the advertised location.
3. Ask the preferred course date or timing.
4. Explain what happens next and request a call or SMS preference.
5. Create or update the HubSpot contact and assign follow-up ownership.

Do not ask for criminal history, health information, identity documents, or other sensitive eligibility information in an ad, instant form, or automated chat. Mark those cases for an approved human process.

## What the agent should do

- Build campaign, ad-set, creative, landing-page, instant-form, and chat-flow drafts from approved inputs.
- Generate multiple creative concepts and copy variants, each tied to one audience tension and one approved claim.
- Check required fields, campaign objectives, conversion locations, tracking, lead questions, course/date availability, disclaimers, and claim approvals before launch.
- Ingest approved performance and CRM outcome data; flag weak hand-off speed, high duplicate rates, falling qualification rate, or a mismatch between cheap leads and paid outcomes.
- Propose one experiment at a time with a hypothesis, guardrail, success measure, owner, and review date.
- Keep a decision log and require a human approval before publishing, materially changing budget, or using a new claim.

## What the agent must not do

- Decide whether a person is legally eligible, fundable, licensable, or admitted to a course.
- Promise a licence, employment outcome, funding entitlement, seat availability, course completion, or advertising result.
- Automatically spend money, publish ads, message leads, or send conversion data without the agreed permissions and human approval.
- Treat a single platform metric, such as CTR, cost per lead, or a short-lived sales result, as proof of causation.

## Diagnostic order when lead quality is poor

1. **Definition:** Does the company have one written definition of a quality lead and a paid customer?
2. **Measurement:** Can HubSpot reliably show source, campaign, form/chat route, outcome, owner, and timestamps?
3. **Response:** Are leads contacted within the agreed response window and is the attempt recorded?
4. **Qualification:** Are the form or chat questions filtering for genuine course/location/timing fit without collecting sensitive information too early?
5. **Offer:** Are price, funding, dates, locations, and next steps clear before a person submits?
6. **Creative:** Does the ad attract the intended learner rather than vague curiosity?
7. **Delivery:** Is Meta being optimised for lead volume, a quality event, a conversation, or a later business outcome?
8. **Experiment:** Change one material variable, then wait for enough outcome data before acting again.

## Common edge cases and owners

| Edge case | Agent response | Human owner |
| --- | --- | --- |
| Duplicate lead | Detect matching contact and preserve source history. | Sales/CRM owner decides merge and follow-up. |
| Wrong location or no suitable date | Mark as not-ready; do not count it as a qualified local lead. | Enrolment team offers alternatives. |
| No seats available | Pause or reroute the relevant campaign recommendation. | Course operations confirms capacity. |
| Funding or licence uncertainty | Mark as `requires verification`; suppress eligibility promises. | Approved enrolment/compliance owner. |
| No response within service level | Alert the assigned owner and record the delay. | Sales manager resolves. |
| Ad rejection or account restriction | Preserve the rejected draft and policy reason; propose compliant revision. | Approved advertiser submits/reviews. |
| Tracking or CRM outage | Mark data incomplete and freeze outcome-based optimisation advice. | Technical owner restores integration. |
| Low volume of quality events | Keep the event as measurement, not an overconfident optimisation target. | Marketing owner chooses a staged test. |
| Conflicting evidence | Surface both sources and require a decision record. | Campaign owner approves the next experiment. |

## Five Star discovery gaps

For Five Star Training Academy, public research establishes the CPP20218 offer, major locations, and public course/date routes. It cannot establish the following:

- Brisbane and Gold Coast intake dates, seats, cut-off dates, and which course variants are currently sellable.
- Actual monthly ad spend, campaign history, cost per lead, qualification rate, enrolment rate, and cost per paid student.
- Existing lead-form questions, landing-page conversion rate, Pixel/Dataset and Conversions API state, Meta attribution settings, or active ads.
- HubSpot lifecycle definitions, owner assignment, phone/SMS attempt timestamps, duplicate handling, and which contacts become paid students.
- Current approved creative library, testimonial consents, course/funding/licence wording, and campaign claim approver.

These are client-owned inputs. They must be collected through a secure workspace, never guessed from public information or committed to a public repository.

## Recommended first test for Five Star

1. Use Brisbane and Gold Coast as distinct routes, not one all-Queensland campaign.
2. Run the existing form journey as the control.
3. Test one alternative route: an approved, short click-to-message flow or a higher-intent instant form.
4. Hold creative, broad audience approach, budget, and follow-up service level as comparable as practical.
5. Score both routes by `eligible lead rate`, `contacted within one day`, `enrolment started`, and `paid student`, not cost per form alone.
6. Do not call the test successful until the CRM outcomes are complete enough to compare.
