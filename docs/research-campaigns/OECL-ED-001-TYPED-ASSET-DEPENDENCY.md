# OECL-ED-001 — First source-bound external dependency witness

Status: SOURCE-LEVEL OBSERVATION ONLY — NOT DEPLOYED, NOT EVM-EXECUTED, NOT AN EMERGENT DISCOVERY.

## Scientific question

Can OECL distinguish two implementations that happen to share source or state-variable names from a source whose execution is explicitly **designed to call another contract through an interface**?

For the first machine-selected pair ERC-20-BURNABLE × ERC-4626, the previous structural heuristic pointed at two inherited ERC20._burn state-decrease paths. That observation did **not** establish a common supply or cross-protocol causality.

This experiment asks a narrower, independently falsifiable source question: Does the pinned OpenZeppelin ERC4626 v4.9.6 implementation encode a constructor-supplied IERC20 asset dependency and compiler-resolved calls to the SafeERC20 token-transfer library?

## Verified evidence and scope

The new read-only witness checks **real raw source SHA-256 bytes**, exact pinned report hash, compiler graph digest, source-unit identities, exact compiler call-path edges, and original source expressions. It is specific to the fixed 2026-11-27 OECL-ED-001 source-screen dossier and cannot be generalized by renaming an ERC identifier.

| Evidence | Reported source-level fact | What it does **not** prove |
| --- | --- | --- |
| Constructor of ERC4626 | Stores caller-supplied IERC20 `asset_` into private immutable `_asset` | Which token instance a vault actually uses at runtime |
| ERC4626.deposit → _deposit → SafeERC20.safeTransferFrom | Requests an underlying asset transfer from user into vault | A successful transaction, caller allowance or an ERC20Burnable-specific mechanism |
| ERC4626.redeem → _withdraw → SafeERC20.safeTransfer | Requests an underlying asset transfer from vault to recipient | A supply decrease in the underlying ERC20 token |
| ERC4626._withdraw → inherited ERC20._burn | Burns vault **shares** | A burn in the underlying asset token contract |
| ERC20Burnable.burn → inherited ERC20._burn | Burns the token instance in which Burnable runs | A direct connection to the particular ERC4626 vault or its `asset_` |
| SafeERC20._callOptionalReturn → Address.functionCall | Source pipeline for an external IERC20 operation | The effective deployed callee, successful execution or security |

The two profile source SHA-256 identities and library dependencies remain pinned to OpenZeppelin Contracts 4.9.6. This is source code and compiler evidence; it is **not** a new on-chain witness.

**New bounded finding:** `PINNED_GENERIC_IERC20_TRANSFER_DEPENDENCY_IN_ERC4626_SOURCE_ONLY`.

**What remains unknown:** Which actual deployed address is bound to `asset_`; whether that address implements ERC20Burnable, as opposed to ordinary IERC20; the real caller's permissions; balances and units; any adaptive external token behavior; the runtime execution outcome; causal difference from a plain IERC20 token; and any novel emergent property.

## The next experiment must be discriminating

The separately preregistered diagnostic null-control protocol already exists at `docs/research-campaigns/OECL-ED-001-EVM-NULL-CONTROL-PROTOCOL.md`. It calls for matched plain ERC20 and ERC20Burnable assets, identical ERC4626 vaults, independently measured asset supply versus share supply and bounded controls for independent holder burn, share redemption and unauthorized `burnFrom(vault)`.

A later local-only EVM trial may verify deployed constructor arguments, deployed bytecode, actual IERC20 transfer effects and independently reproduced state transitions. The fixed null model must be allowed to win. It would be scientifically misleading to treat a normal ERC4626 transfer as an emergent property requiring Burnable.

Only once OECL can formulate a nontrivial P and causal mechanism M that survives the plain-IERC20 comparator would it be meaningful to preregister selective ablation/restoration and a coordinator-only counterfactual for an emergent claim.

## Attribution, safety, reproducibility

- This witness is a **human-scoped verification of a compiler-derived research question**, not autonomous invention of a new protocol dependency.
- It reuses public, immutable pre-registered source profiles. It does not enable arbitrary Solidity compilation, user RPC, external deployment, wallets, private customer records or funds custody.
- Every source-byte disagreement, missing call edge, forged claim of runtime origin or incomplete compiler lineage is **fail-closed**, with adversarial tests.
- No original hypothesis, EVM observation, compatibility verdict, scientific memory, licensing boundary or PR #51 is modified.
- The archived GitHub Action will include a separate typed dependency JSON alongside the original 35-pair register and 13-hypothesis causal-triage output, and no result automatically obtains an OECLS-0011 scientific gate.
