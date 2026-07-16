# Company Workspaces

The core project teaches reusable Meta Ads practice. A company workspace applies that practice to one real business, preserving its offer, customer understanding, tracking, campaign decisions, experiments, and results.

## Important privacy rule

This repository is public. Only the committed `_template` belongs here. Real folders under `workspaces/<company-slug>/` are ignored by Git by default because they may contain client information, account data, creative, URLs, and commercial decisions.

Use a private repository only when the business explicitly approves collaboration and the workspace has been reviewed for secrets and personal data. Do not commit credentials, access tokens, exports with personal data, or unredacted screenshots anywhere.

## Create a workspace

1. Copy `_template` to `workspaces/<company-slug>/`.
2. Update `workspace.json` using `schemas/workspace-manifest.schema.json`.
3. Complete `business-profile.md`, then `offer-and-positioning.md`, `customer-research.md`, and `measurement-plan.md` before requesting a campaign plan.
4. Keep every campaign or optimization decision in `decision-log.md`.
5. Complete `weekly-review.md` before making the next week's changes.

## Folder map

```text
workspaces/<company-slug>/
  workspace.json
  business-profile.md
  offer-and-positioning.md
  customer-research.md
  measurement-plan.md
  campaign-brief.md
  creative-brief.md
  decision-log.md
  weekly-review.md
  audits/
  experiments/
  creative-library/
```
