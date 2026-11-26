# OECL reusable vault operation grammar — two variants from one pinned source

## Hypothesis and provenance
The blind ERC-4626 × ERC-20 source run in PR #39 identified structural writes but
did not design a complete executable deposit/withdraw protocol. This increment
turns that separately reviewed *operation family* into a typed, bounded
data-only program: `FUND_ASSET`, `ALLOW`, `CUSTODY_IN`, `CUSTODY_OUT`,
`REVERT`. The same nine-step program executes without a per-variant
transaction-sequence switch.

Two reviewed, test-only derivatives of the **same** pinned OpenZeppelin 4.9.6
ERC-4626 base are used; the second overrides `_decimalsOffset()` from 0 to 1.
This changes the vault share ratio from 1 share per asset to 10 shares per
asset in an initially empty zero-fee vault. These are *not* two unrelated
verified vault implementations, and the grammar is **not** synthesized
without human rules. The asset fixture includes an unrestricted research
mint and must never be used outside ephemeral Hardhat 31337.

## Expected experiment results (must be confirmed by GitHub CI)
For each variant:
- Mint 100 assets; simulate a deposit without approval.
- Approve 40, deposit 40, simulate attacker and excessive withdrawal.
- Withdraw 15, approve 101, simulate the deposit of 101 with only 75 left.
- Exact signed/typed ABI, unchanged before/after state for unmined simulated
  failures, and **mined** success receipts and typed `Approval`, `Transfer`,
  `Deposit`, `Withdraw` events must be checked.
- End owner assets 75, vault underlying assets 25, underlying supply 100,
  allowance 101; owner and total shares 25 (offset 0) or 250 (offset 1).

Across both variants, the expected evidence is **14 mined receipts including
4 deployments**, **8 separate unmined `eth_call` reversions**, an independently
recompiled plan, an independent share/asset and event reconciliation, and
22 tampered witness mutations rejected. These numbers are goals until they
appear in completed GitHub Actions runs.

## Autonomy measurement
The runtime program contains only generic operation types, target references,
actor references and bounded symbolic arguments. The transition calculator
uses the *actual* pre-operation `previewDeposit` and `previewWithdraw` value;
an independent verifier also checks the expected 1× vs 10× offset math so
the preview cannot become a circular proof. The source policy fixes the
candidate contracts, compiler, typed ABI, deployment fixture bytes, and
variant set. Missing source facts, changed ABI, unreviewed bytecode, mutated
arguments, or unexpected ratios must block execution.

This demonstrates a **reused operator grammar across two changes in ERC4626
share behavior** if tests pass. It does not establish independence from the
OZ ERC4626 source, automated construction of the operation program, or
generalized ERC compatibility.

## Evidence status
`scientificVerdict=INCONCLUSIVE`, `candidateAdmission=NOT_ADMITTED`,
`compatibilityVerdict=NOT_EVALUATED` and absence of a public EVM
dispatcher are mandatory. Negative `eth_call` controls are *not* mined
reverts. Second-runner archive verification cannot query the destroyed
Hardhat blocks and is not an external Ethereum consensus attestation.

## Reproducibility and release gate
The workflow `.github/workflows/oecl-reusable-vault-grammar.yml` pins the
existing compiler dependency revision and `package-lock.json`, runs
`node --test scripts/check-reusable-vault-grammar.test.cjs`,
preregisters the same plan in two independent runners and runs a local
Hardhat witness with its independent event/state/falsification checks.
The PR remains draft and **must not be merged** until its entire CI
(including PR #39 dependency and MISL legacy regression) passes on the
exact head and the local-only safety boundary is reviewed.
