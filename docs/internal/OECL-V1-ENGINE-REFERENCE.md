# OECL V1 Engine Reference

> Internal engineering reference.

This document describes every engine implemented inside OECL V1.

For every engine it documents:

* location
* public API
* inputs
* outputs
* generated artifacts
* dependencies
* execution order
* responsibilities

---

# Benchmark Engine

Location

```text
laboratory/benchmark/
```

Files

```text
BenchmarkEngine.ts
BenchmarkLoader.ts
BenchmarkResult.ts
```

Public API

```ts
aggregate(results: BatchResultSummary[]): BenchmarkResult
```

Input

```text
datasets/
```

Output

```text
benchmark-results/benchmark.json
```

Responsibilities

* Aggregate all executed datasets.
* Calculate laboratory statistics.
* Calculate validation metrics.
* Calculate protocol coverage.
* Produce global benchmark.

Executed by

```text
scripts/run-benchmark.ts
```

---

# Requirements Engine

Location

```text
laboratory/requirements/
```

Public API

```ts
analyse(...)
```

Output

```text
requirements-results/protocols.json
```

Responsibilities

* Evaluate protocol requirements.
* Determine protocol eligibility.
* Export protocol metadata.

---

# Emergent Engine

Location

```text
laboratory/emergent/
```

Public API

```ts
discover(...)
```

Output

```text
emergent-results/properties.json
```

Responsibilities

* Discover emergent properties.
* Compute confidence.
* Collect evidence.

---

# Pattern Engine

Location

```text
laboratory/patterns/
```

Public API

```ts
discover(...)
```

Output

```text
pattern-results/patterns.json
```

Responsibilities

* Detect reusable composition patterns.
* Aggregate evidence.
* Export confidence.

---

# Relationship Engine

Location

```text
laboratory/relationships/
```

Public API

```ts
build(...)
```

Output

```text
relationship-results/relationships.json
```

Responsibilities

* Build protocol graph.
* Count occurrences.
* Measure relationship confidence.

---

# Composition Matrix Engine

Location

```text
laboratory/matrix/
```

Public API

```ts
build(...)
```

Output

```text
matrix-results/composition-matrix.json
```

Responsibilities

* Compute pairwise protocol compatibility.
* Compute stability.
* Compute safety.
* Compute observed risk.
* Export composition matrix.

---

# Composition Intelligence Engine

Location

```text
laboratory/intelligence/
```

Files

```text
CompositionIntelligenceEngine.ts
CompositionIntelligenceResult.ts
```

Public API

```ts
analyse(matrix)
```

Output

```text
intelligence-results/protocol-intelligence.json
```

Responsibilities

* Analyse protocol behaviour.
* Compute averages.
* Detect strongest partner.
* Detect weakest partner.
* Explain dominant risk.
* Export supporting evidence.

---

# Composition Hypothesis Engine

Location

```text
laboratory/hypotheses/
```

Public API

```ts
generate(knowledge)
```

Output

```text
hypothesis-results/composition-hypotheses.json
```

Responsibilities

* Generate scientific hypotheses.
* Assign confidence.
* Generate validation targets.
* Produce falsifiable statements.
* Attach supporting evidence.

---

# Hypothesis Validation Engine

Location

```text
laboratory/hypothesis-validation/
```

Public API

```ts
buildPlans(hypotheses)
```

Output

```text
hypothesis-validation-results/validation-plans.json
```

Responsibilities

* Convert hypotheses into validation plans.
* Select priorities.
* Recommend scenario families.

---

# Adaptive Research Planner

Location

```text
laboratory/adaptive-research/
```

Public API

```ts
plan(knowledge)
```

Output

```text
adaptive-research-results/
```

Additional Output

```text
scenarios/adaptive/
```

Responsibilities

* Analyse high-risk compositions.
* Build adaptive plans.
* Generate executable scenarios.

---

# Scenario Loader

Location

```text
laboratory/scenario/
```

Public API

```ts
load(path)
```

Responsibilities

* Read JSON scenarios.
* Build Scenario objects.

---

# Scenario Runner

Location

```text
laboratory/scenario/
```

Public API

```ts
buildActions(...)
```

Responsibilities

* Convert Scenario into executable actions.

---

# Experiment Builder

Location

```text
laboratory/scenario/
```

Public API

```ts
build(...)
```

Responsibilities

* Create executable experiment structure.

---

# Experiment Executor

Location

```text
laboratory/engine/
```

Public API

```ts
execute(experiment)
```

Generated Artifacts

```text
datasets/

reports/
```

Responsibilities

* Execute actions.
* Build protocol states.
* Validate invariants.
* Compute properties.
* Generate datasets.
* Generate reports.

This is the execution core of OECL V1.

---

# Research Memory Engine

Location

```text
laboratory/research-memory/
```

Public API

```ts
build(campaigns)
```

Output

```text
research-memory-results/
```

Responsibilities

* Preserve campaign history.
* Aggregate statistics.
* Measure protocol coverage.

---

# Research Knowledge Engine

Location

```text
laboratory/research-knowledge/
```

Public API

```ts
build(...)
```

Output

```text
knowledge-results/research-knowledge.json
```

Responsibilities

Aggregate every scientific artifact into one structured document.

---

# Research Report Engine

Location

```text
laboratory/research-report/
```

Public API

```ts
build(knowledge)
```

Output

```text
reports/OECL-V1-RESEARCH-REPORT.md
```

Responsibilities

Generate the final human-readable scientific report.

---

# Execution Order

```text
Campaign
    ↓
Benchmark
    ↓
Requirements
    ↓
Emergent
    ↓
Patterns
    ↓
Relationships
    ↓
Composition Matrix
    ↓
Protocol Intelligence
    ↓
Composition Hypotheses
    ↓
Hypothesis Validation
    ↓
Adaptive Research
    ↓
Adaptive Scenarios
    ↓
Research Memory
    ↓
Research Knowledge
    ↓
Research Report
```

---

# Architectural Principles

* Every engine has a single responsibility.
* Every engine exports immutable artifacts.
* Engines communicate through files, not direct coupling.
* Scripts orchestrate; engines implement business logic.
* Every artifact is reproducible from deterministic inputs.
* Scientific conclusions must always be traceable to generated datasets.

