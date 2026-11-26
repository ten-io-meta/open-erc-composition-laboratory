# OECL source-bound automatic counterexample proposal (v1)

## Problem
Previous PR #42 demonstrated a genuine scoped difference in how two pinned
ERC-4626 implementations burn shares after an underlying-asset donation,
but the **amounts** were manually chosen by an engineer. This increment
asks OECL to choose **a new falsifiable experiment** within a reviewed
finite search space, and to request its required approvals without
authorizing itself.

The new proposal is **not** autonomous discovery of economic laws or
general Solidity analysis. The intervention type (ERC-20 direct transfer
to a vault), the two share-price models and the operation-authorization
rules are **manually reviewed and bound to pinned sources**. Automatic
behavior is limited to finite parameter search and assembly of a
machine-readable, falsifiable, source-backed experiment request.

## Exact source and trust boundary
- Parent comparison is OpenZeppelin 4.9.6 ERC-4626 versus Solmate
  ERC-4626 at Git SHA `89365b880c4f3c786bdd453d4b8e8fe410344a69`.
- Four external Solmate Solidity Git blobs are checked, no vendoring.
- Source AST detects structural writes for deposit and withdraw.
- Compiler ABI proves the presence and exact typed signatures of
  `transfer`, `deposit`, `withdraw`, `previewWithdraw`,
  `maxWithdraw`, `totalAssets` and `totalSupply`.
- `SolmateCrossVaultProtocol` independently builds exact local
  fixtures and bytecode, whose hashes enter the proposal.
- **Source observations do not grant EVM execution permission.**
- Two economic prior models remain explicitly reviewed:
  OZ 4.9.6 uses `ceil(assets*(shares+1)/(totalAssets+1))`, while
  Solmate uses `ceil(assets*shares/totalAssets)` when shares exist.

## How OECL chooses a question
Under a reviewed fixture budget of 100 assets and a pre-funded
deposit of 40, the planner enumerates donation amounts **1–12**
and withdrawal amounts **1–40** (480 bounded candidates) in ascending
order. A candidate must keep owner funding nonnegative, allow the
withdrawal in both models and make the expected burned share amounts
*different*. The deterministic criterion is the **smallest donation**
and then the **smallest withdrawal** meeting those requirements.

The planner's independently testable prediction, subject to GitHub CI
validation, is:

| Quantity | Proposed value |
|---|---:|
| Owner starts with | 100 underlying assets |
| Initial vault deposit | 40 underlying assets |
| **Automatically selected donation** | **2 underlying assets** |
| **Automatically selected withdrawal** | **21 underlying assets** |
| OpenZeppelin burned shares | 21 |
| Solmate burned shares | 20 |
| Owner underlying balance after withdrawal | 79 |
| Vault underlying balance after withdrawal | 21 |
| OpenZeppelin shares remaining | 19 |
| Solmate shares remaining | 20 |

## Generated experimental preconditions and controls
The output includes a source-provenance digest, a falsifiable
null hypothesis, an explicit list of preconditions, an eight-step
typed research program and **ungranted** authorization requests.
The controls are state-dependent:
- `withdraw(41)` before the donation: expected revert, **unmined**
- Donate 2 by sending underlying ERC-20 directly to the vault: mined
- `withdraw(41)` after donation: expected success, **unmined**;
  maxWithdraw expected OZ 41 / Solmate 42
- `withdraw(43)` after donation: expected revert, **unmined**
- Finally withdraw 21: mined; check receipt, typed events, asset
  conservation and 21-versus-20 share burn

Each fixture has 2 deployment receipts + 5 mined research actions
and 3 simulated controls. Across both: target **14 mined receipts,
4 unmined expected reverts and 2 unmined expected successes**.
Counts are only claims after a completed CI workflow.

## Explicit authorization and review gates
The generated JSON is marked `SOURCE_ONLY_NO_DISPATCH`, with
`executionAuthorized=false`, `evmExecuted=false`,
`experimentDispatched=false`. Approval requests have `granted=false`.
The CLI `propose` path does not touch the EVM. Only the separate
`execute` path can enter ephemeral Hardhat, and it must:
- Rebuild the same proposal from exact compiler+source bytes;
- Match the archived proposal in full;
- Observe both `HARDHAT_NETWORK=hardhat` and
  `OECL_REVIEWED_LOCAL_REPLAY=REVIEWED_SOURCE_CI_GATE_V1`;
- Verify actual chain ID **31337**, pinned runtime bytecode,
  recipient, ABI selector, mined block and receipt, gas limit;
- Reject dispatch when the local CI policy variable is absent.

That CI variable represents approval of an **explicitly reviewed
CI replay policy**, not a free-standing human consent by any agent,
not ownership of funds and not a production permission.

## Proof and falsification
A dedicated GitHub Actions workflow:
1. Rechecks pinned toolchain and four exact Solmate Git blobs;
2. Checks bounded search and numeric-model unit tests;
3. Archives the proposal before any EVM execution;
4. Proves that `execute` fails with the review gate missing;
5. Performs only reviewed, bounded Hardhat local transactions;
6. Rejects altered proposals, forged authorization, changed
   receipts, wrong economic ledgers and false scientific verdicts;
7. Recompiles sources and regenerates the proposal on an
   **independent second runner**, reconciling archived receipts,
   typed events and source-specific preview formulas.

The second runner cannot access the vanished Hardhat chain after
the first job ends. Its verification is an independent archive
reconstruction, not an Ethereum mainnet attestation.

## Scientific result boundary
A specific hypothesis may be recorded as
`REFUTED_IN_THESE_LOCAL_EVM_FIXTURES` after evidence review.
Overall `scientificVerdict=INCONCLUSIVE`,
`compatibilityVerdict=NOT_EVALUATED` and
`candidateAdmission=NOT_ADMITTED` remain unchanged.

A model-derived prediction is **not** evidence of generalized ERC
compatibility or an automatically discovered source equation. The
next scientific milestones are independently learning economic
relationships, dynamically selecting witness preconditions beyond
registered profiles, and human-reviewed operation authorization.
There is no public execution endpoint, wallet, new external trust
path, production ERC-20 mint nor automatic GitHub merge.

## Release
This PR stacks on #42, which depends on #41, #40 and #39.
These remain separate unmerged research increments. Check exact-head
CI and manual source/license/security review, then merge in order
from the user's GitHub account only. Solmate is soft-deprecated and
its pinned source files are marked AGPL-3.0-only; compliance
considerations are explicitly unresolved.
