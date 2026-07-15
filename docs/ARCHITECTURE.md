# Architecture Boundaries

## Layers

```text
Sources -> Reviewed knowledge -> Retrieval and rules -> Agent modes -> Human review -> Optional Meta API
```

### Sources

Raw transcripts, official documentation, account exports, course material, and comments. These are not answers by themselves.

### Reviewed knowledge

Normalized source and claim records with classifications, dates, evidence locations, confidence, and conflict notes.

### Retrieval and rules

Retrieval finds relevant reviewed claims. Deterministic validation checks missing inputs, restricted claims, source freshness, and output schema conformance.

### Agent modes

Each mode receives only its needed context and returns an explicit response contract. It must separate facts, assumptions, hypotheses, and recommended action.

### Human review

The human approves strategic choices and any future account-impacting operation. The system should make the review easy, not bypass it.

### Optional Meta API

Start read-only. Preserve query time, account scope, field names, date ranges, attribution context, and raw-response lineage. Writes are out of scope until a separately approved security and authorization design exists.

## Trust boundaries

- Secrets stay in local environment variables or a managed secret store, never in the repository.
- Account data is minimized, redacted for examples, and traceable to its origin.
- Recommendations cannot imply API access or live account state when only user-entered data is available.
- Policy checks cite policy sources and should state that final enforcement decisions belong to Meta.
