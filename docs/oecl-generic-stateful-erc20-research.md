# OECL — capability-gated stateful EVM research, phase 1

## Precisely what this adds

The existing deterministic any-ERC researcher can formulate source-anchored questions but cannot run arbitrary Ethereum contracts. The new **stateful ERC20 family** experiment closes one small, independently testable part of that gap:

1. Acquire only registered, immutable OpenZeppelin v4.9.6 Solidity units under the pinned dependency lock (solc 0.8.26).
2. Compile source AST, type-resolved ABI and bounded bytecode. Reject any unreviewed state-changing ABI.
3. For registered **ERC-20 × ERC-20-BURNABLE** (Burnable is an implementation extension, not a separately numbered ERC), verify the compiler AST paths from \`transferFrom\` to \`_spendAllowance\` and \`_transfer\`, identify \`_balances\`, \`_allowances\` and \`_totalSupply\` writes, and where present verify \`burnFrom\`/ \`burn\` reach \`_burn\`.
4. Only when all source and ABI checks pass, compile a **pre-reviewed minimal test fixture wrapper**. The wrapper supplies the ERC20 name/symbol constructor and adds a deliberately unprotected \`oeclResearchMint(address,uint256)\` for setting up initial local test balances. The exact generated wrapper SHA-256, ABI digest and creation bytecode hash are preregistered. This test-only minting capability is *not part of ERC-20 or ERC20Burnable* and must not be confused with their original deployment behavior.
5. The research protocol selects fixed, bounded amounts and account roles and registers all success and falsification cases in source-only JSON **before** EVM deployment. Execution always regenerates and compares the complete protocol against the preregistered artifact before the first transaction.
6. On the isolated local Hardhat 31337 provider, deploy two independent token fixtures, mint balances, approve allowances and exercise allowance-protected transfer and an optional \`burnFrom\` path. Recheck mined receipts against local blocks and contract code; check event arguments and before/after state changes using independently reproducible integer ledger arithmetic.
7. For missing permissions, over-allowance and over-balance, use **unmined** \`callStatic\` reverting simulations only. Inspect the zero-value boundaries separately; they may succeed without reducing balances or supply.
8. A separate CI job fetches archived evidence and **recompiles source, AST, ABI, bytecode and the complete protocol from an independent pinned checkout**. It then independently recomputes before/after numerical assertions for each case.

## Exact preregistered local experiment

Amounts are raw uint256 token units; no economic equivalence or decimals are assumed:

| Quantity role | Test amount |
|---|---:|
| Fixture mint | 100 |
| Owner allowance to spender | 50 |
| Authorized spender transfer | 25 |
| Authorized spender burnFrom (Burnable only) | 10 |
| Zero-value transfer/burn boundaries | 0 |
| Unauthorized attempt | 1 |
| Over-allowance attempt | 51 |
| Over-balance direct burn attempt | 101 |

Expected for each isolated fixture:
- ERC20 base: supply 100, owner balance 75, recipient balance 25, remaining spender allowance 25.
- ERC20 Burnable: supply 90, owner balance 65, recipient balance 25, remaining spender allowance 15.
- Two local creation receipts, eight minted setup/approval/transfer/zero-transfer receipts across both contracts, two Burnable-positive/zero-burn receipts: **12 locally mined successful receipts total**.
- Two unauthorized transfers, two over-allowance transfers, one unauthorized burnFrom and one over-balance direct burn: **6 simulated, unmined reverts**.
- The second fixture must not change the first fixture's final state, and no coordinated cross-contract operation is claimed.

Outcomes from the local EVM can support only the measured fixture-scoped statement that allowance transfer and approved burn behavior occurred in this pinned setup. They cannot establish general ERC compatibility, cross-contract composability, production security or any Ethereum mainnet receipt authenticity.

## Gate checks and honest refusals

The runner is invoked **only from a trusted GitHub Actions workflow**, with bounded execution time, no public API route and no arbitrary source/constructor/quantity/selector inputs. It refuses ERC20 × ERC721 and all other unreviewed profiles. Source profiles are registered with immutable identity. Dependencies are installed with \`npm ci --ignore-scripts\` and \`npm audit\`; no user GitHub project build scripts run.

The compiler AST confirms that the intended internal names, writes and static call edges exist. **This is not a theorem proof**: modifiers, branches, dynamic dispatch, economics, custody, and environments still require actual EVM evidence and independent model review. The harness is explicitly an artificial scientific fixture, not an actual deployed ERC implementation.

The runner does not have a hardened network-denied container, cross-run cryptographic mainnet attestation, distributed user quotas, or general constructor/callback/auth modeling. Unreviewed code execution stays disabled. Results retain:

- scientificVerdict: \`INCONCLUSIVE\`
- compatibilityVerdict: \`NOT_EVALUATED\`
- candidateAdmission: \`NOT_ADMITTED\`
- crossContractAtomicityProven: \`false\`

## What comes after

Only after this fixed family is verified should we extend stateful protocol grammar to reviewed role-gated ERC721/1155 authorization, ERC4626 asset custody and deposit/redeem accounting, and structured cross-contract rollback challenges. Before opening up to arbitrary on-demand contracts, add hardened network/CPU/memory separation, authenticated source identities and robust, atomic per-user quotas.

This is **first generalization across a small reviewed ERC20 mutation family**, not full self-directed experimentation across the 626 documentary ERC entries.
