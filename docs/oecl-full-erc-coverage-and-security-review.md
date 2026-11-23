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
| SEC-02 | Medium / scale review | Anonymous /api/scientific/standards-pair performs up to two external bounded network lookups per request, without a cross-instance rate limiter or cache | Add bounded cache and shared rate controls before high-traffic release |
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

## Release status

This audit is intentionally a **draft change stacked on PR #27** (itself stacked on PR #26). It does not enable public compiler/EVM dispatch, merge any PR, alter secrets or deploy production. Review the new CI artifact and its unparseable-document inventory before claiming end-to-end specification coverage.
