# OECLS-0004

# Metrics Specification

Status: Draft

Version: 0.1

---

# Title

Metrics Specification

---

# Purpose

This specification defines the quantitative metrics used throughout the Open ERC Composition Laboratory (OECLS).

The purpose of these metrics is to provide a common language for evaluating deterministic protocol compositions.

The laboratory does not assume any metric improves through composition.

Experiments determine the observed values.

---

# Principles

A metric should be:

- objective
- reproducible
- measurable
- protocol independent
- comparable

---

# Core Metrics

## Safety

Definition

Safety measures whether global invariants remain preserved during execution.

Examples:

- accounting invariants
- authority invariants
- workflow invariants
- composition invariants

Possible measurements:

- invariant violations
- violations per execution
- violations per million executions

---

## Liveness

Definition

Liveness measures whether valid workflows continue making progress.

Possible measurements:

- completed workflows
- completion rate
- average execution steps
- stalled executions

---

## Isolation

Definition

Isolation measures whether failures remain confined to the affected execution domain.

Possible measurements:

- cross-component mutations
- affected workflows
- affected agents

---

## Monotonicity

Definition

Measures whether protocol progression preserves the expected execution order.

Possible measurements:

- replay attempts
- invalid regressions
- monotonic violations

---

## Convergence

Definition

Measures whether the composed system reaches a valid state after arbitrary execution sequences.

Possible measurements:

- convergence rate
- failed convergence
- average recovery steps

---

## Resource Consumption

Definition

Measures computational resources required by the composition.

Possible measurements:

- gas
- execution time
- memory usage

---

# Derived Metrics

The laboratory may define derived metrics calculated from primary measurements.

Examples:

- safety per gas
- liveness efficiency
- convergence efficiency
- protocol overhead

---

# Metric Independence

Metrics should be reported independently.

Improvement in one metric should never imply improvement in another.

---

# Future Metrics

Additional metrics may be introduced provided they satisfy the laboratory principles.

---

# Summary

OECLS defines a common quantitative language for comparing protocol compositions through objective and reproducible measurements.