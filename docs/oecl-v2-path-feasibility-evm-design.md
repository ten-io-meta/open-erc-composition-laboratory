# OECL v2 — Source-path feasibility and independent EVM experiment design

## Scientific purpose

A compiler-resolved Solidity AST call edge proves that the source contains a
call relationship. It does **not** prove that the corresponding operation is
executable in a concrete EVM state. This phase screens source-derived
composition hypotheses for necessary guards, authentication constraints,
inherited modifiers, exits and unresolved dependencies, then emits proposed
independent EVM tests. It does not execute any new EVM experiment.

## Implemented

`ScientificAstPathFeasibility.cjs` examines the same pinned `solc` AST
that produced the existing OECL structural graph, without scanning source
strings to infer capability semantics. For each state-decrease hypothesis, it:

1. Anchors each proposed path to solc function IDs and exact call/write
   offsets from `ScientificSolidityAstGraph.cjs`.
2. Inspects straight-line prerequisite `require`/`assert` checks and
   `if (condition) revert` guards preceding a particular call or write.
3. Represents *pure*, typed identifier-versus-literal comparisons by
   compiler declaration ID. Only adjacent guard segments can establish
   contradictions; assignments, calls and other unmodeled statements
   terminate such segments.
4. Detects boolean, equality/inequality and interval contradictions that
   necessarily abort that particular modeled path.
5. Inspects directly applied and inherited modifiers for prerequisite
   guards, authorization requirements and presence of Solidity's
   placeholder. A modifier with no placeholder suppresses its attached
   function body.
6. Distinguishes concrete blockers from unknown conditions, environmental
   state, external callbacks, dynamic dispatch and unmodeled paths.
7. Refuses to classify any path as executable purely from AST facts.

### Two distinct scientific outcomes

- `PROVEN_BLOCKED_WITHIN_MODELED_AST_PATH`: the particular source path
  contains an unavoidable local conflict (e.g. adjacent contradictory
  guards) or an inherited modifier that cannot reach the function body.
  This does **not** mean the protocol is globally incompatible: alternative
  call sites and other implementations may differ.
- `NOT_PROVEN_EXECUTABLE`: no such proof was obtained. This is *not*
  a positive feasibility result.

Full source discovery and composition admission remain `INCONCLUSIVE`
and `NOT_ADMITTED`. The separate scientific EVM polarity is unchanged.

## Real findings (pinned source CI)

The first four live source regressions produced:

| Source pair | Path-screen result | Evidence and limitation |
| --- | --- | --- |
| ERC-8060 × ERC-8098 | Both participant paths NOT_PROVEN_EXECUTABLE | ERC-8060 authorization, ETH funding/environment and external callback dependencies; ERC-8098 inherited ERC-20 constraints and unresolved execution context |
| ERC-8060 × ERC-20 Burnable | Both participant paths NOT_PROVEN_EXECUTABLE | Same ERC-8060 checks and ERC-20 inherited burn restrictions; no proven cross-asset coordinator |
| ERC-8098 × ERC-20 | NO_EXECUTABLE_ROUTE_SPECIFIED | Shared inheritance is a structural relation, not a composed action |
| ERC-1155 × ERC-20 | No discovered hypothesis | Absence is inconclusive, not incompatibility |

The ERC-8060 `burn` route has a prerequisite
`ownerOf(tokenId) == msg.sender`; the referenced code also checks contract
ETH availability. For ERC-8098 the inherited `_burn` applies account and
balance checks. These observations are source facts; their satisfiability
in a specific transaction has **not** been proven by this screen.

The later external ETH payout and its `success` check are relevant even
if the NFT state decrease has already occurred: an EVM revert can unwind
the entire transaction. The current screen is intentionally local to the
target call/write offset and cannot substitute for whole-transaction
revert analysis or EVM traces.

## EVM experiments to build next — independent, not fabricated

For every `POTENTIAL_COUPLED_STATE_DECREASE` hypothesis, the
`path-feasibility.json` artifact carries a **design-only** test plan.
Execute only in a *new*, separately reviewed and sandboxed harness using
the exact pinned source revisions, and publish receipts independently of
the original ERC-8060 × ERC-8098 demo.

| Scenario | Preconditions | Required observation |
| --- | --- | --- |
| Authorized funded positive control | Exact source revisions, legitimate asset owner and balances, valid coordinator custody if needed | Two measured state transitions with transaction hash and pre/post snapshots; no global compatibility assertion |
| Unauthorized caller | Caller does not own the NFT or lacks applicable burn permissions | Revert or other observed failure, no value/supply leakage |
| Insufficient backing or token balance | Wrong ETH obligation state or ERC-20 amount exceeding available balance | Revert, original state preserved |
| Missing delegated approval | Coordinator attempts `burnFrom` or NFT transfer without required approval | No completion of unauthorized burn |
| Second-leg failure | First leg passes, second leg deliberately reverts | Atomic rollback of both protocol states and ETH flows |
| ETH payout refusal and reentrancy | A receiver rejects ETH or performs callback attempts | Recorded revert/defense behavior, solvency and state invariants |
| Repeated operation | Attempt redemption/burn twice against the same state | No unintended double redemption or supply increase |

**Critical:** the coordinator's `msg.sender` is not the end user. If
ERC-8060 demands direct NFT ownership, successful composition may require
prior transfer of custody to the coordinator. Do not infer permission via
ERC-20 `allowance` when the source only exposes `burn` under direct
ownership. NFT approval, ERC-20 allowance and payout recipient must be
tested separately.

For a zero-hypothesis result or a shared-standard inheritance relation,
**do not** create an EVM "compatibility test" absent an explicitly
source-supported interaction mechanism.

### Required evidence gate before any EVM scientific conclusion

The independent EVM worker must emit: git revisions, exact source SHA-256,
dependency lock/solc version, bytecode hashes, chain ID, transaction
calldata and hash, accounts/roles, funding/custody setup, guard observations,
pre/post storage and balances, reverted state, gas and logs, negative
controls, and a reproducibility receipt. Candidate admission depends on
the native OECL scientific evaluator, not on a web page or a successful
single transaction.

## Testing and traceability

New artifacts produced for each source pair:

- `path-feasibility.json` — AST-local screen, path IDs, prerequisite
  guards, inherited modifiers, blockers and unknowns, experiment designs
- `source-scientific-report.json` — SHA-256 of this additional artifact,
  conservative summary and unchanged scientific verdict
- `structural-ast-graph.json` and `generic-source-hypotheses.json` —
  original compiler/source relations and digests

The browser graph projector now refuses a new source report that announces
path feasibility without its matching artifact/hash and original hypothesis
identities. The four public source graph examples were regenerated from CI with the
validated path-feasibility report included. Historical underlying source
revisions, graph hypotheses and INCONCLUSIVE verdicts remain unchanged. A newly verified job can display source blockers, permissions
and *unexecuted* EVM plans below the graph.

Falsification controls check contradicting numeric/boolean guard segments,
conditional aborts, inherited modifiers with no placeholder, conflicting
modifier guards, mutable-state barriers, multiple call sites, nested
conditional calls, malformed source hashes and forged scientific verdicts.

## Limitations and next implementation

The current AST screen does not implement full symbolic execution, SMT
solving, gas analysis, external callbacks, contract role satisfiability,
modifier parameter substitutions, loop invariants, virtual dispatch or
cross-protocol transaction synthesis. All such unknowns remain explicit.

**Next milestone:** design and execute a separate EVM test worker for
source-proposed interactions where a real compositional adapter can be
constructed without inventing capabilities. Admission decisions must
remain evidence-gated and reversible after adverse counterexamples.
