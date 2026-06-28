# OECL V1 Developer Map (Internal)

> Internal engineering documentation.
>
> This document is intended for OECL maintainers.
>
> It describes the exact location, responsibility and relationships of every major component in the laboratory.

---

# Repository Layout

```
open-erc-composition-laboratory/

├── laboratory/
├── scripts/
├── datasets/
├── reports/
├── scenarios/
├── benchmark-results/
├── requirements-results/
├── emergent-results/
├── pattern-results/
├── relationship-results/
├── matrix-results/
├── intelligence-results/
├── hypothesis-results/
├── hypothesis-validation-results/
├── adaptive-research-results/
├── research-memory-results/
├── knowledge-results/
├── docs/
```

---

# laboratory/

Contains every research engine.

Each folder is completely independent.

---

# laboratory/benchmark

Files

```
BenchmarkEngine.ts
BenchmarkLoader.ts
BenchmarkResult.ts
```

Responsibilities

* Aggregate benchmark metrics.
* Read executed datasets.
* Produce global laboratory statistics.

Output

```
benchmark-results/benchmark.json
```

Executed by

```
scripts/run-benchmark.ts
```

---

# laboratory/requirements

Purpose

Analyse protocol requirements.

Output

```
requirements-results/protocols.json
```

Executed by

```
scripts/run-requirements.ts
```

---

# laboratory/emergent

Purpose

Discover emergent protocol properties.

Output

```
emergent-results/properties.json
```

Executed by

```
scripts/run-emergent.ts
```

---

# laboratory/patterns

Purpose

Extract reusable composition patterns.

Output

```
pattern-results/patterns.json
```

Executed by

```
scripts/run-patterns.ts
```

---

# laboratory/relationships

Purpose

Build protocol relationship graph.

Output

```
relationship-results/relationships.json
```

Executed by

```
scripts/run-relationships.ts
```

---

# laboratory/matrix

Purpose

Generate protocol composition matrix.

Output

```
matrix-results/composition-matrix.json
```

Executed by

```
scripts/run-composition-matrix.ts
```

---

# laboratory/intelligence

Files

```
CompositionIntelligenceEngine.ts
CompositionIntelligenceResult.ts
```

Responsibilities

* Analyse matrix.
* Compute protocol statistics.
* Determine strongest partner.
* Determine weakest partner.
* Explain dominant risk.
* Collect supporting evidence.

Output

```
intelligence-results/protocol-intelligence.json
```

Executed by

```
scripts/run-composition-intelligence.ts
```

---

# laboratory/hypotheses

Files

```
CompositionHypothesis.ts
CompositionHypothesisEngine.ts
```

Responsibilities

Automatically generate scientific hypotheses.

Each hypothesis contains

* hypothesisId
* title
* confidence
* evidence
* falsifiable
* validationTarget
* supportingEvidence
* recommendation

Output

```
hypothesis-results/composition-hypotheses.json
```

Executed by

```
scripts/run-composition-hypotheses.ts
```

---

# laboratory/hypothesis-validation

Files

```
HypothesisValidationEngine.ts
HypothesisValidationPlan.ts
```

Responsibilities

Transform hypotheses into validation plans.

Output

```
hypothesis-validation-results/validation-plans.json
```

Executed by

```
scripts/run-hypothesis-validation.ts
```

---

# laboratory/adaptive-research

Files

```
AdaptiveResearchPlanner.ts
AdaptiveResearchPlan.ts
```

Responsibilities

Generate adaptive research campaigns.

Produces

* adaptive plans
* executable scenarios

Outputs

```
adaptive-research-results/

scenarios/adaptive/
```

Executed by

```
scripts/run-adaptive-research.ts
```

---

# laboratory/engine

Main execution engine.

Files

```
ExperimentExecutor.ts
```

Responsibilities

* Execute protocol actions.
* Build protocol state.
* Validate invariants.
* Calculate properties.
* Generate datasets.
* Generate reports.

Produces

```
datasets/

reports/
```

---

# laboratory/scenario

Files

