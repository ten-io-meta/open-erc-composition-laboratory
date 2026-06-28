# CASE-0006 — ERC8001 + ERC8060 + ERC8275 Composition

## Objective

This case study validates a protocol composition where Authority, Reservation, Accounting, and Settlement are provided by ERC-specific adapters inside the Open ERC Composition Laboratory.

This is the first OECL case where the main execution path does not rely on `MockAuthority` or `MockSettlement`.

---

## Protocol Composition

| Capability | Protocol Adapter |
|------------|------------------|
| Authority | ERC8001Authority |
| Reservation | ERC8060Reservable |
| Accounting | ERC8060Reservable |
| Settlement | ERC8275Settlement |

---

## Executed Actions

1. `ERC8001Authority.authorize(40)`
2. `ERC8060Reservable.reserve(40)`
3. `ERC8275Settlement.settle(40)`

---

## Shared Execution Context

Final context values:

```json
{
  "authorityLimit": 100,
  "consumedAuthority": 40,
  "totalValue": 100,
  "lockedValue": 40,
  "availableValue": 60,
  "settledValue": 40
}
```

---

## Validation

### Reservation Safety

```text
lockedValue + availableValue == totalValue
```

Status: PASS

### Authority Safety

```text
consumedAuthority <= authorityLimit
```

Status: PASS

### Settlement Safety

```text
settledValue == lockedValue
```

Status: PASS

---

## Result

CASE-0006 demonstrates that OECL can execute a declarative multi-protocol stack using ERC-specific adapters over a shared execution context.

The experiment validates deterministic composition across:

- ERC8001-style authority
- ERC8060 Reservable accounting
- ERC8275-style settlement

---

## Status

Experimental.
