# OECL generic hypotheses — first reusable increment

This module is a **data-only candidate hypothesis planner**, not a universal ERC EVM executor. It adds a reusable inference pathway beyond hardcoded ERC-721/ERC-1155 transaction sequences without relaxing the registry or local Hardhat safety gates.

## Contract
`GenericHypothesisPlanner.cjs` accepts typed ABI entries, claimed compiler AST write paths, and content identities (SHA-256 strings). It proposes a state-transition hypothesis, prediction, counterexample, and prerequisites for each unambiguous supported method. Deterministic identifiers link each hypothesis to its proposed ABI/source/AST facts. Supported input argument types are explicitly bounded and this module **never** prepares arbitrary calldata, deploys, signs, or dispatches transactions.

Even correctly matching hashes **do not authenticate** a compiler AST, source origin, or independent reviewer. Therefore `SOURCE_IDENTITY_UNATTESTED`, `HYPOTHESIS_ONLY`, `NOT_EXECUTED`, `INCONCLUSIVE`, `NOT_EVALUATED`, and `NOT_ADMITTED` remain the default. Passing invented receipts to `assess()` cannot promote a verdict.

## Reproducible test and demonstration
Run `node --test scripts/check-generic-hypothesis-planner.test.cjs` from repository root.

Demonstration narrative (not a newly executed proof):
1. Input: registered source + compiler-produced ABI and AST.
2. Discovery: source-backed possible storage write yields a falsifiable hypothesis.
3. Prediction: a bounded successful call changes a measured state.
4. Adversarial control: unauthorized call, expected revert, and unchanged state (when that constraint is supported by audited source semantics).
5. Proof: only an **independently verified** local EVM receipt and before/after snapshots may support the scoped observation.
6. Verdict: distinguish supported/refuted empirical hypothesis from **cross-ERC compatibility**, which remains `NOT_EVALUATED` unless separately tested.

## Next integration gates
- Verify compiler AST facts against locked source bytes and ABI from the same compilation, not a caller-provided graph.
- Introduce a reviewed per-operation policy for constructor, bounded arguments, caller roles and gas.
- Dispatch only locally; record mined successes and simulated unmined adversarial reverts distinctly.
- Independently verify receipts, logs, state deltas, source and protocol hashes in a second execution environment.
- Expose only archived evidence in the UI and preserve existing MISL regression and ERC-721/ERC-1155 suites.

Existing ERC-721/1155 results and their independently reviewed EVM witnesses remain unchanged by this increment.

## Locked-source compiler bridge (implemented on this PR)
The generic source bridge does not accept a user-supplied ABI or AST file. It calls the existing registered-source collector, validates the exact pinned dependency lock SHA-256, compiles all collected source units with solc 0.8.26, and reads typed ABI and AST from **one compiler invocation**. It independently checks source bytes against compiler graph hashes. Traversal uses compiler-resolved function IDs and call edges; multiple concrete implementations, interface-only declarations, unresolved calls, external calls or multi-state effects fail closed rather than getting optimistic execution plans.

CI command, with the audited dependency checkout and its locked node_modules installed:
```bash
node --test scripts/check-generic-hypothesis-planner.test.cjs scripts/check-source-backed-hypotheses.test.cjs
node laboratory/scientific-open-source-worker/run-source-backed-hypotheses.cjs ERC-20 ERC-20-BURNABLE ../dependency-source output
```
The GitHub workflow `oecl-generic-hypothesis-provenance.yml` runs the compiler against those two registered implementations and recompiles the complete dossier in an independent runner. Check its current conclusion before using a claim of passing validation.

This produces source-grounded **hypothesis candidates**, not permission to execute a transaction or an independently accepted local EVM witness. The existing ERC-721/ERC-1155 Hardhat proof remains a separate experiment. In particular, ERC-20 and ERC-20 Burnable inheritance is **not** evidence of interoperability with ERC-721 or ERC-1155.
