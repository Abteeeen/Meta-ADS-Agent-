# Company Intelligence Run

The Company Intelligence Run is the agent's first operating mode for a new client. It does not begin by asking the operator for every field in a form. It schedules bounded specialist work and separates unknowns by how they should be resolved.

| Gap route | Meaning | Example |
| --- | --- | --- |
| `AUTO_DISCOVER` | Research it from approved public sources. | Public offer, locations, competitor positioning. |
| `CLIENT_CONFIRM` | The company owns the answer and must confirm it. | Budget, available seats, approved claims, qualified-lead definition. |
| `CONNECT_READ` | Read it through an approved, read-only connection. | Meta account history, CRM outcomes, tracking state. |

## Specialist jobs

1. Public company research
2. Market and audience research
3. Compliance and claim review
4. Funnel and landing audit
5. Meta account audit, only after a read-only connection
6. CRM outcome audit, only after a read-only connection

The planner receives the resulting artifacts, not raw unfiltered browsing output. It must cite evidence, keep alternatives visible, and stop for human approval before any account-changing action.
