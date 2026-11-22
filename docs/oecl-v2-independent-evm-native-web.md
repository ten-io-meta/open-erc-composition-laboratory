# OECL v2 — Independently verified EVM receipts and native-science web projection

This view joins two different stages of the same new analysis of
**ERC-8060 × ERC-20 Burnable**:

1. The generic AST worker discovered an **unadmitted** source-only hypothesis.
2. A separate local Hardhat EVM experiment checked a purpose-built coordinator,
   test-only OpenZeppelin ERC20Burnable fixture, and adversarial controls.
3. A source/transaction validator cross-checked the EVM receipts, changed
   state, deployed runtime bytecode hashes, source file SHA-256, toolchain,
   OpenZeppelin NPM package against the exact upstream v4.9.6 git revision,
   and the pinned ERC-8060 git revision.
4. The native OECL constraint engine evaluated **four numeric properties**
   from the real local transaction and exact source lines.

Evidence producer:
https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/45032636392

The public scientific read-only snapshot is
`web/src/data/oeclIndependentBurnableEvm.json`, with a SHA-256 pin in
`web/src/server/oeclIndependentEvmReport.ts`.

## Observed experiment summary

- 9 Hardhat test cases passed, generating 10 local-EVM transaction receipts
- 3 successful observations, including replay setup and controlled callback
- 7 failed or reverted transaction receipts with verified rollback
- 16 separate evidence-tampering negative controls rejected
- 4 native numeric source-derived properties were observed as consistent
- Local native **property** polarity: `SUPPORT`
- Final scientific **composition** verdict: `INCONCLUSIVE`
- Composition candidate: `NOT_ADMITTED`

The successful joint burn redeemed 0.10 ETH from the NFT and burned
1.0 ERC-20 token (1e18 base units) in the same local EVM transaction.

These are not universal properties of ERC-8060 or arbitrary ERC-20 tokens.
ERC20Burnable is an *extension* and its deployable instance in this
experiment is a test fixture. The coordinator is also experimental.
A local chain ID 31337 transaction hash does not refer to a public Ethereum
transaction.

### Unresolved scientific issues

The native property evaluator does not prove cross-protocol custody,
unbounded gas viability, callback safety for arbitrary receivers,
completeness of guards and virtual call paths, or robustness of every
possible implementation. A genuinely discovered candidate with a matching
native READY specification and complete scientific evidence surface is
still required before candidate admission. The adapter has no public
production deployment.

This stage must never silently convert local `SUPPORT` to global
`SUPPORTS`, compatibility certification, a contract audit, or
`ADMITTED`.

## Web interface

The existing source laboratory has an independent action:
**Explore verified independent EVM evidence** when
ERC-8060 and ERC-20 Burnable are selected.

The page displays the measured positive and negative EVM receipts,
their transaction hashes, source-anchored native constraints, outstanding
scientific limits and the original GitHub Action evidence.

The endpoint:
`GET /api/scientific/independent-evm?sourceA=ERC-8060&sourceB=ERC-20-BURNABLE`
is read-only and verifies the exact pinned snapshot before returning.
Append `&download=1` for the JSON evidence projection.

For other pairs, it returns 404 `NO_INDEPENDENT_EVM_REPORT`, with
`NOT_EVALUATED` rather than claiming incompatibility. The generic
source-only graph explorer continues to support its four pinned examples.
Other combinations must first earn their own independent EVM receipts.

### Current deployment boundary

The web source-graph and independent EVM evidence views are staged in draft
PRs; they have not been merged into the default branch or deployed.
A public arbitrary-source EVM worker is *not* enabled. Static read-only
examples require no GitHub or researcher keys.

## Next scientific and operational tasks

1. Review and merge the stacked PRs in order, only after resolving the
   incomplete historic regression and security alerts.
2. Confirm the complete user journey in the deployed website, including
   hash verification, missing-evidence states and accessibility.
3. Implement general experimental adapter synthesis with isolated EVM
   execution and meaningful negative controls for each new source hypothesis.
4. Add native READY candidate/specification/coverage gating and
   independent receipt replay before any global scientific admission.
