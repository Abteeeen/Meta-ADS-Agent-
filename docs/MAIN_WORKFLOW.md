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

The first stage is deterministic orchestration. It tells an operator what can safely happen next. The implemented second stage uses reviewed research to produce an evidence-led strategy brief through the response contract. The next core stages are launch QA, performance diagnosis, and experiment planning.

## Strategy brief

The strategy stage consumes reviewed claims without upgrading course guidance into platform fact. Claims marked `NEEDS_REVIEW` can inform a strategy brief, but lower its inference confidence.

```bash
python -m agent strategy --input examples/business-brief.example.json --claims-dir sources/youtube
```

## Launch QA

Launch QA evaluates tracking, creative readiness, and a human policy review. A clean audit is only ready for a human approval decision; it does not publish ads.

```bash
python -m agent launch-qa --input examples/business-brief.example.json --strategy strategy.json --checklist examples/launch-checklist.example.json
```

## Performance diagnosis

The diagnosis stage compares a supplied current period with a supplied baseline. It calculates CPM, CTR, CPC, conversion rate, and CPA transparently, then proposes one controlled experiment. It does not use generic performance benchmarks as if they were account truth.

```bash
python -m agent diagnose --current examples/current-period.example.json --baseline examples/baseline-period.example.json --strategy strategy.json
```

## Pipeline orchestration

`agent.pipeline.run_pipeline` composes the complete generic workflow: readiness, strategy, launch QA, and optional diagnosis. It has no Meta write capability. A blocked business brief stops downstream stages rather than producing fabricated advice.
