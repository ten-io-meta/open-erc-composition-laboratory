# OECL V1 Research Report

Generated at: 2026-06-28T22:57:50.563Z

---

## 1. Campaign Summary

- Scenarios executed: 38
- Scenarios passed: 22
- Scenarios failed: 16
- Validation rules checked: 152
- Validation passed: 136
- Validation failed: 16
- Protocols used: 4
- Datasets generated: 38
- Reports generated: 38

## 2. Protocols Analysed

### ERC8001Authority

- Eligibility: Eligible
- Requirements passed: 5/5
- Capabilities: Authority
- Invariants: authority-safety
- Adapter available: true

### ERC8060Reservable

- Eligibility: Eligible
- Requirements passed: 5/5
- Capabilities: Reservation, Accounting
- Invariants: reservation-safety
- Adapter available: true

### ERC8312Cursor

- Eligibility: Eligible
- Requirements passed: 5/5
- Capabilities: Cursor
- Invariants: cursor-safety
- Adapter available: true

### ERC8275Settlement

- Eligibility: Eligible
- Requirements passed: 5/5
- Capabilities: Settlement
- Invariants: settlement-safety
- Adapter available: true


## 3. Emergent Properties

### Reservation Integrity

- Confidence: 100%
- Evidence: 38
- Description: Reserved value never exceeded total value.

### Cursor Authority Correlation

- Confidence: 79%
- Evidence: 38
- Description: Cursor never exceeded consumed authority.


## 4. Composition Patterns

### Settlement Failure Frequency

- Confidence: 79%
- Evidence: 38
- Description: Observed settlement safety success rate.

### Cursor Safety Frequency

- Confidence: 79%
- Evidence: 38
- Description: Observed cursor safety success rate.


## 5. Protocol Relationships

- ERC8001Authority -> ERC8060Reservable: 22/38 successful compositions, confidence 58%
- ERC8001Authority -> ERC8312Cursor: 22/38 successful compositions, confidence 58%
- ERC8001Authority -> ERC8275Settlement: 22/38 successful compositions, confidence 58%
- ERC8060Reservable -> ERC8312Cursor: 22/38 successful compositions, confidence 58%
- ERC8060Reservable -> ERC8275Settlement: 22/38 successful compositions, confidence 58%
- ERC8312Cursor -> ERC8275Settlement: 22/38 successful compositions, confidence 58%


## 6. Composition Matrix Highlights

- ERC8001Authority + ERC8060Reservable: compatibility 58%, safety 58%, stability 58%, risk High
- ERC8001Authority + ERC8312Cursor: compatibility 58%, safety 58%, stability 58%, risk High
- ERC8001Authority + ERC8275Settlement: compatibility 58%, safety 58%, stability 58%, risk High
- ERC8060Reservable + ERC8312Cursor: compatibility 58%, safety 58%, stability 58%, risk High
- ERC8060Reservable + ERC8275Settlement: compatibility 58%, safety 58%, stability 58%, risk High
- ERC8312Cursor + ERC8275Settlement: compatibility 58%, safety 58%, stability 58%, risk High


## 7. Protocol Intelligence

### ERC8001Authority

- Observations: 3
- Successful compositions: 66
- Average compatibility: 58%
- Average stability: 58%
- Average safety: 58%
- Average risk: High
- Eligible relationships: 3
- Strongest partner: ERC8060Reservable
- Weakest partner: ERC8060Reservable
- Dominant risk reason: Risk is driven by high-risk relationships with low compatibility and low safety scores.

Supporting evidence:

- ERC8060Reservable: 22/38 successful compositions, compatibility 58%, risk High
- ERC8312Cursor: 22/38 successful compositions, compatibility 58%, risk High
- ERC8275Settlement: 22/38 successful compositions, compatibility 58%, risk High

### ERC8060Reservable

- Observations: 3
- Successful compositions: 66
- Average compatibility: 58%
- Average stability: 58%
- Average safety: 58%
- Average risk: High
- Eligible relationships: 3
- Strongest partner: ERC8001Authority
- Weakest partner: ERC8001Authority
- Dominant risk reason: Risk is driven by high-risk relationships with low compatibility and low safety scores.

Supporting evidence:

- ERC8001Authority: 22/38 successful compositions, compatibility 58%, risk High
- ERC8312Cursor: 22/38 successful compositions, compatibility 58%, risk High
- ERC8275Settlement: 22/38 successful compositions, compatibility 58%, risk High

### ERC8312Cursor

- Observations: 3
- Successful compositions: 66
- Average compatibility: 58%
- Average stability: 58%
- Average safety: 58%
- Average risk: High
- Eligible relationships: 3
- Strongest partner: ERC8001Authority
- Weakest partner: ERC8001Authority
- Dominant risk reason: Risk is driven by high-risk relationships with low compatibility and low safety scores.

Supporting evidence:

- ERC8001Authority: 22/38 successful compositions, compatibility 58%, risk High
- ERC8060Reservable: 22/38 successful compositions, compatibility 58%, risk High
- ERC8275Settlement: 22/38 successful compositions, compatibility 58%, risk High

