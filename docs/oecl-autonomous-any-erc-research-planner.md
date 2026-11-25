# OECL — generic any-ERC source-anchored scientific research planner

## Scientific claim

The web application may now automatically **propose** a bounded research agenda for any two positive numeric ERC identifiers, using their retrieved official specifications. It generates a conditional hypothesis, explicit falsifier, positive and negative controls, preconditions, alternatives and required evidence from verified *documentary anchors*; it **does not execute** an experiment or independently establish standard compatibility.

**Autonomy level:** `DOCUMENTARY_HYPOTHESIS_AND_FALSIFIER_DESIGN_ONLY`.

This is a deterministic bounded planner, not an unrestricted autonomous scientist, semantic proof engine or LLM agent. The original source-compiled AST/EVM capability-gated experiments remain separate and substantially stronger evidence than these documentary designs.

## Inputs and source provenance

1. Only a normalized pair of two distinct numeric ERC identifiers is allowed. No arbitrary URL, file path, address, repository, source code, JavaScript, or executable payload is accepted.
2. The existing official source reader downloads `ethereum/ERCs/master/ERCS/erc-<n>.md` over a fixed allowlisted path, with a byte limit, a timeout and a bounded short-lived per-instance cache. A mutable document is never represented as a pinned immutable revision; its retrieved SHA-256 is exposed for traceability.
3. Hypotheses must be anchored to a specifically parsed `requires` entry, extracted interface name, or candidate normative `MUST/SHALL/SHOULD` excerpt. Sources with missing, absent or unparseable evidence contribute no anchors.
4. The engine considers both directions of explicitly declared prerequisites, common prerequisites, overlapping method labels and one potential adapter-mediated token flow. When a pair has no grounded cross-standard claim, it may propose **single-standard** research questions only; those never become purported composition evidence.
5. The agenda has a strict limit of six hypotheses per pair, stable IDs for reversed selections, reproducible content SHA-256 and no unconstrained natural-language execution.

## Hypothesis design is not source or EVM proof

The fixed question grammar records a conditional prediction, observable falsification criterion, alternative explanation, positive and negative controls and constraints. Each proposal is always `PROPOSED_FOR_HUMAN_SEMANTIC_REVIEW` / `NOT_EXECUTED`, and the entire plan always declares:

- `scientificVerdict: NOT_EVALUATED`
- `compatibilityVerdict: NOT_EVALUATED`
- `candidateAdmission: NOT_ADMITTED`
- `sourceCompiled: false`, `evmExecuted: false`, `experimentDispatched: false`
- `executionGate: BLOCKED_UNTIL_PINNED_IMPLEMENTATION_AND_REVIEWED_PROTOCOL`

An extracted `MUST` might be conditional, merely advisory or missing surrounding context. No claim may be tested until a person reviews its semantics, then pins real implementations/oracles and preregisters test conditions. If no valid cross-standard source anchor exists, the engine **abstains from making a pair-level claim** even when it can propose per-ERC work.

The real ERC-8098×ERC-4626 and ERC-4626×ERC-20 EVM research cycles are not recomputed by this web module. Their independently reviewed pinned results are still shown separately, and the documentary planner never merges their verdicts with new unexecuted proposals.

## Tests

- `node --experimental-strip-types web/scripts/check-autonomous-research-planner.mjs`: direct dependencies, shared sources, unrelated methods, missing sources, reversals, no-source abstention, 9 adversarial tampering attempts, untrusted wording and strict non-execution.
- `node --experimental-strip-types web/scripts/check-erc-documentary-discovery.mjs`: integrated public documentary contract.
- Web Next production HTTP smoke and headless Chromium: every output labeled as documentary, source anchored and no invented EVM receipt.
- Immutable corpus audit `oecl-all-erc-documentary-matrix.yml`: independently enumerate **every unordered pair** of the pinned official corpus, count cross-standard proposals, per-standard-only designs, abstentions, insufficient documents and total hypotheses, and assert no invented EVM/admission verdicts.

These counts must be taken from actual CI artifacts; generating one bounded agenda for any input is **not** a claim that every one of the 195,625 pairs admits a defensible composability hypothesis.

## Before autonomy can execute new ERCs

A generic compiler-backed research adapter is a separate engineering problem. It must support immutable source registration, ABI/role/unit resolution, model-dependent falsifiers, safe isolated EVM execution, adversarial controls and independent receipt validation, without allowing unreviewed external repository scripts or exposing secrets to PR code.

The security review already identifies missing atomic per-identity quotas, public abuse controls and a hardened network-denied execution sandbox. Until those exist, the public dispatch and arbitrary-source EVM capabilities remain disabled.

## Benchmark interpretation

`AUTOMATED_RESEARCH_DESIGN` means repeatable bounded **question and falsifier generation**, not self-confirmed hypotheses. There are deliberately no `CONFIRMED`, `COMPATIBLE`, `INCOMPATIBLE` or `EXECUTED` outputs from this planner. A zero-hypothesis or one-sided document case is an informative **lack of evidence**, never a contradiction proven on chain.
