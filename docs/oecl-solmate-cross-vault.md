# OECL — genuinely independent ERC-4626 implementation comparison: Solmate

## Scientific claim being tested
Can the **unchanged typed operation program** from PR #40 execute both
an OpenZeppelin 4.9.6 ERC-4626 vault and a completely different Solmate
ERC-4626 implementation, with externally compiled code identity,
and independently reviewed EVM receipts and balance conservation?

This is the next independence check after two OpenZeppelin-derived
`_decimalsOffset()` variants. It does not establish universal ERC-4626
compatibility or automatic experiment synthesis.

## Immutable third-party source profile
- Repository: `transmissions11/solmate`
- Exact Git commit: `89365b880c4f3c786bdd453d4b8e8fe410344a69`
- Compiled from **external checkout**, not vendor-copied into OECL
- `src/tokens/ERC4626.sol` Git blob `0a34ac9855a4ea371319c882e392428432a27ab2`
- `src/tokens/ERC20.sol` Git blob `965704466c0dbd8038d77a72482d82d21413625a`
- `src/utils/SafeTransferLib.sol` Git blob `7f8236db6c7170d045c61b2716734a301d631ad3`
- `src/utils/FixedPointMathLib.sol` Git blob `6887722722908760687eb099eeec42cb5d446366`

All four files contain `SPDX-License-Identifier: AGPL-3.0-only`. Their
distribution and any software integration obligations require a
separate license/compliance review; this experimental branch only
references and compiles them from a pinned CI checkout. The repository
license itself instructs readers to consult per-file SPDX identifiers.

Solmate ERC-4626 is abstract: the local reviewed test-only adapter
supplies `totalAssets() = asset.balanceOf(address(this))` and
constructor names. The ERC-20 underlying uses OECL's previously
reviewed test-only OpenZeppelin 4.9.6 asset with an unrestricted
research mint. **Do not deploy this asset or this fixture to any live
chain.**

## Experimental program
Both vaults receive exactly the same nine-step typed program exported
by `ReusableVaultOperationGrammar.cjs`:
fund 100 underlying assets, simulate no-approval deposit revert,
approve 40, deposit 40, simulate an unauthorized withdrawal, simulate
excessive withdrawal, withdraw 15, approve 101 and simulate an
insufficient-balance deposit.

Required observations per vault: 2 mined deployments + 5 mined
method calls = 7, plus 4 separate **unmined** eth_call reversions.
Across the two codebases: target **14 mined receipts and 8 unmined
simulations**, correct original source identity and exact ABI/AST,
verified 1:1 preview at initial no-fee exchange rate, owner ending with
75 underlying assets and 25 vault shares, vault ending with 25
underlying assets, unchanged underlying supply of 100, and checked
typed `Approval`, `Transfer`, `Deposit` and `Withdraw` events.

The **order** of the withdrawal events is expected to differ:
OpenZeppelin burns shares, returns assets, then emits `Withdraw`;
Solmate burns shares, emits `Withdraw`, then returns assets. The
runtime compares typed event multisets (order-insensitive), while
the second reviewer explicitly tests the distinct expected orders.

## Independent scrutiny
- First CI job rechecks Git SHA, file blob SHA-1, SHA-256 source records,
  the locked solc dependency and compiler ABI/AST; it preregisters an
  immutable plan before EVM dispatch, then separately checks each local
  receipt and Hardhat block.
- Second clean CI runner independently rechecks all source files,
  regenerates the exact bytecode and plan, then verifies the archived
  witness without importing the runtime transition oracle.
- Adversarial mutations targeting receipts, event amounts/order,
  balances, caller role, gas, plan links and false compatibility must
  be rejected by the second reviewer.
- This second runner cannot re-query the original ephemeral Hardhat
  chain. Archive checks are reproducible, not a mainnet consensus proof.

## Interpretation and release gate
If all CI passes, it proves a **bounded reuse of one human-reviewed
experimental program across two independent ERC-4626 codebases**.
The source-analysis and runtime layers remain separate: source AST
paths alone cannot authorize a transaction. There is still no
arbitrary verified contract execution or evidence of fee-on-transfer,
rebasing, donation or adversarial vault interoperability.

All records must preserve `scientificVerdict=INCONCLUSIVE`,
`compatibilityVerdict=NOT_EVALUATED` and
`candidateAdmission=NOT_ADMITTED`. The stacked PR is draft,
depends on PR #40 and #39, and must not be merged until exact-head
CI, code review and AGPL/source compliance considerations are resolved.
The user will publish their own PR comments and perform any merge.
