# PR #16 — Independent ERC-8060 × OpenZeppelin ERC20Burnable EVM review

**Reviewed:** 2026-11-22  
**Target:** PR #15 `feat/oecl-v2-path-feasibility`  
**Decision:** **RESEARCH-ONLY / DRAFT. NO MAIN MERGE OR MAINNET DEPLOYMENT.**

## Exact provenance

- ERC-8060 participant: `ten-io-meta/erc8060-native-eth-value@c7eed906835ab39fbc8439eb0493e5a5371b23a2`, unchanged `contracts/ERC8060Reference.sol`.
- Token participant: OpenZeppelin v4.9.6 `ERC20Burnable`, verified against pinned git commit `dc44c9f1a4c3b10af99492eed84f83ed244203f6`. **ERC20Burnable is an abstract extension, not an ERC standard or standalone deployable protocol.**
- The deployable `OECLBurnableFixture`, `OECL8060BurnableCoordinator`, and adversarial callback caller are **purpose-built OECL local test contracts**. They are not independently deployed production composability solutions, nor original participant ERC source modifications.
- The GitHub Action runs on ephemeral local Hardhat chain ID 31337; transaction IDs are **not public-chain receipts** and do not establish an external Ethereum event history.

## Observed execution and limits

The previously verified source-pinned workflow run [45032636392](https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/45032636392) passed with **9 Hardhat tests**, **10 local EVM receipts** (**3 positive, 7 failed/reverted**), and **16 rejected evidence-forgery controls**. Cases include:
- legitimate NFT custody, ERC-721 approval, ERC-20 allowance and sequential atomic NFT/token burn;
- unauthorized ownership, missing NFT approval, missing ERC-20 allowance, insufficient ERC-20 balance;
- deliberately injected second-leg token burn failure and rollback of the first leg;
- hostile ETH receiver, rejected reentrancy and second redemption after the first NFT burn.

The first positive control records a **0.10 ETH NFT-liability decrease / 0.10 ETH payout** and **1 ERC-20 base-token-unit burn** (1 × 10^18 base units) in one local transaction. The two burn semantics belong to distinct contracts; the fixture must not be interpreted as canonical ERC-8098.

The native `ScientificCompositionConstraintEvaluatorEngine` observes **four source-anchored numeric predicates**: NFT backing solvency, exact redemption amount, non-increasing fungible supply *within the recorded operation*, and exact ERC-20 burn quantity. They evaluate **local `SUPPORT` only**. The native discovery/admission engine does **not** admit a new candidate: final status remains `INCONCLUSIVE` and `NOT_ADMITTED`.

## Scientific and security limitations

1. The experiment demonstrates bounded atomic behavior for **this exact chosen coordinator** and fixture. It does **not** prove the generic AST source hypothesis automatically discovers an executable coordinator, or that the same composition works for arbitrary implementations.
2. Independent participant baselines, both participant ablations, complete candidate admission, and tests against a broader adversarial implementation matrix are still missing. No emergent property has been scientifically admitted.
3. The contract fixture has an authorized test-only `setFailBurnForTest` switch; production claims about immutable, admin-free behavior would be false.
4. The coordinator includes a payable `receive()` and no general mechanism to recover mistaken direct deposits. **Do not send live ETH or tokens** to this fixture. Gas griefing, malicious ERC-20 behavior, forced ETH, race/concurrency and diverse payout recipients have not been exhaustively analyzed.
5. The receipt verifier cross-checks source file identities, code hashes, scenario records, snapshots and receipt metadata produced by the local test suite. It does **not** independently replay all on-chain receipts through a second EVM implementation; integrity checks and transaction-log assertions are bounded by the test harness itself.
6. The OpenZeppelin v4.9.6 dependency is locked but is not automatically free of package audit advisories. Exact lockfile, Solidity compiler versions and runtime code must be kept attached to the evidence.
7. A green GitHub Action is not a security certification or an admission of ERC-wide compatibility.

## Upstream integration performed during this review

- Reconciled current PR #15 into PR #16 while preserving original PR #16 test-only integration files and both Git parent histories.
- Fixed the historic core-regression runner routing: `scripts/check-independent-burnable-native-properties.ts` requires **six pinned source/EVM/native inputs**, so it must be recorded as an **eleventh integration-routed check**, never executed parameterlessly or falsely marked PASS.
- The independent EVM workflow now triggers on edits to its parameterized native checker, its routing manifest or route-integrity verifier, in addition to fixture/harness changes.
- `scripts/check-routed-scientific-workflows.ts` still mandates the original ten pinned checks and checks each additional routed test for one exact invocation.
- No ERC reference repository and no OECL `main` branch have been modified.

## Merge and release gate

- [ ] Confirm all relevant GitHub Actions successful on the **latest reconciled PR #16 commit**, especially independent EVM + native evaluator, scientific regression, source AST falsification, web and pinned joint recipe.
- [ ] Keep the 11 external integrations correctly attributed to their independent workflows and **four live The Graph credentials** explicitly NOT RUN until verified.
- [ ] Reconcile stacked PR #17 with this version without losing its read-only web evidence and artifact SHA checks.
- [ ] Independent review of coordinator permission/custody flow, reentrancy/ETH payout and provenance limitations before any promotion to production.
- [ ] Do not claim `ADMITTED`, emergent property discovered, source-wide safety or public chain deployment.

**Decision:** retain Draft, continue to PR #17 only after the new CI is checked; the existing local experimental support remains narrower than a scientific composition admission.