```
Scenario.ts

ScenarioLoader.ts

ScenarioRunner.ts

ExperimentBuilder.ts
```

Responsibilities

Convert JSON scenarios into executable experiments.

---

# laboratory/research-memory

Files

```
ResearchMemory.ts

ResearchMemoryEngine.ts
```

Responsibilities

Maintain accumulated research statistics.

Output

```
research-memory-results/
```

---

# laboratory/research-knowledge

Files

```
ResearchKnowledge.ts

ResearchKnowledgeEngine.ts
```

Responsibilities

Aggregate every scientific artifact into one machine-readable document.

Output

```
knowledge-results/research-knowledge.json
```

Executed by

```
scripts/run-research-knowledge.ts
```

---

# laboratory/research-report

Files

```
ResearchReportEngine.ts
```

Responsibilities

Generate the final human-readable report.

Output

```
reports/OECL-V1-RESEARCH-REPORT.md
```

Executed by

```
scripts/run-research-report.ts
```

---

# scripts/

Every script is an entry point.

Naming convention

```
run-*.ts
```

Each script should only:

1. Load inputs.
2. Execute one engine.
3. Export results.

Business logic belongs inside `laboratory/`.

---

# datasets/

Scientific evidence.

Never edit manually.

Generated exclusively by:

```
ExperimentExecutor
```

---

# reports/

Human-readable reports.

Generated from datasets.

Never used as input by engines.

---

# scenarios/

Executable experiment definitions.

Subdirectories

```
adaptive/
```

Additional scenario categories may be added in future versions.

---

# Dependency Chain

```
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

Hypotheses

↓

Validation Plans

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

No engine should skip intermediate stages unless explicitly designed to do so.

---

# Design Rules

* Engines must remain deterministic.
* Engines communicate through exported artifacts.
* Generated artifacts are immutable.
* Reports are derived from datasets.
* Knowledge is derived from reports and structured outputs.
* Business logic belongs inside `laboratory/`.
* Scripts should remain orchestration-only.

---

# Purpose

This document exists to allow future maintainers to immediately locate any engine, class or artifact without exploring the repository manually.
# OECL V1 Developer Map (Internal)

> Internal engineering documentation.
>
> This document is intended for OECL maintainers.
>
> It describes the exact location, responsibility and relationships of every major component in the laboratory.

---

# Repository Layout

```
open-erc-composition-laboratory/

├── laboratory/
├── scripts/
├── datasets/
├── reports/
├── scenarios/
├── benchmark-results/
├── requirements-results/
├── emergent-results/
├── pattern-results/
├── relationship-results/
├── matrix-results/
├── intelligence-results/
├── hypothesis-results/
├── hypothesis-validation-results/
├── adaptive-research-results/
├── research-memory-results/
├── knowledge-results/
├── docs/
```

---

# laboratory/

Contains every research engine.

Each folder is completely independent.

---

# laboratory/benchmark

Files

```
BenchmarkEngine.ts
BenchmarkLoader.ts
BenchmarkResult.ts
```

Responsibilities

* Aggregate benchmark metrics.
* Read executed datasets.
* Produce global laboratory statistics.

Output

```
benchmark-results/benchmark.json
```

Executed by

```
scripts/run-benchmark.ts
```

---

# laboratory/requirements

Purpose

Analyse protocol requirements.

Output

```
requirements-results/protocols.json
```

Executed by

```
scripts/run-requirements.ts
```

---

# laboratory/emergent

Purpose

Discover emergent protocol properties.

Output

```
emergent-results/properties.json
```

Executed by

```
scripts/run-emergent.ts
```

---

# laboratory/patterns

Purpose

Extract reusable composition patterns.

Output

```
pattern-results/patterns.json
```

Executed by

```
scripts/run-patterns.ts
```

---

# laboratory/relationships

Purpose

Build protocol relationship graph.

Output

```
relationship-results/relationships.json
```

Executed by

```
scripts/run-relationships.ts
```

---

# laboratory/matrix

Purpose

Generate protocol composition matrix.

Output

```
matrix-results/composition-matrix.json
```

Executed by

```
scripts/run-composition-matrix.ts
```

---

# laboratory/intelligence

Files

```
CompositionIntelligenceEngine.ts
CompositionIntelligenceResult.ts
```

Responsibilities

* Analyse matrix.
* Compute protocol statistics.
* Determine strongest partner.
* Determine weakest partner.
* Explain dominant risk.
* Collect supporting evidence.

Output

```
intelligence-results/protocol-intelligence.json
```

Executed by

```
scripts/run-composition-intelligence.ts
```

---

# laboratory/hypotheses

Files

```
CompositionHypothesis.ts
CompositionHypothesisEngine.ts
```

Responsibilities

Automatically generate scientific hypotheses.

Each hypothesis contains

* hypothesisId
* title
* confidence
* evidence
* falsifiable
* validationTarget
* supportingEvidence
* recommendation

Output

```
hypothesis-results/composition-hypotheses.json
```

Executed by

```
scripts/run-composition-hypotheses.ts
```

---

# laboratory/hypothesis-validation

Files

```
HypothesisValidationEngine.ts
HypothesisValidationPlan.ts
```

Responsibilities

Transform hypotheses into validation plans.

Output

```
hypothesis-validation-results/validation-plans.json
```

Executed by

```
scripts/run-hypothesis-validation.ts
```

---

# laboratory/adaptive-research

Files

```
AdaptiveResearchPlanner.ts
AdaptiveResearchPlan.ts
```

Responsibilities

Generate adaptive research campaigns.

Produces

* adaptive plans
* executable scenarios

Outputs

```
adaptive-research-results/

