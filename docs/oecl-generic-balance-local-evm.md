# Issue #37 — generic ABI-selected local EVM state experiments

## Dependency and scope
This increment is stacked on draft PR #36, not on main. It is a reviewed **operation grammar** with two pinned OpenZeppelin 4.9.6 ERC-20-like implementations: ERC-20 and ERC-20 Burnable. Burnable is an extension, not a distinct ERC standard. It remains intentionally narrow: **not** arbitrary verified-code execution, mainnet safety, or ERC composability.

### Reproducible scientific question
**Hypothesis**: A verified ABI `transfer(address,uint256)` with a compiler-resolved storage-write path should, under appropriate preconditions, update the sender/recipient balances by the transferred quantity while preserving total supply.

**Prediction**: An initialized 100-unit sender balance should become 75 after transferring 25 and 65 after another 10, while the recipient receives 25 then 35; total supply remains 100.

**Falsifier**: A confirmed mined transfer with those fulfilled preconditions that fails the predicted balance/supply deltas contradicts the scoped hypothesis. A simulated revert under *violated* preconditions is an adversarial control, **not** a falsification of the conditional hypothesis.

**Adversarial controls**: A caller without an allowance cannot use `transferFrom`; a 101-unit transfer against insufficient sender balance fails; a nonzero transfer to the zero address fails. All three are `callStatic`-style `eth_call` simulations per fixture, *not* mined reverted transactions.

## Threat model and experimental protocol
1. Resolve exactly two source profiles from the existing read-only registry, verify lock SHA-256, verify compiler version and reconstruct compiler ABI, AST and structural hypothesis identities.
2. Require a typed, unambiguous `transfer(address,uint256)` ABI and compiler structural path to `_balances`. An unresolved internal AST reference remains explicitly unproven; **only the separately reviewed policy** permits this local test.
3. Compile immutably hash-identified test-only fixtures with a plainly disclosed unprotected `oeclResearchMint`. Original production contracts are unchanged; never deploy these fixtures publicly.
4. Preregister the plan and its SHA-256, including the shared seven-step experiment and amount/gas bounds, before Hardhat dispatch.
5. Execute separately in ephemeral Hardhat chain 31337. For mined successful actions, independently fetch receipt, block and transaction, verify sender and calldata selector, parse the typed `Transfer` event, check state snapshots.
6. Archive evidence: two fixture deployments, eight mined mint/transfer transactions and six unmined negative controls. **These are design expectations until confirmed by passing CI**, not a reported observation.
7. In a fresh CI runner, recompile source+fixtures, compare the exact plan, and separately reconstruct archived receipt/event/balance arithmetic with a distinct verifier. The revisor cannot query the destroyed temporary provider; it does not prove mainnet semantics.
8. Preserve `scientificVerdict=INCONCLUSIVE` for wider scientific claims, `candidateAdmission=NOT_ADMITTED`, and `compatibilityVerdict=NOT_EVALUATED`, even if the scoped balance predictions are observed.

### Reproduce with pinned dependency checkout
The GitHub Action `.github/workflows/oecl-generic-balance-local-evm.yml` performs the complete workflow and archives JSON files. After cloning the dependency checkout at commit `c7eed906835ab39fbc8439eb0493e5a5371b23a2`, installing from the pinned lock with `npm ci --ignore-scripts`, and symlinking the audited toolchain `node_modules` as in CI:

```bash
node --test oecl/scripts/check-generic-balance-evm.test.cjs
node oecl/laboratory/scientific-open-source-worker/run-generic-balance-evm.cjs plan ERC-20 ERC-20-BURNABLE dependency-source source-output/generic-balance
HARDHAT_NETWORK=hardhat node oecl/laboratory/scientific-open-source-worker/run-generic-balance-evm.cjs execute ERC-20 ERC-20-BURNABLE dependency-source source-output/generic-balance
HARDHAT_NETWORK=hardhat node oecl/laboratory/scientific-open-source-worker/run-generic-balance-evm.cjs plan ERC-20 ERC-20-BURNABLE dependency-source independent-balance
node oecl/scripts/review-generic-balance-evm.cjs source-output/generic-balance independent-balance
```

### Proof admission and compatibility boundary
A compiler structural write is not a guarantee that a path is reachable. The local test can support only observed behaviors of these **two separate fixture deployments**, not a cross-contract interoperability verdict or the absence of bugs in the original ERC implementation. No user-provided calldata, unreviewed constructor, RPC endpoint or wallet is accepted. CI remains a precondition, not permission to merge. PR #36 stays separate, and this stacked PR #38 must remain a draft until exact-head security and regression checks pass.
