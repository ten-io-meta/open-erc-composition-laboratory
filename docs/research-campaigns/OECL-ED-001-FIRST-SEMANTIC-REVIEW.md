# OECL-ED-001 — Post-screen semantic review of first candidate

Status: POST-SCREEN HUMAN RESEARCH REVIEW. NOT AN EMERGENT DISCOVERY.
This document is not part of the preregistered selection rule and does not alter the first source-screen output.

## Original campaign and evidence

- GitHub Actions source-only campaign: https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/45914220111
- Pre-existing immutable screening commit: 7ac05d796ed4f3f94bfe21b0addf1ea5b07c19ec (draft PR #55).
- Data: OECL-ED-001 registered-source screens; 35/35 source analyses succeeded, 10 pairs with AST hypotheses, 25 without a match under the existing two AST rule families.
- Machine-proposed hypotheses: 13 (6 POTENTIAL_COUPLED_STATE_DECREASE, 7 SHARED_STANDARD_INHERITANCE).
- No EVM experimentation in this campaign; zero supported emerging properties and zero independently authenticated autonomous scientific discoveries.

The frozen lexical ranking selected **ERC-20-BURNABLE | ERC-4626**, hypothesis **AST-HYP-7214d7722c09498a9c45c2e8**, to be reviewed before any empirical test. The remaining five decrease-path questions are retained unchanged in the archive.

## Source observations, not experimental assertions

From source-matrix shard 1, in the OpenZeppelin Contracts 4.9.6 registered package:

| Participant | Compiler-derived public path | Target | Feasibility |
| --- | --- | --- | --- |
| ERC-20-BURNABLE extension | burn at ERC20Burnable.sol:20 to ERC20._burn | ERC20._totalSupply at ERC20.sol:287 | NOT_PROVEN_EXECUTABLE |
| ERC-4626 vault | redeem at ERC4626.sol:187 through _withdraw to ERC20._burn | ERC20._totalSupply at ERC20.sol:287 | NOT_PROVEN_EXECUTABLE |

Exact archived source SHA-256 identities:
- ERC20Burnable.sol: 0344809a1044e11ece2401b4f7288f414ea41fa9d1dad24143c84b737c9fc02e
- ERC4626.sol: 0610f62eeae3a7dee46c4c37cc80c59060fd56cea7fb1e00a950f1e6a2f981ac
- Shared ERC20.sol: d20d52b4be98738b8aa52b5bb0f88943f62128969b33d654fbca731539a7fe0a
- Source scientific report: 1285579731a69237faf42362da53bbf163ea763d76e9e528f4b740d4973eca9d
- Hypothesis artifact: bd6259cfd48985242f800e2384fc211cb238869a8806bc702ce587aac52af0b5
- Path-feasibility artifact: 8cbb801246ea9878b8534809c8329d2cc41e1383f369836bd55fe63c802cc08a

Unproven source conditions include ERC20._burn account != zero, sufficient balance, and ERC4626.redeem shares <= maxRedeem(owner). The AST model records unresolved contexts and guards. No local or mainnet transaction was run for this pairing in OECL-ED-001.

## Scientific interpretation

**These are two structural state-decrease paths, not a demonstrated cross-protocol cause.**

ERC-20-BURNABLE is a named OpenZeppelin ERC20 extension rather than a separate ratified ERC. Both classes inherit a common ERC20 implementation. In separately deployed instances, an identically named ERC20._totalSupply variable refers to each instance's own state; common code and variable names do not make them a shared ledger.

The usual interpretation is: ERC20Burnable.burn changes the fungible token's supply, whereas ERC4626.redeem burns the vault's **share token**. That does not establish a burn of the vault's underlying token. A generic coordinator could arrange two calls in one EVM transaction, but this would not by itself establish a new ERC-specific emergent property.

These are interpretation-level objections and alternative explanations, not experimental refutations, universal impossibility proofs, compatibility judgments or identified vulnerabilities. The selected pair might have other meaningful interactions under a carefully defined implementation and role model.

**Research decision: CROSS_PROTOCOL_EMERGENCE_MECHANISM_NOT_ESTABLISHED_FROM_SELECTED_AST_FACTS.**
Keep candidate admission NOT_ADMITTED and scientific assessment INCONCLUSIVE. Do not authorize an EVM trial merely because the two AST paths end in a variable with the same name.

## OECLS-0011 scientific review

| Gate | Preliminary status | Why the gate cannot pass |
| --- | --- | --- |
| G1 — falsifiable property | UNRESOLVED | No precisely defined system-level property P |
| G2 — discovery provenance | PARTIAL, NOT A PASS | Machine rule provenance known; no separate confirmatory experiment preregistered |
| G3 — nontriviality | UNRESOLVED | Shared inheritance, isolated actions, coordinator and generic EVM explanations unexcluded |
| G4 — mechanism | UNRESOLVED | No observed cross-participant causal edge or shared-state/role analysis |
| G5 — causal contrasts | UNRESOLVED | No isolated / noninteracting / active / ablation / restoration / coordinator-only comparison |
| G6 — independent proof | UNRESOLVED | No new EVM receipts or independently replicated causal measurements |
| G7 — prior art | UNRESOLVED | No justified novelty or prior-knowledge determination |

The G2 source-origin note is only a factual provenance note; **no gate is admitted**.

## Conditional next scientific protocol (NOT preregistered for empirical confirmation)

A separately reviewed protocol could test a particular ERC20Burnable asset held as the **underlying** of an ERC4626 vault, but only after proving that this configuration is constructible, selecting immutable deployable source revisions and verifying roles, balances, permissions, ABI and units.

A meaningful confirmatory experiment would compare an asset token and vault alone, non-interacting co-deployment, specific shared interaction, selective ablation of the actual causal edge, restoration where feasible and an ordinary coordinator-only control. It must measure *underlying totalSupply*, *vault share totalSupply*, vault totalAssets and caller state separately; test adversarial cases and independently verify receipts. It must NOT assume an unapproved third party can burn tokens held in the vault, nor that ERC4626.redeem burns underlying supply.

This conditional idea arose **during human post-screen semantic review** and must not be falsely credited to the AST machine as autonomous invention. It is not an authorized Solidity/EVM execution plan. If no nontrivial cross-participant mechanism can be specified, keep the original source finding inconclusive and move to the next ranked source question with the transition rationale recorded.

## What OECL has learned

The existing bounded scientist can surface real source-path research questions without preselecting attractive outcomes and can preserve 25 no-match cases. It **has not yet demonstrated autonomous discovery of a genuine emergent property**. A concrete research gap is to derive and discriminate causal cross-protocol mechanisms rather than equating two independent state changes with coupling.

All prior source findings, receipt snapshots, candidate/compatibility conclusions, memory, licensing, privacy and security decisions remain unchanged.