scenarios/adaptive/
```

Executed by

```
scripts/run-adaptive-research.ts
```

---

# laboratory/engine

Main execution engine.

Files

```
ExperimentExecutor.ts
```

Responsibilities

* Execute protocol actions.
* Build protocol state.
* Validate invariants.
* Calculate properties.
* Generate datasets.
* Generate reports.

Produces

```
datasets/

reports/
```

---

# laboratory/scenario

Files

```
Scenario.ts

ScenarioLoader.ts

ScenarioRunner.ts

ExperimentBuilder.ts
```

Responsibilities

Convert JSON scenarios into executable experiments.

---

# laboratory/research-memory

Files

```
ResearchMemory.ts

ResearchMemoryEngine.ts
```

Responsibilities

Maintain accumulated research statistics.

Output

```
research-memory-results/
```

---

# laboratory/research-knowledge

Files

```
ResearchKnowledge.ts

ResearchKnowledgeEngine.ts
```

Responsibilities

Aggregate every scientific artifact into one machine-readable document.

Output

```
knowledge-results/research-knowledge.json
```

Executed by

```
scripts/run-research-knowledge.ts
```

---

# laboratory/research-report

Files

```
ResearchReportEngine.ts
```

Responsibilities

Generate the final human-readable report.

Output

```
reports/OECL-V1-RESEARCH-REPORT.md
```

Executed by

```
scripts/run-research-report.ts
```

---

# scripts/

Every script is an entry point.

Naming convention

```
run-*.ts
```

Each script should only:

1. Load inputs.
2. Execute one engine.
3. Export results.

Business logic belongs inside `laboratory/`.

---

# datasets/

Scientific evidence.

Never edit manually.

Generated exclusively by:

```
ExperimentExecutor
```

---

# reports/

Human-readable reports.

Generated from datasets.

Never used as input by engines.

---

# scenarios/

Executable experiment definitions.

Subdirectories

```
adaptive/
```

Additional scenario categories may be added in future versions.

---

# Dependency Chain

```
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

Hypotheses

↓

Validation Plans

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

No engine should skip intermediate stages unless explicitly designed to do so.

---

# Design Rules

* Engines must remain deterministic.
* Engines communicate through exported artifacts.
* Generated artifacts are immutable.
* Reports are derived from datasets.
* Knowledge is derived from reports and structured outputs.
* Business logic belongs inside `laboratory/`.
* Scripts should remain orchestration-only.

---

# Purpose

This document exists to allow future maintainers to immediately locate any engine, class or artifact without exploring the repository manually.

