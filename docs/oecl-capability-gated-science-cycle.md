# OECL capability-gated scientist cycle (draft)

This increment works on top of PR #29 (which is stacked on #28 → #27 → #26). It is **not** a production or public executor.

## What is connected

1. **Source → hypothesis:** for every precompiled registry pair, the compiler AST, path feasibility screen, source report and hypothesis artifact must agree on content-derived SHA-256s. The proposal is a *question*, not evidence of executable behavior.
2. **Hypothesis → falsifier:** a deterministic question identifies the relevant condition and a possible counterexample. No generic action is run on a pair without a reviewed adapter.
3. **Capability gate:** currently only the source-registered **ERC-8098 × ERC-4626** adapter can be marked `REVIEWED_LOCAL_EVM_PROTOCOL_PREREGISTERED`, and only when its exact original AST-derived plan plus four preregistered boundary challenges match the selected source identities, roles, root SHA-256s and call paths. All other pairs stay blocked or source-only.
4. **Experiment:** the **existing** pinned Hardhat experiment performs eligible positive-quantity calls and zero-quantity / over-owned-balance controls. The planner never executes arbitrary bytecode or trusts a source-only assertion as a receipt.
5. **Independent review → scoped conclusion:** only *after* the established independent replay has checked source and EVM artifacts, the new concluding step checks source-plan / challenge-plan and positive / negative EVM artifact hashes, original hypothesis identity, scoped positive numeric decrease, mined positive and zero-quantity receipts, and unmined callStatic negative controls. It may issue `SCOPED_POSITIVE_SUPPORTED_BUT_UNIVERSAL_OVERCLAIMS_REFUTED` for each tested operation. **No original AST structural hypothesis is declared disproven by the boundary cases**, and global `scientificVerdict` remains `INCONCLUSIVE`, compatibility `NOT_EVALUATED`, admission `NOT_ADMITTED`.

## How to reproduce

The `OECL Generic Solidity Source AST Laboratory` workflow runs the following on ordinary pull requests (not manual arbitrary-source dispatch):

- `node oecl/scripts/check-capability-gated-scientific-cycle.cjs` — synthetic adversarial tests with tampered graph identifiers, duplicate cases, substituted sources, missing adapters, missing EVM evidence, forged numeric results and forged compatibility conclusions.
- `node oecl/laboratory/scientific-open-source-worker/CapabilityGatedScienceCycle.cjs plan source-output` — creates a source-only protocol JSON per precompiled `pair-*` directory **before EVM deployment**.
- Existing pinned local EVM harness and independent replay.
- `node laboratory/scientific-open-source-worker/CapabilityGatedScienceCycle.cjs conclude source-output/pair-8098-4626 audit-output/scientist-ast-self-falsification-review.json audit-output/scientist-capability-gated-cycle.json` — creates an auditable, bounded conclusion **after** independent replay.

GitHub Actions artifacts retain `source-output/**/capability-gated-scientific-cycle.json` and `audit-output/scientist-capability-gated-cycle.json` for same-run comparison.

## Limitations and release requirements

- The planner is **deterministic**. It does not demonstrate free-form AI reasoning, a generic EVM harness, fully autonomous adapter generation, or execution against all 626 documentary ERCs.
- Supported EVM execution uses **two reviewed, pinned local fixtures** for ERC-8098/4626 and ERC-4626/20. The 626 documents, registry-pair AST analysis and EVM contracts are separate evidence populations.
- ERCs with missing implementations/fixtures are not classified as incompatible. Negative read-only calls are not mined transactions. Mined local-provider receipts are not independently authenticated Ethereum mainnet proofs.
- Requires exact-head CI success, human review of contract-specific hypotheses and security boundaries, and explicit permission before merge or public deployment.

## Second family: distinguishing shared inheritance from behavioral equivalence

The ERC-4626 × ERC-20 AST emits **only** a shared ERC-20 inheritance hypothesis, not a paired state-decrease or cross-contract atomicity hypothesis. The second preregistered adapter deliberately checks the narrower proposition that two contracts sharing an ERC-20 base need not expose identical extended behavior.

The existing isolated OZ 4.9.6 Hardhat fixture is reused, not expanded to arbitrary code. It records:
- Successful, receipt-checked vault deposit (asset custody plus minted shares).
- Successful, receipt-checked vault redemption (asset custody plus burned shares).
- Read-only raw vault-deposit selector probing on the independent plain ERC20 asset, interpreted using ABI-decoding semantics rather than merely whether `eth_call` threw.
- Three separate unmined authorization/balance-revert controls.

This second protocol emits `SCOPED_BEHAVIORAL_DIFFERENCE_OBSERVED` only when a separately recomputed source-plan agrees with the committed preregistration and the same-run local EVM evidence passes independent artifact review. Its overall scientific and compatibility verdicts remain `INCONCLUSIVE` and `NOT_EVALUATED`.

Reproduction commands in the same workflow:
- `node oecl/laboratory/scientific-open-source-worker/CapabilityGatedScienceCycle.cjs plan source-output`
- Existing pinned `run-erc4626-erc20-evm.cjs` consumes the source plan before its first transaction.
- `node laboratory/scientific-open-source-worker/CapabilityGatedScienceCycle.cjs conclude-vault source-output/pair-4626-20 audit-output/scientist-vault-asset-capability-cycle.json`
- `node scripts/check-vault-asset-capability-cycle.cjs source-output/pair-4626-20` exercises tampered-source, tampered-return, duplicate receipt and inflated-admission regressions.

The intended hackathon claim is **a reproducible scoped scientific-cycle demonstrator with honest capability limits**, not a general autonomously operating Solidity scientist.
