# PR #9 — Source-bound security and scientific evidence review

**Scope:** `feat/joint-composition-evidence-bridge` into frozen OECL V2.1 `main`.  
**Review date:** 2026-11-22.  
**Decision:** **RESEARCH-ONLY; CODE REVIEW POSSIBLE; NOT CERTIFIED; NO AUTOMATIC MERGE.**

## Verified provenance and exact behavior

- ERC-8060 implementation: `ten-io-meta/erc8060-native-eth-value@c7eed906835ab39fbc8439eb0493e5a5371b23a2`, `contracts/ERC8060Reference.sol`.
- ERC-8098 candidate: `ten-io-meta/erc8098-reference@68a05289bd68d89db8453c49500e0a1ae6cd11ec`, `contracts/ERC8098Reference.sol`.
- Both sources are in **separate repositories controlled by the same project author**. Separate repositories do **not** provide third-party-independent authorship, independent audit, or ERC standard approval.
- Exact local experiment coordinator: `integrations/erc8060-erc8098/solidity/OECLJointRedemption.sol`. The coordinator is test-only, not a general router or reusable production escrow.
- The pinned EVM experiment observes one transaction redeeming 0.10 ETH from an NFT created for 0.12 ETH, with 0.02 ETH surplus in the single-holder experiment, and reducing fungible supply from 100 to 99 units. The two burns are distinct asset semantics sharing one transaction; they are not equivalent burn operations.
- `ERC8060Reference` is an experimental specific implementation with `Ownable` and an owner-controlled **surplus-only** withdrawal path; it must not be misrepresented as a deployed, administrator-free ERC-8060 standard.
- The separate ERC-8098 repository provides a constructor-minted non-upgradeable candidate reference, **not** a ratified ERC or an audit of all supply mechanisms.

## Security coverage and nonclaims

**Executed bounded evidence** includes a positive joint transaction; owner/approval/balance failure reverts; rejected final ETH payment and full rollback; reentrancy callback attempt with one successful outer redemption; and two holders redeeming sequentially after the permitted surplus withdrawal. Source digests, fixed commit identities, and experimental receipt hashes are checked by dedicated scripts.

`integrations/erc8060-erc8098/audit-adversarial-coverage.cjs` reports **11 observed scenario classes / 9 untested classes** and always retains `PARTIAL_COVERAGE`. The untested classes are:

1. Adversarial ERC-20 implementation.
2. Adversarial NFT implementation.
3. Concurrent multi-holder ordering/interleaving.
4. Many users and approval races.
5. Gas exhaustion or complex receiving contracts.
6. Independent public-chain receipt replay.
7. Formal verification.
8. General source-based protocol candidate discovery.
9. Alternative ERC-8098 constructors, proxy, or upgrade variants.

The coordinator accepts ETH through `receive()` but provides no general-purpose recovery interface. Direct deposits and mistakenly sent assets may be unrecoverable; this is acceptable only for an isolated ephemeral fixture, **not** public deployment. Never encourage users to deposit live ETH or tokens into this coordinator.

The pinned ERC-8060 code checks solvency before redemption, and its owner-only withdrawal is limited to surplus. This does not establish that arbitrary ERC-8060 implementations or future versions are safe.

## Scientific admission

- A shared EVM transaction is an observation of **joint local behavior**, not a proof of compatibility for arbitrary ERC-8060 and ERC-8098 instances.
- The authentic native source-discovery pipeline reports **zero admitted pair candidates** for these two pinned sources.
- The native constraint evaluator records local evidence `SUPPORT` for a *bounded* set of numeric invariants, while the candidate remains `NOT_ADMITTED` and global verdict remains `INCONCLUSIVE`.
- A descriptor such as `SCOPED_ATOMIC_CROSS_ASSET_REDEMPTION_WITH_MONOTONE_SUPPLY` is a **source-and-EVM-bound observed effect**, **not** a generally demonstrated emergent property.
- Separate participant baselines, joint-control comparisons, both ablations, and adversarial falsification tied to a genuine discovered candidate are still required before an emergent-property scientific claim.
- Local Hardhat receipts and validated JSON artifact digests are not independent full-chain replay, and finite test cases are not a security certification.

## CI/release gate

- Historic result before this review: core scientific regression **221/221 PASS**, TypeScript PASS, with **10 parameterized integration checks routed to separate pinned workflows** and **4 credential-dependent The Graph checks NOT RUN**. `CORE_PASS_FULL_INCOMPLETE` is the correct full-suite status.
- The 10 original parameterized checks have unique source-pinned CLI invocations. `scripts/check-routed-scientific-workflows.ts` now **guards those ten mandatory checks while allowing additional routed checks** (e.g. the future independent ERC8060 × ERC20Burnable workflow in the stacked PR #17).
- Confirm GitHub Actions **on the most recent branch commit** after every change. Treat an outdated green run as insufficient.
- A successful Vercel **Preview** is not evidence that the stable production site has been updated.

### Conditions before merging into `main`

- [ ] Latest CI, pinned EVM, native recipe, and scientific core regression pass on the same reviewed head commit.
- [ ] Confirm no loss of routed integration checks, and independently inspect the dedicated pinned-workflow results.
- [ ] Independent code and evidence review, with test-only scope and explicit scientific limitations maintained.
- [ ] Reconcile stacked PR #11–#17 and their current bases without discarding later changes or silently reclassifying scientific verdicts.
- [ ] Recheck the downstream regression after stacked rebase/retarget, including ERC20Burnable's eleventh routed check.
- [ ] No claim of complete audit, universally compatible ERCs, mainnet evidence, or admitted emergent behavior.

**Merge policy:** keep Draft until the integration and independent-review gates are met. It is permissible to advance the experimental infrastructure separately from scientific candidate admission, but only while the limits and `INCONCLUSIVE` result remain visible.
