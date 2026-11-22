# PR #13 — Generic Solidity AST worker: source, security and scientific review

**Reviewed:** 2026-11-22
**Target:** PR #12 `feat/oecl-v2-controlled-on-demand-reproduction`
**Decision:** **RESTRICTED SOURCE-ONLY RESEARCH. KEEP DRAFT.**

## Verified implementation

- Six pre-reviewed selectable profiles: ERC-8060, ERC-8098, OpenZeppelin 4.9.6 ERC-20, ERC-721, ERC-1155, and the clearly labelled **ERC20Burnable extension**, which is not a separate ERC.
- GitHub implementations use immutable commit hashes; Git tree SHA, blob SHA-1, byte length and local SHA-256 are checked before source compilation. The dependency carrier uses `npm ci --ignore-scripts`, OpenZeppelin 4.9.6 and a constrained solc compiler version. This is **source integrity for the requested records**, not a third-party security audit.
- Recursive source imports accept only bounded, relative imports within the same pinned repository or locked OpenZeppelin package. Each source file is capped at 256 KiB; total source bytes at 2 MiB; total source files at 110; the GitHub tree at 4,500 records.
- The separate workflow compiles sources to AST and reuses OECL's compiler graph for contract inheritance, calls, entry points and state writes. No Solidity execution happens in Next.js and no generic EVM simulation occurs in this PR.
- Tested workflow source-pair controls: ERC-8060 × ERC-8098; ERC-8060 × ERC20Burnable; ERC-8098 × ERC-20; negative ERC-1155 × ERC-20. The negative does not imply incompatibility.
- Published records are explicitly `INCONCLUSIVE`, `NOT_ADMITTED`, `sourceOnly=true`, `evmExecuted=false`.

## Scientific restrictions

- `SHARED_STANDARD_INHERITANCE` only means a compiler-resolved base is present in both inheritance graphs.
- `POTENTIAL_COUPLED_STATE_DECREASE` only means that each source has an approximate public-to-state-decrease AST call path. It does **not** establish that either call can complete, that a coordinator exists, that states or asset units are compatible, or that a property is emergent.
- Guards, modifiers, inherited restrictions, runtime balances, custody and EVM behavior require further independent checks. No candidate is admitted from source-only findings.
- If no hypothesis appears, report no discovered relation and `INCONCLUSIVE`, **never** protocol incompatibility.

## Web authentication / artifact provenance

- `/api/scientific/source-jobs` accepts exactly two approved profile IDs in a bounded JSON body and requires a server-side research access key. Arbitrary repository URLs, user Solidity, build commands and input commits are rejected.
- Research dispatch is **disabled by default**, limited to the approved GitHub workflow and an advisory (non-atomic) 3-per-day run counter. Credentials must remain server-side.
- A successful GitHub workflow now maps to `AWAITING_SOURCE_ARTIFACT`. Only a separate lookup that finds a **nonempty, unexpired artifact named `oecl-generic-ast-evidence` belonging to the exact run** maps to `SOURCE_ARTIFACT_AVAILABLE`.
- Artifact presence does **not** verify payload content, independently reconstruct source facts, or yield a scientifically supported finding.

## Outstanding security and scientific work

1. **No arbitrary Solidity or repository input** until an isolated, network-restricted worker, safe compiler resource caps and an independent security review exist.
2. Dependency-carrier npm audit findings must be remediated before untrusted or public execution; GitHub-hosted Actions is isolation from Next.js, not a hardened security sandbox.
3. Web dispatcher uses `main` for workflow_dispatch; exact participant sources are pinned, but the OECL producer workflow code is not automatically pinned. Record and verify producer SHA in every analysis.
4. Public operation would require per-user identity, persistent job tracking, atomic shared quota, queueing, deduplication and billing/resource budgets. The first 100 listed runs and advisory throttling do not guarantee availability, uniqueness or enforceable quotas.
5. Download, verify checksums and independently parse the source worker artifacts before reflecting their graphs in the interactive web application. The current web links to original GitHub artifacts rather than ingesting them.
6. Add substantive tests of conditional/modifier path feasibility, constraints and inheritance conflicts before treating source-only AST paths as executable.
7. No public-chain evidence, no general automatic EVM experiment generation, no scientifically admitted emergent property.
8. On the **latest merged branch head**, require green generic AST real-source workflow, web policy/integrity/build/smoke, native recipe, historical core regression and pinned EVM CI. Do not infer a test passed from an older SHA.
9. Preserve the existing ERC-8060 × ERC-8098 dossier's `INCONCLUSIVE`/`NOT_ADMITTED` outcome and the prior PR #9 and PR #12 explicit safety reviews.

**Release gate:** maintain this PR as Draft, maintain source-job dispatch disabled on public deployments, and do not merge automatically. This PR advances OECL's general source-only hypothesis discovery; it does not deliver validated protocol composition yet.
