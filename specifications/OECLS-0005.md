# OECLS-0005

# Experiment Registry

Status: Draft

Version: 0.1

---

# Title

Experiment Registry

---

# Purpose

This specification defines how experiments are identified, recorded, versioned and published inside the Open ERC Composition Laboratory (OECLS).

The registry guarantees that every experiment remains reproducible and permanently identifiable.

---

# Principles

The experiment registry shall be:

- immutable
- reproducible
- publicly auditable
- append-only
- protocol independent

---

# Experiment Identifier

Every experiment receives a permanent identifier.

Example:

EXP-000001

Identifiers are never reused.

Deleted identifiers are forbidden.

---

# Experiment Metadata

Every experiment records:

- experiment id
- title
- description
- author
- execution date
- protocol versions
- repository commit
- execution environment
- scenario
- configuration
- random seed

---

# Execution Status

Possible states:

- Draft
- Scheduled
- Running
- Completed
- Failed
- Archived

---

# Stored Results

Every completed experiment stores:

- raw logs
- metrics
- benchmark results
- invariant reports
- fuzzing reports
- execution duration

Raw data must remain accessible.

---

# Versioning

Experiments are immutable.

Methodology improvements create new experiments rather than modifying previous ones.

Historical records remain available.

---

# Comparison

Experiments may be compared if:

- scenarios are equivalent
- protocol versions are documented
- execution parameters are published

Comparisons should always reference experiment identifiers.

---

# Public Availability

The registry should be openly accessible.

External researchers should be able to reproduce any published experiment.

---

# Summary

The Experiment Registry provides a permanent record of every experiment executed within OECLS, ensuring reproducibility, traceability and independent verification.
