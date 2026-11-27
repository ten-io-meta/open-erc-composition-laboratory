# OECL-ED-001 — Prospectively defined EVM null-control protocol (not executed)

Status: PROPOSED CONFIRMATORY-DIAGNOSTIC PROTOCOL, NOT YET AUTHORIZED / NOT EXECUTED.
Researcher attribution: HUMAN-DESIGNED FOLLOW-UP of source-only machine hypothesis AST-HYP-7214d7722c09498a9c45c2e8.
Source-screen and causal-triage conclusions remain NOT_ADMITTED / INCONCLUSIVE.

## 1. Why this test — and why it is not an emergent-discovery test

The selected source-only pair **ERC-20-BURNABLE × ERC-4626** reaches the same inherited Solidity ERC20._burn definition in OpenZeppelin Contracts 4.9.6. This does not establish one shared storage variable across independent token and vault instances, nor a cross-contract dependency introduced by the Burnable extension.

The purpose of this *diagnostic* is to test whether OECL's AST heuristic is falsely equating an underlying token supply decrease with a vault-share supply decrease. A negative or null result would be a valuable **mechanism-discrimination calibration**, not an impossibility proof about ERC standards.

The experiment requires an independently reviewed safe local fixture and must be committed before observing any **new** EVM measurements under this protocol. Prior archived ERC-4626 receipts are exploratory background, not confirmatory evidence for this newly proposed protocol.

## 2. Locked implementations and permitted setting

- Contracts: exact pinned OpenZeppelin Contracts v4.9.6 (trusted dependency lock SHA-256 73a70b40bad9d064a244d1a36986b78be9adedc85d2043a6431add0c428b41b1), compiled only with the already reviewed Solidity 0.8.26 toolchain in the isolated source environment.
- Verified source paths: ERC20.sol, ERC20Burnable.sol and ERC4626.sol, explicitly preserving inherited source identities, constructor ABI and linked import closure.
- Local Hardhat EVM chain 31337, deterministic funded fixture accounts, no network RPC, external blockchain deployment, wallets, third-party funds, customer code or privileged operations.
- Two separate asset variants under the same test-only mint policy: a concrete ERC20 base token and a concrete ERC20 + ERC20Burnable token. Each is paired with an otherwise equivalent ERC4626 vault implementation. Their fixture-specific mint function MUST be documented as an experimental facility, not ERC-mandated behavior.
- Keep token decimals, initial supply, vault initial state, accounts, amounts and transaction ordering equivalent. Identify code and compiler hashes for every deployment.

In this source version, ERC4626.redeem validates shares <= maxRedeem(owner), then calls _withdraw; _withdraw burns ERC20 **shares** and transfers ERC20 **underlying assets** using SafeERC20.safeTransfer. ERC20Burnable.burn burns the caller's asset tokens; burnFrom spends allowance before burning another account's tokens. Neither method by itself proves the vault permits a third party to burn its balance.

## 3. Quantitative predictions fixed BEFORE the new experiment

All quantities are whole-token values with assumed 18 decimals, converted to base units in the actual fixture. The amounts are chosen to avoid rounding ambiguity, but the output MUST also include exact integer units and the pinned ERC4626 conversion rules.

Initial setup for each asset/vault variant: the owner holds 1,000 asset tokens; all share and vault balances are zero. Owner deposits 100 assets, receiving an expected 100 shares under the specified zero-state OZ v4.9.6 conversion.

**H0 (independent burn effect):** In the Burnable variant, the owner burns 40 assets **from their own externally held asset balance**, not from the vault. Predicted: underlying token totalSupply decreases from 1,000 to 960; vault underlying balance remains 100; vault share totalSupply remains 100; conversion of 25 shares to assets remains 25 within the fixed fixture.

**H1 (redeem effect):** The owner redeems 25 vault shares. Predicted: share supply decreases from 100 to 75; vault underlying balance decreases from 100 to 75; underlying token totalSupply remains 960 (it is transferred, not burned). Before the independent burn, an equivalent ERC20-only baseline vault under the same deposit and redemption sequence is expected to show the same vault-share state transitions.

**Unauthorized action control:** In the test fixture with zero allowance granted by the vault to any external actor, burnFrom(vaultAddress, amount) on the underlying Burnable token should revert for an unauthorized caller. An eth_call/static simulation MUST be labeled NONMINED, and any mined reverted transaction labeled separately; do not fabricate a transaction hash or state witness.

**Alternative outcome:** If the independent holder burn changes vault totalAssets, vault share supply, or previewRedeem without an intervening change in actual vault balance, check for incorrect setup, hidden wiring, overridden functions or a novel causal influence. Do not automatically declare emergence: investigate any discrepancy and reproduce it independently.

These predictions are human-authored follow-ups. The machine AST source hypothesis DID NOT generate the 1,000 / 100 / 40 / 25 quantities or the null-model design.

## 4. Required controls and discriminating mechanism checks

| Scenario | Required measurements | Distinguishing purpose |
| --- | --- | --- |
| ERC20 asset + ERC4626 vault (no Burnable) | asset supply, vault asset balance, vault share supply, owner balances, previewRedeem | Baseline ERC4626 behavior |
| ERC20Burnable asset + ERC4626 vault before burn | same metrics and exact hashes | Matched Burnable baseline |
| Burnable holder burns 40 outside the vault | same metrics before/after plus receipt | Distinguish underlying supply from vault share supply |
| Vault redeems 25 shares | same metrics, events and receipt | Prove shares versus assets have separate identities |
| Unauthorized burnFrom(vault) | allowance, revert classification and pre/post states | Block invented cross-party burn permissions |
| Burnability feature removed in matched nonburnable asset | same accounting under equivalent roles | Intervention/control, not automatically a perfect causal ablation |

An EVM **coordinator-only** atomicity test is justified only if later semantic review identifies a separate cross-contract operation and a falsifiable proposed emergent property. Do not add a generic coordinator just to manufacture a positive observation.

Additional mandatory checks: constructor/asset address binding, ABI roles, local chain ID, test-only mint attribution, state/event measurements, precise gas and receipt types, unauthorized withdrawal, known rounding conditions and exact source revision identity. Preserve all negative outcomes.

## 5. Evidence admission and stopping rules

- Produce state tables before/after every step; compute independent participant storage states and denomination units.
- Pin source / build information / deployed code hashes / account configuration. A second checker must reconstruct the evidence or independently replay the transactions rather than merely digest the producer's JSON.
- If observed values violate a prediction: record the discrepancy, test competing explanations, do not reinterpret a failure as success.
- If H0/H1 and controls hold: the result is only **BOUNDED_SOURCE_HEURISTIC_FALSE_POSITIVE_OR_NONTRIVIALITY_UNESTABLISHED**; do not infer universal non-emergence or any ERC security certification.
- No specific cross-participant mechanism M is yet shown; hence **OECLS-0011 G3, G4, G5, G6 cannot be promoted** by this diagnostic alone.
- Any new candidate P requiring causal ablation/restoration and coordinator controls must receive a separate independently reviewed preregistration BEFORE it is tested.

## 6. Authorization state

No EVM execution is requested or enabled by this document, and this PR contains no deployment scripts, execution permission, Solidity fixtures or public dispatch. The first implementation milestone would be a separately reviewed local-only test PR, with its own independent witness validation and explicit non-custodial boundary.

This research contributes a properly scoped negative-control protocol rather than claiming that a source pattern is a real emergent property.