### ERC8275Settlement

- Observations: 3
- Successful compositions: 66
- Average compatibility: 58%
- Average stability: 58%
- Average safety: 58%
- Average risk: High
- Eligible relationships: 3
- Strongest partner: ERC8001Authority
- Weakest partner: ERC8001Authority
- Dominant risk reason: Risk is driven by high-risk relationships with low compatibility and low safety scores.

Supporting evidence:

- ERC8001Authority: 22/38 successful compositions, compatibility 58%, risk High
- ERC8060Reservable: 22/38 successful compositions, compatibility 58%, risk High
- ERC8312Cursor: 22/38 successful compositions, compatibility 58%, risk High


## 8. Research Hypotheses

### HYP-0001: Eligible compositions can still present high risk

- Confidence: 100%
- Evidence: 6
- Falsifiable: true
- Validation target: Run additional eligible high-risk scenarios and measure whether the observed risk decreases with broader evidence.
- Description: Some compositions meet eligibility requirements but still show high observed risk.
- Recommendation: Expand scenario coverage for eligible high-risk compositions before treating them as stable.

Supporting evidence:

- ERC8001Authority + ERC8060Reservable: compatibility 58%, safety 58%, stability 58%, risk High
- ERC8001Authority + ERC8312Cursor: compatibility 58%, safety 58%, stability 58%, risk High
- ERC8001Authority + ERC8275Settlement: compatibility 58%, safety 58%, stability 58%, risk High
- ERC8060Reservable + ERC8312Cursor: compatibility 58%, safety 58%, stability 58%, risk High
- ERC8060Reservable + ERC8275Settlement: compatibility 58%, safety 58%, stability 58%, risk High
- ERC8312Cursor + ERC8275Settlement: compatibility 58%, safety 58%, stability 58%, risk High

### HYP-0002: Strongest eligible composition candidate

- Confidence: 58%
- Evidence: 38
- Falsifiable: true
- Validation target: Expand the strongest eligible pair into higher-order compositions and verify whether it remains the strongest baseline.
- Description: ERC8001Authority + ERC8060Reservable is currently the strongest eligible observed composition.
- Recommendation: Use this pair as a baseline candidate for deeper multi-protocol composition experiments.

Supporting evidence:

- ERC8001Authority + ERC8060Reservable: compatibility 58%, safety 58%, stability 58%, risk High

### HYP-0003: Most observed protocol candidate

- Confidence: 58%
- Evidence: 3
- Falsifiable: true
- Validation target: Run additional compositions around the most observed protocol and verify whether it remains central as the dataset grows.
- Description: ERC8001Authority appears in the largest number of observed protocol relationships.
- Recommendation: Prioritize this protocol when expanding higher-order composition experiments.

Supporting evidence:

- Observed relationships: 3
- Average compatibility: 58%
- Average safety: 58%
- Average stability: 58%
- Average risk: High


## 9. Validation Plans

### HYP-0001: Eligible compositions can still present high risk

- Priority: High
- Validation target: Run additional eligible high-risk scenarios and measure whether the observed risk decreases with broader evidence.
- Strategy: Generate additional eligible scenarios currently classified as high risk and test whether risk decreases with broader evidence.
- Recommended scenarios: valid, boundary, settlement-failure, cursor-failure

### HYP-0002: Strongest eligible composition candidate

- Priority: Medium
- Validation target: Expand the strongest eligible pair into higher-order compositions and verify whether it remains the strongest baseline.
- Strategy: Use the strongest eligible pair as a baseline and expand it into higher-order compositions.
- Recommended scenarios: valid, boundary

### HYP-0003: Most observed protocol candidate

- Priority: Medium
- Validation target: Run additional compositions around the most observed protocol and verify whether it remains central as the dataset grows.
- Strategy: Generate more scenarios around the most observed protocol to confirm whether it remains central as the dataset grows.
- Recommended scenarios: valid, random, boundary


## 10. Research Memory

- Total campaigns: 1
- Total scenarios: 38
- Total passed: 22
- Total failed: 16
- Hypothesis coverage: 3

### Protocol Coverage

- ERC8001Authority: 38
- ERC8060Reservable: 38
- ERC8312Cursor: 38
- ERC8275Settlement: 38

## 11. Conclusions

OECL V1 demonstrates that structured protocol descriptions can be transformed into reproducible research artifacts.

The current pipeline is capable of executing deterministic analysis, discovering relationships, identifying emergent properties, generating hypotheses, planning validation scenarios, preserving research memory, and exporting accumulated knowledge.

This report represents the final human-readable research artifact of the OECL V1 pipeline.

## 12. Next Research Priorities

- Expand scenario coverage for high-risk eligible compositions.
- Improve explanations for risk, compatibility, safety, and stability scores.
- Preserve campaign history across multiple research runs.
- Prepare the Core for future protocol discovery and code intelligence in V2.
