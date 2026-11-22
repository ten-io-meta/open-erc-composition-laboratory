# PR #17 — Independent EVM evidence web viewer: scientific and security review

**Review date:** 2026-11-22  
**Target:** PR #16 `feat/oecl-v2-independent-erc8060-erc20-evm`  
**Decision:** **READ-ONLY, PINNED HISTORICAL RESEARCH EVIDENCE; KEEP DRAFT.**

## Actual UI and API behavior

- The web exposes a static, SHA-256-pinned JSON projection of **one prior local EVM experiment**: ERC-8060 × OpenZeppelin ERC20Burnable **extension**, NOT a new ERC.
- The source selector offers the "Explore verified independent EVM evidence" action only for the exact `ERC-8060|ERC-20-BURNABLE` pair. `GET /api/scientific/independent-evm?sourceA=ERC-8060&sourceB=ERC-20-BURNABLE` returns read-only evidence; `&download=1` exports the JSON.
- Unsupported pairs return HTTP 404 `NO_INDEPENDENT_EVM_REPORT` and `NOT_EVALUATED`, **not** a negative compatibility judgment. Invalid or duplicated pair IDs are rejected.
- The static report digest is hardcoded in `web/src/server/oeclIndependentEvmReport.ts`; it is checked again with negative mutation fixtures in `web/scripts/check-independent-evm.mjs`. Incorrect or missing integrity returns an unavailable result, not invented scientific support.
- The historical report is linked to GitHub Actions run **45032636392**, workflow commit `51d19072b2e6f2a5e3b08dd1facd77b0ced225b9`, and source-pinned producer. A later workflow run does **not** silently update this immutable report.
- The viewer shows the experiment's 10 local EVM transaction hashes, 3 positive observations, 7 negative/rollback observations and four source-anchored numeric predicates with local `SUPPORT`. Overall result remains `INCONCLUSIVE`; candidate remains `NOT_ADMITTED`.
- The source registry worker remains disabled by default on public deployments. The read-only snapshot view requires no researcher token and never deploys contracts.

## Critical limits

1. The SHA-256 pin proves the application is displaying the **reviewed historical JSON**, not that a third party independently replayed its original Hardhat transactions or verified Ethereum mainnet state.
2. Chain ID 31337 and local Hardhat hashes are **ephemeral**: public block explorers cannot verify them.
3. The ERC20Burnable implementation is **abstract** and deployed through an OECL-specific fixture. The custody coordinator, reentrancy harness and test-only switch are not production protocols.
4. Native `SUPPORT` covers only four numerical, participant-side properties in this recorded experiment, **not** generalized atomicity or emergent behavior across standards.
5. Browser-accessible historical metadata and hashes are not a source-independent audit, trustless attestation, or scientific candidate admission. Missing baselines, ablations and complete evaluator coverage remain blocking scientific requirements.
6. The screenshot/preview of Vercel must never be treated as evidence that OECL production `main` was updated.
7. The API's no-store response and exact-source selection are important safety properties; a viewer failure must not fall back to a different pair's report.

## Reconciliation and test gate

- Reviewed PR #16 upstream changes are incorporated with both Git parents preserved, including the new source-path scientific falsification controls, server authorization/artefact verification and security reviews.
- Preserve the eleventh `check-independent-burnable-native-properties.ts` scientific check as **integration-routed**, not parameterless; the core regression must distinguish unexecuted integrations and credentials from passed tests.
- The independent EVM workflow retains dedicated triggers for regression routing and native property verifier changes. The web workflow retains its new snapshot test and triggers on web, Solidity AST worker and experimental EVM harness changes.
- [ ] Require a green web read-only snapshot / HTTP smoke, native recipe, pinned independent EVM, generic AST, joint EVM and scientific core regression **on the latest reviewed commit**.
- [ ] Verify all pinned JSON fields and the experimental source revisions are accurately visible and accessible to a keyboard-only user.
- [ ] Before deployment, review dependency alerts, token/secret scope, Vercel environment and disabled research runner. Never enable unrestricted execution or claim scientific `ADMITTED`.

**Merge policy:** keep PR #17 in Draft. Reconcile and review entire stacked chain before any merge to `main`. No source ERC repositories should be changed.
