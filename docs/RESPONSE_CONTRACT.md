# Agent Response Contract

Every consequential response from an agent mode must pass `agent.response_contract.validate_response` before being shown to a user or stored as a decision record.

## Required fields

| Field | Purpose |
| --- | --- |
| `mode` | Identifies the bounded agent role producing the response. |
| `dataAccess` | States whether conclusions came from user-provided, synthetic, or read-only API data. |
| `observations` | Separates supplied facts from the model's interpretation. |
| `inferences` | States an interpretation, confidence, and alternate explanations. |
| `evidence` | Links supporting knowledge to a source and source classification. |
| `missingData` | Lists inputs that could materially change the recommendation. |
| `recommendedAction` | Gives one explicit next action. |
| `doNotChangeYet` | Protects against impulsive multi-variable changes. |

## Trust rules enforced today

- Unsupported modes and data-access claims are rejected.
- At least one evidence item is required.
- Each inference needs confidence and alternative explanations.
- `PLATFORM_FACT` evidence requires an official documentation, policy, or API-reference source type.
- Observations, actions, and guardrails must be explicit and non-empty.

The validator does not determine whether a recommendation is wise. It ensures the recommendation is reviewable, falsifiable, and honest about its basis.
