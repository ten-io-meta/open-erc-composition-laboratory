# OECL scientific experiment: ERC-4626 × ERC-20 pinned vault custody

## Why this matters
ERC-20 and ERC-20 Burnable share a close family; the prior successful
local grammar does not establish autonomy across different families.
ERC-4626 is a tokenized vault: deposits involve an underlying ERC-20
token transfer and the minting of vault shares. A withdrawal burns shares
and sends underlying tokens back.

## Phase A: *blind* compiler observation (completed)
The first workflow of draft PR #39 ran the **existing** generic compiler
source pipeline on pinned OpenZeppelin 4.9.6 implementations, without
writing a custom ERC-4626 execution protocol first.

- Selected sources: registered ERC-4626 + ERC-20, compiler solc 0.8.26.
- Source-only planner produced **4 candidate hypotheses per implementation**.
- Compiler graph reported **two structural storage-write occurrences** reachable
  from `deposit(uint256,address)`; **three** from `withdraw(uint256,address,address)`.
- Both vault paths have unresolved compiler call references (11 and 16),
  and each traverses a source graph containing one external call reference.
  These are *uncertainty annotations*, not established exploitable defects.
- Verdict remains `INCONCLUSIVE`; candidate admission `NOT_ADMITTED`;
  compatibility `NOT_EVALUATED`. No EVM execution occurred in phase A.

This establishes that the generic source worker could identify potentially
relevant vault write paths before any custom experimental fixture. It **does
not** show that the worker autonomously inferred the complete deposit/withdraw
semantics, allowance requirements or correct parameter choices.

## Phase B: explicitly reviewed EVM policy (CI must confirm)
Because source graph reachability alone is insufficient to choose a correct
economic experiment, Phase B introduces `VaultAssetFlowProtocol.cjs`, a **new
specific reviewed operation policy**. This cost is intentional and must be
counted as human engineering rather than OECL autonomy.

The source registry remains unchanged and a compiler with a locked dependency
graph builds two temporary fixtures:
1. An ERC-20 asset with unrestricted `oeclResearchMint`, **strictly test-only**.
2. An ERC-4626 vault with the ERC-20 address supplied to the constructor.
The original pinned contracts are not modified. Do not deploy the asset
fixture on any public network.

Preregistered steps for **one** connected vault/asset pair:
- Mint 100 underlying asset units to the owner (mined).
- Attempt a 1-unit deposit before allowance approval (unmined `eth_call` revert).
- Approve 40 asset units for the vault (mined).
- Deposit 40 units (mined); independently check the ERC-20 asset `Transfer`,
  vault-share `Transfer`, vault `Deposit` and allowance update.
- Attempt an attacker withdrawal from the owner (unmined revert).
- Attempt to withdraw 41 units where only 40 are deposited (unmined revert).
- Withdraw 15 units (mined); check share burn, ERC-20 return transfer and
  vault `Withdraw` event.
- Approve 101 units, then attempt a deposit of 101 where the owner has only
  75 remaining (approval mined; attempted deposit **unmined revert**).

Predictions are scoped to this simple no-fee, initial-zero-balance fixture:
the final owner asset balance should be 75, the vault should hold 25,
the owner should hold 25 shares, vault total supply should be 25 and
the underlying asset total supply should remain 100.

**Designed totals, not claims until CI passes:** 2 deployments +
5 successful method calls = 7 mined receipts. 4 separate unmined
adversarial `eth_call` reverts. A second CI runner recompiles the whole
plan and independently checks archived receipt/event/ledger arithmetic.

## Scientific and security boundaries
- The researcher has learned **some structural effects** automatically, but
  a specifically reviewed deposit/withdraw policy was required. This is a
  partial advance in generalization, **not full autonomy**.
- The proposed experiment measures *interaction* between these two
  separate pinned implementations. It does not prove universal compatibility
  between all ERC-4626 vaults and all ERC-20 tokens (e.g. fee-on-transfer,
  rebasing or malicious tokens are outside scope).
- A simulated revert does not establish a mined failure; receipts are
  attributed only to mined successful calls.
- No user-provided bytecode, unrestricted calldata, public signing wallet,
  production RPC or live EVM endpoint is involved.
- The second reviewer independently recompiles inputs and recomputes archived
  witness arithmetic, but cannot access the terminated transient Hardhat chain.
- **No automatic merge or candidate promotion.** PR #39 remains a draft.
  Any CI failures or unsafe behavior must be fixed and rerun on the exact head.
