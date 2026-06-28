# OECLS-0003

# Experiment Model

Status: Draft

Version: 0.1

---

# Title

Experiment Model

---

# Purpose

This specification defines the structure of experiments executed inside the Open ERC Composition Laboratory (OECLS).

Every experiment must be reproducible, deterministic, independently executable and publicly verifiable.

---

# Definition

An experiment is a reproducible execution of one or more protocol compositions under a predefined configuration whose objective is to collect quantitative evidence.

An experiment never attempts to prove a hypothesis.

It only generates observations.

---

# Experiment Lifecycle

Every experiment follows the same lifecycle.

```
Specification

↓

Configuration

↓

Execution

↓

Metric Collection

↓

Result Validation

↓

Publication
```

---

# Experiment Structure

Every experiment contains:

- identifier
- title
- objective
- hypothesis
- protocol composition
- scenario
- execution parameters
- metrics
- results

---

# Identifier

Every experiment has a unique identifier.

Example:

```
EXP-000001
EXP-000002
EXP-000003
```

Identifiers are permanent.

---

# Objective

Defines what the experiment attempts to observe.

Example:

"Evaluate whether protocol composition affects safety under adversarial execution."

---

# Hypothesis

Experiments may include a hypothesis.

Example:

"Restrictive composition may reduce invariant violations."

Hypotheses are never considered conclusions.

---

# Composition

Defines which protocols participate.

Example:

- ERC-8001
- ERC-8004
- ERC-8060
- ERC-8275
- ERC-8301
- ERC-8312

---

# Scenario

Defines the execution environment.

Examples:

- baseline
- restrictive
- ablation
- multi-agent
- stress
- adversarial

---

# Execution Parameters

Every execution records:

- compiler
- EVM version
- optimizer
- optimizer runs
- random seed
- number of executions
- timestamp

---

# Metrics

Experiments may collect any measurable property.

Examples include:

- safety
- liveness
- isolation
- monotonicity
- gas
- convergence
- invariant violations

Additional metrics may be added.

---

# Results

Results are observations only.

The laboratory does not classify results as success or failure.

Unexpected behaviour is also considered valuable evidence.

---

# Reproducibility

Every experiment must be executable by independent researchers using the published configuration.

Equivalent configurations should produce equivalent observations.

---

# Publication

Every completed experiment should publish:

- configuration
- raw metrics
- derived metrics
- execution logs
- software version
- commit hash

Raw data should never be discarded.

---

# Versioning

Experiments are immutable.

If the methodology changes, a new experiment identifier is created.

Previous results remain available.

---

# Summary

The Experiment Model defines a common structure that allows protocol composition experiments to be executed, reproduced, compared and independently verified.
