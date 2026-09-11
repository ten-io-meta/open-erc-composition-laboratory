# V2.1 A3 — Real challenged control audit

## Result

No real challenged control is selected from the current corpus.

The preregistered CHALLENGED contract requires:

1. a qualifying composition candidate;
2. a known relevant boundary;
3. an observed boundary violation;
4. exact violation evidence.

The current real-corpus audit did not identify a case satisfying those requirements.

## Evidence reviewed

- Real target polarity cross-validation:
  - RESERVATION_CONSTRAINS_ACCOUNTING: CHALLENGE = 0
  - INVARIANT_VALIDATION_VALIDATES_ACCOUNTING: CHALLENGE = 0
  - STANDARDIZATION_ENABLES_INTEROPERABILITY: CHALLENGE = 0

- Existing runtime VIOLATED examples were inspected and rejected as real controls
  when they were produced by fixtures, synthetic observations, or test-injected
  challenge registrations.

- Real ERC-8004 / ERC-8060 guard failures were not violations of protocol
  boundaries: the observed reverts demonstrated that those boundaries were
  preserved.

## Scientific decision

REAL-CONTROL-CHALLENGED-TBD remains UNSELECTED.

No CHALLENGED verdict is manufactured from:

- missing evidence;
- semantic challenge cues;
- rejected transactions;
- synthetic fixtures;
- injected VIOLATED observations.

A real challenged control may be added later only when an independently
observed boundary violation with exact provenance exists.

This absence does not alter the validated positive or inconclusive controls.
