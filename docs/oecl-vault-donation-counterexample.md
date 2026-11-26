# OECL donation-driven ERC-4626 counterexample — preregistered experiment

## Scientific question
After an underlying ERC-20 donation to an ERC-4626 vault, do two
independent implementations burn the **same** amount of vault shares
when a holder withdraws the same 15 underlying assets?

The preregistered hypothesis `EQUAL_SHARE_BURN_AFTER_DONATION`
predicts equal share burns. The anticipated **falsifier**, sourced
from the two pinned ERC-4626 implementations, is a *mined* withdrawal
that burns **11 OpenZeppelin 4.9.6 shares versus 10 Solmate shares**
with identical initial 40-share deposits and an external donation
of 20 underlying units. This is a conditional scoped hypothesis, not
a declaration that ERC-4626 is incompatible with ERC-20.

## Source-grounded prediction, not EVM evidence
The reviewed OpenZeppelin code computes withdraw shares using
`ceil(assets * (totalSupply + 1) / (totalAssets + 1))`
at `_decimalsOffset()=0`. The pinned Solmate code computes
`ceil(assets * totalSupply / totalAssets)` when supply is nonzero.
For a vault with **40 shares and 60 underlying assets**:

| Prediction after donation | OZ ERC-4626 | Solmate ERC-4626 |
|---|---:|---:|
| `previewWithdraw(15)` shares to burn | 11 | 10 |
| `previewWithdraw(41)` shares to burn | 28 | 28 |
| `maxWithdraw(owner)` | 59 | 60 |
| Shares remaining after mined withdraw(15) | 29 | 30 |
| Underlying asset balance in vault | 45 | 45 |
| Owner underlying balance | 55 | 55 |

### Why the old negative control would become wrong
Before donating, withdrawing 41 against 40 assets/shares must
revert for the owner, verified by **unmined** `eth_call`.
After donating 20, `maxWithdraw(owner)` rises above 41 in both
implementations; a *second unmined* `eth_call` of the same
`withdraw(41)` must succeed without changing the chain state.
Therefore the older hardcoded “overwithdraw 41 must always revert”
assumption is false under the new preconditions. We replace the
remaining invalid-withdrawal negative case with `withdraw(61)`,
which is above both donation-adjusted withdrawal capacities.

## Local protocol
This is an augmentation of the unchanged nine-step typed grammar
in PR #40: a bounded `DONATE_ASSET` token transfer and two explicit
pre/post-validity controls are inserted. The same **12-step program**
runs on both pinned, reviewed local test fixtures:

- Mint 100 asset units; test an unapproved deposit (unmined revert)
- Approve/deposit 40, minting 40 shares
- Test `withdraw(41)` without donation (unmined revert)
- Donate 20 assets **directly**, with no ERC-4626 shares minted (mined)
- Test `withdraw(41)` after donation (**unmined successful simulation**)
- Test unauthorized withdraw and over-withdraw 61 (unmined reverts)
- Withdraw 15 (mined); compare emitted events, rounded burned shares
- Approve 101 and test an insufficient-asset deposit (unmined revert)

Per implementation: 2 deployments + 6 successful mined actions =
**8 mined receipts**, **5 unmined expected-revert simulations** and
**1 unmined expected-success simulation**. Across both: 16 mined, 10
unmined expected reverts, 2 unmined successful calls. These are
*expected protocol counts until GitHub Actions confirms them*.

A separate recompiled, source-locked GitHub runner must compare the
complete preregistered program and independently reconstruct all
archived balance arithmetic, emitted events, preview values, receipts
and the scoped falsification. A witness-falsifier suite must reject
30 changed records.

## Important boundaries
- The source files are OpenZeppelin 4.9.6 and Solmate pinned to Git
  `89365b880c4f3c786bdd453d4b8e8fe410344a69`, with four
  checked Git blob hashes. Solmate source files contain
  `SPDX-License-Identifier: AGPL-3.0-only` and are loaded from
  a separate Git checkout, never vendored into OECL.
- The Solmate implementation is soft-deprecated and unsuitable for
  unreviewed live deployments; it is a research comparator only.
- A reviewed Solmate adapter implements its abstract `totalAssets()`
  as the underlying token balance of the local vault. The asset
  fixture has an unrestricted mint helper. Neither is public safe.
- Donations and parameter choices are **human-designed controlled
  experiments**, not autonomously synthesized from the ABI/AST.
- `eth_call` success does not count as a mined successful withdrawal.
  Reverts simulated by `eth_call` are also not mined receipts.
- The scoped hypothesis may be **REFUTED_IN_LOCAL_TEST_FIXTURES** while
  overall `scientificVerdict=INCONCLUSIVE`,
  `compatibilityVerdict=NOT_EVALUATED` and
  `candidateAdmission=NOT_ADMITTED` remain unchanged.
- This does not establish vulnerability, mainnet market safety, all
  ERC-4626 implementations' rounding behavior or ERC-wide
  interoperability.

## Merge gate
PR #42 is stacked on PR #41, which depends on #40 and #39. No merge
or promotion until the dedicated local EVM, independent runner,
legacy MISL regressions and human security/license review are
complete on the exact head commit. The user alone posts comments
and merges via their own GitHub account.
