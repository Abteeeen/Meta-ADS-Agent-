# Main Workflow

The generic agent begins with a business brief and returns a workflow plan. It does not make a claim about performance, build ads, or suggest scaling until the relevant inputs are present and tracking is verified.

```text
Business context -> Measurement readiness -> Strategy -> Launch QA -> Learning loop
```

## Run it

```bash
python -m agent workflow --input examples/business-brief.example.json
```

## Current boundary

This first vertical slice is deterministic orchestration. It tells an operator what can safely happen next. The next increment will use reviewed research to produce an evidence-led strategy brief through the response contract, then add launch-QA and diagnostic outputs.
