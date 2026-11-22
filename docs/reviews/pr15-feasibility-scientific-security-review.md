# PR #15 — AST path-feasibility scientific and security review

**Date:** 2026-11-22  
**Base:** PR #14 `feat/oecl-v2-source-graph-explorer`  
**Status:** **RESEARCH-ONLY, DRAFT.** No main merge, no new EVM executions, no general protocol compatibility or emergent-property admission.

## What this screen can actually establish

- The worker analyzes the compiler-generated `solc` AST and source-identical, commit-pinned Solidity dependencies. It checks guards preceding *specific* call/write offsets, conditional aborts, local typed identifier-vs-literal constraints, directly applied and inherited modifiers, and placeholder presence.
- The narrow outcome `PROVEN_BLOCKED_WITHIN_MODELED_AST_PATH` is an attempt to prove an obstruction **within one modeled source path**, not a global protocol incompatibility claim. No path is classified as `EXECUTABLE`.
- `NOT_PROVEN_EXECUTABLE` explicitly means evidence insufficient to establish feasibility; it does not imply blocked.
- A shared-standard inheritance hypothesis produces `NO_EXECUTABLE_ROUTE_SPECIFIED`; an empty discovery result remains `INCONCLUSIVE`.
- All output `path-feasibility.json` reports carry source graph/discovery digests, `INCONCLUSIVE`, `NOT_ADMITTED`, `evmExecuted=false`; EVM scenarios are design proposals only, not receipts.

## Adversarial flaw corrected in this review

Prior code treated `if (condition) revert(); else { ... }` as a pure prerequisite for the continuing path, even though the `else` arm may modify the very variable checked by subsequent `require(...)` statements. This could yield an unsound `PROVEN_BLOCKED_WITHIN_MODELED_AST_PATH` classification.

- `ScientificAstPathFeasibility.cjs` now accepts `if ... revert` / `if ... return` as a straight-line necessary guard **only when no else body exists**.
- `check-ast-path-feasibility.cjs` adds a mutating-else falsification case asserting `NOT_PROVEN_EXECUTABLE`. The old inversion-without-else positive blocked-control remains intact.
- The downgrade to unknown is conservative; it may miss an actual contradiction, but avoids claiming impossibility without proving it.
- **CI on this exact reconciled revision is a required release gate**, not assumed passed merely because the earlier revision had green checks.

## Known scientific uncertainties

- Conditions may depend on state mutations, contract calls, role/ownership, callback behavior, modifier argument substitution, branches, loops, inheritance, environmental state and dynamic dispatch.
- Adjacent modeled constraints are not a complete control-flow graph or an SMT proof; a `CALLS` edge is not evidence that the call can execute in a particular transaction.
- Some standalone source paths can fail due to a later revert outside the local write/call site. Only full EVM experiment replay can establish completed-transaction behavior.
- A locally blocked AST path never proves that all possible alternative call sites, adapters, or implementations are blocked.
- The screen does not execute Ethereum operations, synthesize a deployable coordinator, sign transactions, or grant candidate admission.
- Each finding must carry participant/source SHA, compiler AST identity, conditional/permission unknowns, and its unexecuted experiment design into the web. Source graph display must not silently promote unknowns.

## Pinned-source examples

| Pair | Expected result | Scope |
| --- | --- | --- |
| ERC-8060 × ERC-8098 | Participant routes `NOT_PROVEN_EXECUTABLE` | Owner checks, ETH prerequisites, inherited ERC-20 balances and callbacks remain contextual |
| ERC-8060 × ERC20Burnable | `NOT_PROVEN_EXECUTABLE` | Joint custody, approvals and caller context unresolved |
| ERC-8098 × ERC-20 | `NO_EXECUTABLE_ROUTE_SPECIFIED` | Shared base source relation, no proposed cross-contract action |
| ERC-1155 × ERC-20 | No discovered hypothesis | Not incompatibility |

## Review and release gate

- [ ] Require green **latest head SHA** in generic source AST worker, falsification controls (including mutating-else), web graph/digest/archive tests, native recipe, joint EVM and scientific core regression.
- [ ] Keep the source-analysis dispatch feature disabled by default and confined to pre-reviewed source profiles. Reconcile all prior read-only and authorization controls.
- [ ] Review any `PROVEN_BLOCKED` claims on independently compiled Solidity examples before treating the model as sound beyond its synthetic fixtures.
- [ ] Build and run the independent EVM control, ablation, rollback and adversarial matrix before promoting an interaction or an emergent-property conclusion.
- [ ] Keep PR #15 Draft. Do not merge it or update ERC source repositories automatically.

**Scientific decision:** this PR is valuable as a *falsifiable diagnostic screen*, not a proof engine or final ERC-composition verifier.
