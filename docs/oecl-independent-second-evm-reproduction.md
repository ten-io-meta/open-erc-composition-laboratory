# OECL independent *second EVM execution* and cross-run disagreement gate

## Why a new experiment is necessary

PR #43 confirmed a source-backed, human-model-derived economic hypothesis was
falsified for fixed OpenZeppelin and Solmate ERC-4626 vault fixtures under one
local Hardhat run: an automatically selected 2-asset donation followed by a
21-asset withdrawal burns 21 OpenZeppelin shares versus 20 Solmate shares.
Its independent reviewer on a second CI worker only reconstructed the
**archived first EVM witness**; it did not mine a second set of transactions.

This PR closes exactly that methodological gap by having **another, separate
GitHub Actions job mine a fresh 14-transaction, six-control experiment** with a
second EVM executor implementation. It then reconciles the original receipt
archive and the new chain, preserving both reports for later researchers.

A successful reproduction is an independently repeated **local experiment**,
not independent Ethereum consensus, a third-party audit, a certified library,
an authenticated upstream code source, ERC-wide compatibility or a real-world
market safety claim.

## Independent executions

The first workflow job remains unchanged: it compiles locked sources, performs
the deterministic bounded 480-candidate search, preregisters a source-bound
proposal, and mines 14 receipts and six nonmined calls (four reverts, two
successful simulations) across the two vault implementations.

A **separate** job `independent-local-evm-replay` now:

1. Checks out the exact OpenZeppelin dependency commit and Solmate revision
   `89365b880c4f3c786bdd453d4b8e8fe410344a69`; rechecks four Git
   blobs, locked package dependency SHA and installs the frozen toolchain.
2. Proves that absent the second-runner local-only CI gate, no witness
   can be emitted; additionally requires the GitHub Actions context and
   the expected job identity. These flags are **CI policy scopes**, not
   cryptographic human signatures or an agent's consent.
3. Recompiles Solidity and validates the full preregistered proposal
   against newly compiled ABIs and bytecode hashes. It never reads or
   imports the first-run EVM witness or first EVM executor.
4. Deploys **new local copies** of the ERC-20 test asset and both ERC-4626
   vaults. Its own execution algorithm mines five transactions per vault
   plus two deployment transactions, checks each mined transaction with
   the local RPC, and checks every intermediate asset and share ledger.
5. Runs independently the pre-donation revert, post-donation successful
   `eth_call`, and post-donation revert, verifying that none mined a
   block and that the source-specific `maxWithdraw` and preview values
   match the preregistered falsifiable hypothesis.
6. Archives a **new** `OECL_INDEPENDENT_SECOND_LOCAL_EVM_WITNESS_V1`
   with mined receipts, event decoding, pre/post states, runtime code
   hashes and the CI run/job identity.

Both local runs use **the same reviewed source revisions, Solidity
compiler, Hardhat engine and deterministic research fixtures**, so this
is an independent CI run/executor implementation, not independent
blockchain client diversity. Deterministic test keys or block timestamps
may cause identical local transaction hashes or contract addresses;
their distinctness is *not* evidence of separate computation. The CI
job boundary, separate execution implementation and new onchain RPC
checks provide the reproduction claim.

## Independent scientific comparator

A third program, `scripts/compare-auto-counterexample-independent-evms.cjs`:

- Runs the previously independent accounting verifier on **each
  complete witness** (without trusting claimed verdicts).
- Checks both source-proposal hashes and each recompiled runtime hash.
- Compares all **16 typed logical steps** across the two runs and the
  actual asset/share deltas, previews, `maxWithdraw` results and
  `eth_call` control outcomes.
- Compares transaction event values after mapping addresses to their
  semantic roles; it never requires equal raw wallet addresses or
  tx/block hashes across independent EVMs.
- Checks all 28 mined receipts and all 12 nonmined calls across
  the two executions and preserves the two independently observed
  21/20 share burn results.
- Produces `REPRODUCED_SCOPED_LOCAL_EVM` **only when both runs' events
  and balances are independently valid and mutually consistent**.
- Otherwise emits
  `EVIDENCE_DISAGREEMENT_REQUIRES_INVESTIGATION`, returns nonzero
  from CI and recommends a further bounded experiment. Every
  discrepancy retains `scientificVerdict=INCONCLUSIVE`,
  `compatibilityVerdict=NOT_EVALUATED` and
  `candidateAdmission=NOT_ADMITTED`.

The successful record separates the **scoped falsification**
`REFUTED_IN_TWO_CI_LOCAL_EVM_EXECUTIONS` from the global
`INCONCLUSIVE` verdict. The refuted proposition is narrowly
"the two selected vault implementations burn equal shares under
the same donation and withdrawal" under this exact fixture.
The two implementations' distinct rounding formulas do not by
themselves represent a defect or incompatibility.

## Adversarial controls and limits

The fail-closed comparator is tested with **48 different modified
plan/first-witness/second-witness cases** including a false admitted
candidate, fake universal proof, forged mined receipts, altered
asset supply, different `maxWithdraw`, false negative controls,
wrong emitted events and changing runtime code identity. The
test must reject each while preserving `INCONCLUSIVE` and
`NOT_ADMITTED`.

GitHub Actions uploads the independent witness and reconciliation
whether the comparison succeeds or fails. This lets a future reviewer
examine discrepancies rather than hide them.

The original Solmate source files are `AGPL-3.0-only`, soft-deprecated
and unvendored; manual license review is required before distribution.
The research-only ERC-20 mint is intentionally unsafe for live use.
No live RPC, wallet, public execution API, ENS / ERC-8004 identity,
payments or external-agent signing is introduced.

## Integration with the quality contract / claim ledger

The PR is **stacked on #43**, not on the unrelated quality-contract
branch #44 → #45 → #46, because that branch remains unmerged.
The cross-run JSON contains explicit hypothesis, observation,
scoped falsification, global verdict and uncertainty fields but is
not advertised as a public OECL main-flow quality contract yet.

Only after both draft stacks are reviewed and merged/rebased should
an explicit **adapter** take the new independent local-EVM comparison
into the quality-contract and claim-ledger APIs. The adapter must
not change historical ERC-8060 × ERC-8098 observations and must
continue to refuse admission or universal compatibility.

## Existing PR safety and merge review

At the start of this work, the exact-head Actions checks for #44,
#45, #46 and #43 were all green (10/10, 7/7, 10/10, 9/9).
The implementation-specific review found these remaining trust
boundaries, which must stay visible during human review:

- The quality-contract verifier structurally checks producer data;
  mutable `master` ERC documents require external origin authentication.
- The portable verifier checks SHA and source bytes supplied to it;
  matching two files obtained from one compromised server cannot
  authenticate the source independently.
- The #46 claim ledger deliberately refuses hypothesis-volume
  scores and unearned security/economic utility claims, but is still
  not an independent EVM replay.
- The source-bound planner #43 automatically searches *parameters*,
  not arbitrary economic laws or novel Solidity implementations.
- Green tests are necessary but not sufficient for a security audit;
  human source and AGPL/compliance review is still required.
- The user alone decides and performs merges, in stack order
  #44 → #45 → #46 and #39 → #40 → #41 → #42 → #43 → #47.

No merges or review comments are automatically posted.
