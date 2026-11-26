# OECL consolidated scientific laboratory — evidence and reproducibility

## Why this integration branch exists

The scientific research worker and the five-pillar quality/claim stack
were developed and tested in two separate, **unmerged** pull-request
chains. This branch assembles them in a **real, two-parent Git merge
commit**, without touching the default `main` branch and without
deleting or closing either original PR chain.

- **Research parent:** `c7fb535fba976488f3a0c24dba2b700b5938dbfd`
  (drafts #39, #40, #41, #42, #43 and #47).
- **Quality / public-evidence parent:**
  `1e8008fbf8a1af9ad5babfc6c8737e593693167f`
  (drafts #44, #45, #46 and #48).
- **Original integration merge commit:**
  `e5ee94b89fc6749c108c040a8db120389dc547ff`.
- **Shared pre-feature base:**
  `2de920f3ceeb1ed2a5256f6123fb10841d5818cb`.

A GitHub file-level comparison found **no overlapping paths**:
41 paths were added in the research chain and 31 paths were added
or modified in the quality chain.

The first merge commit uses the full quality tree, adds all **41
original research blobs by their exact Git SHA**, and declares both
original commits as parents. There was no manual rewriting of
the scientific compiler, source models, witnesses, negative controls,
quality verifiers, UI, route or claim ledger during this assembly.
The only new files are this document, a reproducibility/integrity
gate, and its own GitHub Actions workflow.

A required `OECL Consolidated Scientific Stack Integrity` CI job
audits the **exact PR head** and checks:

1. That the original merge commit has **exactly two expected parents**
   and both are still ancestors of the PR head.
2. That all original research and quality files retain **exactly the
   same Git blob SHA-1** as the 41/31 previously reviewed source files.
3. That the final diff contains no unexpected files or silent edits
   beyond these 72 files and three integration metadata files.
4. That the submitted diff has no Git whitespace/conflict errors.

SHA-1 here is Git's own object identity for checking the source tree;
it is not a substitute for independently authenticating the remote
repositories or proving EVM transaction behavior. The CI also runs
the existing SHA-256 source, receipt and witness validators.

## Current behavior — one coherent scientific pipeline

### 1. Specification → hypothesis
`web/src/server/oeclAutonomousResearchPlanner.ts` and the main
user selector produce **source-anchored, falsifiable documentary
hypotheses**, not synthetic EVM receipts. Generic ERC pairs do not
obtain permission for unregistered Solidity source execution.

### 2. Verified Solidity and controlled counterexamples
The scientific research worker from #39–#43 and #47 contains pinned
OpenZeppelin and Solmate ERC-4626 research profiles, ABI/AST checks,
human-reviewed share-formula adapters and a **bounded 480-candidate
counterexample parameter search**. The original experiment selects
a two-unit donation and 21-unit withdrawal. The code can execute
only in explicitly gated Hardhat research CI; the proposal by
itself has `executionAuthorized=false` and cannot dispatch EVM
transactions.

### 3. Two EVM executions and a separate reviewer
The quality-bridge workflow in #48 re-runs the **fixed research
source code** from #47, compiles pinned dependencies, and mines a
second local Hardhat 31337 experiment in a fresh, separate GitHub
Actions job with independently authored EVM execution logic.
Across two runs there are **28 mined receipts and 12 unmined
controls**, including source-specific negative tests. The
second-run comparator and independent offline auditor reconcile
the original and second receipt histories, typed event effects,
state conservation and observable share burns.

The exact experiment found OpenZeppelin burns **21** shares, Solmate
burns **20**, and both vaults retain **21** assets after matching
deposit-40/donate-2/withdraw-21 fixture operations. The equal
share-burn null hypothesis is **refuted for these fixtures**,
not for all ERC-4626 implementations.

Both CI workers use the **same** Hardhat engine and source/compiler
revisions. This constitutes two independent CI-local executions
but not Ethereum client diversity or public-chain consensus
attestation. The first and second historical witness files may
expire with their GitHub Actions artifact retention. The CI can
generate new witnesses from pinned source code.

### 4. Quality contract, claims and agent-visible evidence
The original `OECL_SCIENTIFIC_QUALITY_CONTRACT_V1` and
`OECL_SCIENTIFIC_CLAIM_LEDGER_V1` remain strict:
**HYPOTHESIS ≠ OBSERVATION ≠ CONCLUSION**.

- A generic documentary ERC pair has zero mined EVM receipts,
  `NOT_EVALUATED` scientific verdict and no proven external utility.
- The existing ERC-8060 × ERC-8098 dossier retains its distinct
  historical bounded `INCONCLUSIVE` EVM observation, never
  replaced by ERC-4626 research.
- For ERC-4626 × ERC-20 only, the interface also publishes a
  **separate, versioned reproduction addendum** about *two ERC-4626
  implementations*. The documentary pairing's conclusion is
  **not promoted** because of this cross-implementation experiment.
- Other ERC pairs cannot inherit this unrelated addendum.
- Read-only REST and downloadable JSON include exact quality,
  claim and reproduction SHA-256 digests. Reconstruction of a
  submitted mismatched reproduction digest returns **HTTP 409**.
- Independent reviewers include 40 original quality forgeries,
  29 portable-quality forgeries, 50 claim forgeries, 45 addendum
  forgeries and 55 full-witness forgery attempts, in addition
  to the experimental workers' negative controls. These distinct
  tests are not collapsed into an arbitrary "scientific score."

The local experiment's scoped null hypothesis can be
`REFUTED_IN_TWO_LOCAL_EVM_EXECUTIONS` while the global scientific
verdict remains `INCONCLUSIVE`, general ERC compatibility
`NOT_EVALUATED`, and candidate admission `NOT_ADMITTED`.

### 5. Truthful trust boundaries
This consolidation deliberately does **not** add:
- live or permissionless EVM execution by users or agents;
- a paid Agentic Markets product, wallet or ENS registration;
- arbitrary Solidity imports, arbitrary transaction signatures,
  mainnet contract deployment or signing;
- claimed proof of universal ERC compatibility, audited security,
  profitable external utility or authenticated upstream sources;
- claims that a JSON hash proves Ethereum consensus or that
  the web server itself re-ran terminated local chains.

The Solmate sources are externally pinned, soft-deprecated and
AGPL-3.0-only; source/licensing review is still a **human gate**.
Security review must consider dependency updates and test-only
ERC-20 minting separately from production ERC-20 implementations.

## Release plan

1. **Verify exact consolidated tree and run all GitHub Actions** on
   this draft PR, including the source worker's original EVM
   workflows, cross-EVM quality bridge, full web browser test and
   MISL PR9 scientific regression.
2. **Review the final consolidated diff** for provenance and
   security. A green check is not a substitute for human review.
3. **Choose one merge strategy**: merge this one consolidated PR
   after human approval or merge the original two stacks in their
   dependency order. Do not blindly merge both strategies, which
   would duplicate history and complicate reviews.
4. Only after stable main integration consider a **generic,
   explicitly authorized experiment planner** that handles newly
   reviewed implementations and attaches its own falsifiable
   evidence to the quality contract. Preserve no-proof abstention.

**All PRs remain drafts until the user deliberately approves their
merge. No auto-merge, comments or production execution.**
