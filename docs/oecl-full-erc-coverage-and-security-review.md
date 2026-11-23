# OECL full ERC corpus — evidence and security audit (draft)

## Scientific scope

OECL separates three levels: **published ERC specification**, **immutable implementation-level Solidity AST**, and **actual EVM transaction receipts**. A documentary relationship can never substitute for an executable proof. The source-backed registry currently has 10 profiles, while only selected CI pairs have compiled source evidence and a narrower subset of pinned fixtures has local EVM receipts.

### Exhaustive documentary regression

The new standalone workflow checks out ethereum/ERCs at immutable commit e9c1adc6ad36faec8a6bc509cc8a14ec9b8f741d, verifies the checkout SHA, scans every ERCS/erc-*.md document, hashes bytes, parses the documents when supported, and classifies **every unordered pair**. It asserts category symmetry and exact pair accounting, validates documentary test-design requirements, and outputs a JSON artifact with per-document status, per-ERC counts, direct dependency edges, and incomplete pairs. It executes **no Solidity** and produces no EVM/admission verdict.

Every official file remains in the manifest even when the parser cannot interpret it. Such files must be labelled UNPARSEABLE, not nonexistent or incompatible. A separate regression fixes the previous HTTP-200-but-unparseable classification in the production source reader (UNPARSEABLE_SPECIFICATION, still NOT_EVALUATED).

This matrix is a **historical, immutable documentary corpus**. Dynamic UI discovery still fetches the mutable official master and records the document hash it actually observed; it does not claim to be this pinned audit snapshot.

### Initial security and correctness findings

| ID | Priority | Observation | Required next action |
| --- | --- | --- | --- |
| SCI-01 | Fixed in this draft | A retrieved HTTP 200 ERC document that failed parsing was incorrectly reported as NOT_IN_OFFICIAL_REGISTRY | Distinguish UNPARSEABLE_SPECIFICATION, add regression |
| SEC-01 | Release blocker for public dispatch | Research dispatch quotas are based on GitHub workflow-list snapshots and are non-atomic; public user identity and abuse controls are missing | Keep dispatcher default-disabled; add atomic per-identity quotas and reviewed execution isolation |
| SEC-02 | Partially mitigated, public-scale blocker | Anonymous /api/scientific/standards-pair can trigger two external bounded downloads per request | Added bounded 128-entry short-TTL in-process coalescing cache; cross-instance authenticated rate controls still required before high-traffic release |
| SCI-02 | Evidence-scope limitation | The public catalog and documentary reader observe mutable master content and could compare different revisions | Pin the reproducible corpus for CI, preserve SHA-256 in live responses and show revision scope |
| SCI-03 | Evidence-scope limitation | Five newer Solidity pair results exist in source CI, but they are not all exposed as independently pinned read-only AST browser examples | Admit only individually verified evidence; do not infer EVM coverage |
| SEC-03 | Release blocker for arbitrary source intake | The GitHub Actions worker is not a network-denied hardened sandbox | Do not accept arbitrary external repositories, package scripts or source code from anonymous visitors |

These are security-review observations and documented limitations, not claims of proven exploits or certified safety.

### Admission and compatibility criteria for new ERC implementations

1. Lock exact source bytes/commit, imports, package integrity, compiler and source manifest; inspect implementation behavior rather than standard names.
2. Resolve typed ABI/inheritance/AST and record candidate constraints, permissions, state reads/writes, negative controls and unproven execution paths.
3. Run local EVM positive, negative and adversarial tests with independently verified receipts only when a real immutable implementation exists.
4. Cover applicable scenarios including authorization, allowances, custody, units/decimals, rounding, callbacks, reentrancy, supply/balance invariants, rollback, upgrades and malicious counterparties.
5. Record failed, missing and inconclusive tests separately; avoid general compatibility conclusions from one successful fixture.
6. Require full head CI, visual browser acceptance, security review and explicit approval before merging the stacked PRs or changing production.



## Verified 23 November 2026 expansions

- **Complete pinned document corpus:** all 626 official ERC files in the immutable revision parsed and all 195,625 unordered documentary pairs classified with no invented EVM claims. Artifact: [full documentary matrix run 45221235764](https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/45221235764).
- **Complete registered-source AST matrix:** the initial 9 independently configured pair experiments plus 36 newly executed source-only compiler AST analyses now cover all 45 unordered combinations among ten registered immutable implementation profiles. The 36 new analyses returned 15 hypotheses across 11 pairs, and zero compilation failures. Artifacts: [36-pair matrix run 45221235574](https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/45221235574). These are NOT 45 EVM experiments.
- **Independent narrow EVM case:** fixed ERC-8098 reference as *underlying token* in a separate OZ4.9.6 ERC-4626 vault share implementation, local Hardhat chain 31337: 4 mined success receipts, 3 unmined negative callStatic reverts, invariant that underlying ERC-8098 supply did not increase when vault shares were minted. [Source-worker CI run 45222462367](https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/45222462367). Global status remains INCONCLUSIVE / NOT_ADMITTED. **Conditional semantic caution:** trying to apply the ERC-8098 no-increase rule to the very *same* ERC-4626 share token that issues shares on deposit is a different role and requires separate design/experiments; the underlying-asset test does not resolve it.
- **SEC-04 fixed in draft:** the ERC-165 identity gate used to treat any nonzero hexadecimal result as true, even invalid or noncanonical Solidity ABI booleans. It now demands exactly one ABI 32-byte word encoding 0 or 1; noncanonical values are rejected and must leave identity unsupported/unresolved. Added direct falsification regression in the web CI.
- **SEC-02 partially mitigated:** official document lookups now use bounded (128 entries), two-minute per-instance caching and in-flight deduplication; incomplete responses have 15-second cache. This reduces repeated upstream downloads but is **not** distributed rate limiting, public identity, or protection from a rotating-ID flood. Remains a release gate for open high-traffic access.

### Remaining security/compatibility unknowns

- Most official ERCs have no immutable OECL registered Solidity implementation; documentary pairing does not satisfy source/EVM eligibility.
- The registered ten-profile source worker is not a hardened network-denied sandbox, and the beta dispatch quota is not atomic; do not turn on public arbitrary-source analysis.
- Current EVM receipts are only local fixture observations, not formal verification of malicious token hooks, proxy upgrades, external reentrancy, fee-on-transfer assets, decimals/rounding or general multi-protocol custody interactions.
- Dependency audit results are specific to tested lockfiles; legacy historical Hardhat/Ethers lockfiles have archived advisories.
- A professional independent security audit and explicit release authorization remain mandatory before deploying contract-level user-facing financial claims.

## Release status

This audit is intentionally a **draft change stacked on PR #27** (itself stacked on PR #26). It does not enable public compiler/EVM dispatch, merge any PR, alter secrets or deploy production. Review the new CI artifact and its unparseable-document inventory before claiming end-to-end specification coverage.
