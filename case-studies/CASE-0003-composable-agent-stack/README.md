# CASE-0003 — Composable Agent Settlement Stack

## Objective

This case study validates deterministic protocol composition inside the Open ERC Composition Laboratory (OECL).

Rather than validating a single ERC in isolation, the experiment verifies that multiple protocol capabilities can compose over a shared execution context while preserving accounting invariants.

---

## Protocol Composition

| Capability | Protocol |
|------------|----------|
| Authority | MockAuthority |
| Reservation | ERC8060 Reservable |
| Accounting | ERC8060 Reservable |
| Settlement | MockSettlement |

---

## Shared Execution Context

The experiment executes all protocol adapters over a common execution context.

Execution flow:

Authority
↓

Reservation

↓

Settlement

↓

Validation

---

## Validation Rules

The following invariants are evaluated.

### Reservation Safety

```
lockedValue + availableValue == totalValue
```

Status

PASS

---

### Authority Safety

```
consumedAuthority <= authorityLimit
```

Status

PASS

---

### Settlement Safety

```
settledValue == lockedValue
```

Status

PASS

---

## Benchmark

Iterations

25

Seed

8004

---

## Result

The experiment successfully demonstrates deterministic protocol composition using a shared execution context.

The Reservation capability is implemented through the ERC8060 Reservable adapter while Authority and Settlement remain bootstrap mock implementations.

This case study establishes the baseline architecture for future integrations including:

- ERC-8001
- ERC-8275
- ERC-8312
- ERC-8301
- ERC-8004

---

## Status

Experimental

Open ERC Composition Laboratory