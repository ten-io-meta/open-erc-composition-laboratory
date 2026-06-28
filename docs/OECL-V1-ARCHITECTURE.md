# OECL V1 Architecture Guide

## Purpose

This document describes the complete architecture of the Open ERC Composition Laboratory (OECL) V1.

Its objective is to provide a single reference describing:

* the responsibility of every module,
* the project folder structure,
* the execution pipeline,
* generated artifacts,
* data flow between engines,
* terminology used across the laboratory.

This document should allow any future contributor (human or AI) to understand the entire OECL V1 architecture before making changes.

---

# High-Level Architecture

OECL V1 is a deterministic research laboratory.

It is **not** a protocol implementation.

It is **not** a protocol validator.

It is a scientific infrastructure capable of generating reproducible knowledge about protocol composition.

The complete execution pipeline is:

```
Campaign
        ↓
Benchmark
        ↓
Requirements
        ↓
Emergent Properties
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
Scenario Generation
        ↓
Adaptive Research Planning
        ↓
Adaptive Scenario Execution
        ↓
Research Memory
        ↓
Research Knowledge
        ↓
Research Report
```

---

# Repository Structure

```
laboratory/
```

Contains every research engine.

Each folder is an independent scientific module.

---

## laboratory/benchmark

Produces laboratory benchmark statistics.

Output:

```
benchmark-results/
```

---

## laboratory/requirements

Evaluates protocol requirements.

Output:

```
requirements-results/
```

---

## laboratory/emergent

Discovers emergent protocol properties.

Output:

```
emergent-results/
```

---

## laboratory/patterns

Discovers reusable composition patterns.

Output:

```
pattern-results/
```

---

## laboratory/relationships

Builds protocol relationship graphs.

Output:

```
relationship-results/
```

---

## laboratory/matrix

Creates the composition matrix.

Output:

```
matrix-results/
```

---

## laboratory/intelligence

Builds protocol intelligence.

Produces:

* strongest partner
* weakest partner
* dominant risk reason
* supporting evidence

Output:

```
intelligence-results/
```

---

## laboratory/hypotheses

Automatically generates scientific hypotheses.

Produces:

* hypothesis id
* falsifiable flag
* validation target
* supporting evidence

Output:

```
hypothesis-results/
```

---

## laboratory/hypothesis-validation

Generates validation plans for every hypothesis.

Output:

```
hypothesis-validation-results/
```

---

## laboratory/adaptive-research

Generates adaptive research plans.

Produces executable adaptive scenarios.

Outputs:

```
adaptive-research-results/

scenarios/adaptive/
```

---

## laboratory/research-memory

Stores accumulated laboratory knowledge.

Output:

```
research-memory-results/
```

---

## laboratory/research-report

Produces the final scientific report.

Output:

```
reports/OECL-V1-RESEARCH-REPORT.md
```

---

# Scripts

Every engine has a matching executable inside:

```
scripts/
```

Naming convention:

```
run-benchmark.ts

run-requirements.ts

run-emergent.ts

run-patterns.ts

run-relationships.ts

run-composition-matrix.ts

run-composition-intelligence.ts

run-composition-hypotheses.ts

run-hypothesis-validation.ts

run-generate-scenarios.ts

run-auto-scenarios.ts

run-adaptive-research.ts

run-adaptive-scenarios.ts

run-research-memory.ts

run-research-knowledge.ts

run-research-report.ts

run-oecl.ts
```

---

# Generated Directories

```
benchmark-results/

requirements-results/

emergent-results/

pattern-results/

relationship-results/

matrix-results/

intelligence-results/

hypothesis-results/

hypothesis-validation-results/

adaptive-research-results/

research-memory-results/

knowledge-results/

reports/

datasets/

scenarios/
```

Every generated directory is reproducible.

Nothing inside these folders should be edited manually.

---

# Datasets

```
datasets/
```

Contains every executed experiment.

Each dataset contains:

* experiment metadata
* actions
* protocol states
* validation results
* property results
* benchmark metadata

Datasets represent the primary scientific evidence of OECL.

---

# Reports

```
reports/
```

Contains:

* experiment reports
* final research report

Reports are human-readable representations of datasets.

---

# Research Knowledge

```
knowledge-results/
```

Contains the complete knowledge graph generated during execution.

This file aggregates:

* benchmark
* requirements
* emergent properties
* patterns
* relationships
* matrix
* intelligence
* hypotheses
* validation plans
* research memory

It is the canonical machine-readable representation of OECL research.

---

# Research Report

The Research Report is the final human-readable artifact.

Sections:

1. Campaign Summary
2. Protocols Analysed
3. Emergent Properties
4. Composition Patterns
5. Protocol Relationships
6. Composition Matrix
7. Protocol Intelligence
8. Research Hypotheses
9. Validation Plans
10. Research Memory
11. Conclusions
12. Next Research Priorities

---

# Terminology

Campaign

A complete execution batch.

Scenario

A deterministic protocol composition experiment.

Dataset

The complete execution record of one scenario.

Relationship

Observed protocol interaction.

Pattern

Reusable composition behaviour.

Emergent Property

Behaviour not explicitly defined by any protocol.

Hypothesis

Automatically generated scientific statement.

Validation Plan

Scientific procedure proposed to test a hypothesis.

Research Memory

Persistent summary of executed campaigns.

Research Knowledge

Machine-readable aggregation of every research artifact.

Research Report

Human-readable summary of the complete laboratory execution.

---

# Design Philosophy

OECL V1 is designed as a deterministic scientific research laboratory.

Every execution produces reproducible evidence.

Every conclusion is traceable to generated datasets.

Every hypothesis is falsifiable.

Every validation plan is reproducible.

The architecture prioritizes determinism, traceability, reproducibility and scientific knowledge generation over protocol-specific implementations.

This document represents the reference architecture of OECL V1.

