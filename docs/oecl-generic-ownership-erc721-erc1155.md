# OECL — reviewed ERC721 and ERC1155 permission experiments

## Scope and scientific question
This increment is a capability-gated, preregistered local EVM ownership and operator-permissions experiment for the *two existing reviewed OpenZeppelin v4.9.6 registry source profiles* ERC-721 and ERC-1155. It is not a composability test, ERC-wide compatibility verdict, public Solidity worker, or universal constructor/role inference engine.

Hypotheses:
- ERC721 token-specific spender approval permits transfer of token 101 and is cleared by that transfer; stale approval does not grant further rights.
- Global setApprovalForAll authorizes an operator to transfer owner assets and explicit revocation removes the right.
- ERC1155 safeTransferFrom of 25 out of 100 raw units conserves the sum of owner/recipient holdings, while zero-quantity transfer does not reduce them.
- Zero-address recipients, unapproved callers, revoked operators and attempts to transfer more ERC1155 units than the owner holds are negative controls that must revert.

The protocol obtains compiler-resolved source ASTs, verifies typed original ABIs, and verifies specific source-internal paths and storage writes. Those source checks are prerequisites to testing, NOT an execution proof.

## Execution
Both ERC sources are pin-locked to immutable package, Solidity 0.8.26 and audited dependency integrity. The runner constructs exact SHA-256-identified **review-only** Solidity wrappers that provide constructor arguments and a deliberately unprotected oeclResearchMint setup function. This changes their deployed type and is explicitly not original ERC functionality. It is permitted only on isolated local Hardhat chain 31337; no external RPC, unreviewed sources, arbitrary user calldata or public dispatch.

The preregistered permission grammar uses three ERC721 token IDs (101, 102, 103), and one ERC1155 asset ID (101) with initial quantity 100 and positive transfer quantity 25.

| Fixture | Locally mined successes including deployment | Simulated unmined reverts |
|---|---:|---:|
| ERC721 | 9 | 4 |
| ERC1155 | 6 | 4 |
| Total targeted | 15 | 8 |

The local EVM job must re-query each creation/call receipt, block identity and event args on the same ephemeral Hardhat provider, and assert before/after ownership, account balances and approvals. An unrelated token must be unchanged by the other's tests.

The second job rechecks the first job's immutable artifacts from a fresh dependency checkout, recompiles original AST/ABI and generated wrappers and **independently recomputes** the owner/recipient balance deltas. It cannot authenticate terminated Hardhat state against Ethereum mainnet.

## Guardrails and release criteria
- Only exact ERC721 × ERC1155 registered source pair (either order) can produce an approved protocol.
- ERC721 × ERC20 and missing source capabilities must be blocked with no EVM dispatch.
- No unrestricted constructor inference, arbitrary mint methods, live wallets, remote providers, callbacks, bridges, proxy upgrades or economic composability tests.
- All successful state changes must be mined and independently checked against local receipts. All expected reverts use unmined callStatic and are NOT mined transaction evidence.
- Scientific verdict remains INCONCLUSIVE, compatibility verdict NOT_EVALUATED, candidate admission NOT_ADMITTED even after observing scoped differences.
- Existing original scientist regression, all source and EVM CI, web/mobile and independent review must pass on the exact PR head prior to merging.

Next safe broadening would consider reviewed ERC4626 asset custody/deposit and redemption, then combined-contract atomic rollback experiments, while preserving independent conclusions and public code-execution restrictions.