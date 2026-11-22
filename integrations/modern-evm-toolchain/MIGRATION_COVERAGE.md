# OECL — Hardhat 3 / Ethers 6 migration coverage (PR #22, Draft)

This file is **a migration checklist**, not a scientific discovery claim or release approval. The CI job below is the source of truth for observed results; a green workflow is required at this PR's exact head commit.

## Pinned scientific identities

- ERC-8060: `ten-io-meta/erc8060-native-eth-value@c7eed906835ab39fbc8439eb0493e5a5371b23a2`
- ERC-8098: `ten-io-meta/erc8098-reference@68a05289bd68d89db8453c49500e0a1ae6cd11ec`
- ERC-8060 original package-lock SHA256: `73a70b40bad9d064a244d1a36986b78be9adedc85d2043a6431add0c428b41b1`
- Historical source code, lockfiles and historical evidence are **never rewritten** by this work.

## Automated parity gates

| Historical experiment | Hardhat 3 / Ethers 6 experiment | Machine gate | Scope |
| --- | --- | --- | --- |
| `OECLPinnedReferences.test.js` | `modern-smoke.mjs` | `compare-pinned-evidence.cjs` | Positive payout, supply decrease, both burned event logs, nine economic observables |
| `OECLInteractionFailureMatrix.test.js` | `adversarial-matrix.mjs` | `compare-pinned-evidence.cjs` | Four revert-and-rollback scenarios |
| `OECLAdversarialEthReceiver.test.js` | `adversarial-matrix.mjs` | `compare-pinned-evidence.cjs` | Rejected ETH payout and blocked callback reentrancy |
| `OECLInheritedBurnAuthorization.test.js` | `burn-authorization-parity.mjs` | `compare-extended-pinned-evidence.cjs` | Self-burn, unauthorized direct burn, missing delegated allowance, approved burnFrom |
| `OECLMultiHolderSolvency.test.js` | `multi-holder-parity.mjs` | `compare-extended-pinned-evidence.cjs` | Two holders after maximal permitted surplus removal |
| `OECLNftOpcodePath.test.js` | `nft-opcode-parity.mjs` | `compare-extended-pinned-evidence.cjs` | Traces observed NFT CALL and SSTORE, matching source hash and economic deltas. **Only historical trace gets compiler source-map attestation** |

The underlying historical checkers `validate-pinned-references.cjs`, `check-failure-matrix.cjs`, `check-eth-callback-experiments.cjs`, `check-inherited-burn-auth.cjs`, `check-multiholder-solvency.cjs`, and `check-nft-opcode-path.cjs` must **all** pass before parity comparisons. The historical test source SHA and immutable external Git checkout IDs are verified by their original validators. Modern observations run on a separate EVM and are separately saved.

The modern toolchain requires zero npm advisory findings including low severity; the archived Ethers 5 toolchain allows only *low* residual advisories. The two runtimes are deliberately isolated and neither uses the vulnerable original ERC-8060 / Reservable developer lock for npm installation.

## Coverage deliberately *not* claimed

- `OECLJointRedemption.test.js` experimental joint fixture in `joint-composition-local-evm.yml`: historical workflow remains a separate green gate; not yet converted to a modern receipt parity check.
- `OECLIndependentBurnableEVM.test.js` independent OpenZeppelin ERC20Burnable cross-protocol adversarial matrix: historical workflow remains distinct; **not** the same participant as the pinned ERC-8098 experiment and must not be silently counted.
- `OECL Native Pinned Joint Recipe`: historical native evaluator receipt and invocation pathway remains a distinct workflow; migration of its runner is not yet complete.
- `OECL Generic Solidity Source AST Laboratory`: compiler AST discovery and witnessed source map semantics require independent structural regression, not numeric EVM receipt equality.
- Scientific regression: **221/221 core checks** under the previous reviewed head. Exact PR #22 must pass independently; **11 routed integrations are not run in the core suite and 4 credential-gated cases are not run**.
- Browser/production authentication, preview protection, credentials, external chains, scientific admission or full security certification are outside this experiment.

## Removal gate for legacy tooling

**Do not remove Ethers 5 or merge the stacked PR until all remaining fixture families have independently reviewed modern source-bound evidence, the native evaluator and AST source-map compatibility remain proven, the complete CI matrix passes at the exact final head, and an explicit separate integration/deployment approval is obtained.** A parity report means only `BOUNDED_OBSERVATIONAL_MATCH` and leaves `INCONCLUSIVE` / `NOT_ADMITTED` unchanged.
