# OECL — public Core / historical Research / future private Research

**Review state:** preliminary technical asset inventory and prospective isolation controls.
**Reference branch:** public `main` at `2de920f3ceeb1ed2a5256f6123fb10841d5818cb`.
**Intended product:** noncustodial scientific research and verifiable reports, not
wallet custody, trading, financial management, signing or permissionless mainnet
contract execution.

This is **not** a new ownership claim, retroactive relicense, secret-removal
operation, legal opinion, or completed license review.

## The original plan was already documented

- [`docs/IP_POLICY.md`](IP_POLICY.md) distinguishes public **OECL Core** from
  advanced **OECL Research**, preserves contributor copyright, and lists
  research memory, accumulated knowledge, hypothesis models and source code as
  possible research assets.
- [`docs/LICENSING.md`](LICENSING.md) identifies Composition Intelligence,
  Hypothesis Generation/Validation, Adaptive Planning, Research Memory and
  Research Knowledge as advanced Research examples, with the **possibility**
  of different future licensing terms.
- [`docs/GOVERNANCE.md`](GOVERNANCE.md) requires reproducible experiments,
  independent modules, cumulative knowledge and accurate uncertainty.
- [`docs/CLA.md`](CLA.md) is expressly a **draft**; publication of that draft
  does not mean every external contributor has signed an agreement.
- The repository-wide [`LICENSE`](../LICENSE) is MIT. Proposed license
  differentiation was **not** implemented as a reliable technical boundary.

A policy saying “Research may have other licenses” does **not** override
the permissions already granted to legitimate recipients of MIT-licensed
material. A public repository is not a secret vault. Likewise, we cannot
assume every third-party document/data fragment in the repository is
independently owned by OECL; provenance and rights require per-source review.

## Evidence from the actual public Git tree

The public `main` already contains both algorithms and historical results:

| Evidence category | Current public paths | Assessment |
|---|---|---|
| Experiment/verification Core | `laboratory/`, `scripts/`, reference fixtures, documented scientific validators | Keep public and reproducible |
| Historical memory implementation | `laboratory/research-memory/ResearchMemoryEngine.ts`, `ResearchMemoryLoader.ts`, types | Already public source; preserve existing license permissions |
| Intelligence and learning | `laboratory/intelligence/`, `laboratory/composition-learning/`, `laboratory/knowledge-consolidation/`, knowledge engines | Already public source; reserve only **future new original capabilities** by prospective architecture |
| Historical accumulated memory | `research-memory-results/OECL-V2-RESEARCH-MEMORY.json`, `OECL-V2-RESEARCH-MEMORY-RESULT.json`, `research-memory.json` | Already public data; do not claim secrecy |
| Other historical research output | `research-knowledge-results/`, `composition-learning-results/`, `knowledge-consolidation-results/`, `intelligence-results/`, `analysis-results/` and other `*-results/` directories | Already public; review sources and preservation, freeze tracked outputs by default |
| Future customer analysis, unpublished memory and new research strategies | Not identified as a separately protected installed data service | **Not yet private by default until the isolation boundary and storage service are used** |

The tracked historical `OECL-V2-RESEARCH-MEMORY.json` declares **277
events, 192 timelines, 11 source IDs**, with **12 supported and 265
emerging** events. These are data claims within the file, not verified
external-chain consensus and not proof of a trained AI model. The
`ResearchMemoryEngine` maps research knowledge entries into dated
events, merges timelines and aggregates counts. It does **not** expose
trained neural model weights in the reviewed files.

On this snapshot, the public repo contains dozens of historical result
directories (79 top-level results families and `sources/research` in
the inspected tree). **Do not copy new client material into them.**

## Three different intellectual assets

**1. Open scientific instruments.** Type definitions, experiment schemas,
read-only validators, baseline fixtures and bounded falsification tests.
A fork should be able to run them and independently challenge an exported
report without obtaining another customer's history.

**2. Released scientific findings.** Public experiment-specific hypotheses,
the exact sources/assumptions used, the actual minable EVM fixture when
authorized, receipts, negative controls, evidence provenance, limitations,
reproduction instructions and clear uncertainty. A numerical score or
SHA-256 alone is not an externally reproducible experiment.

**3. Prospective private research assets.** Unpublished experiment backlog,
internal hypothesis prioritization, source-licensed/client-provided
materials, individual client's studies, unpublished research memory,
future original enhancements and separately hosted research indexes.
They may form the service's competitive advantage **only if kept
confidential where appropriate and developed with valid contributor and
third-party rights**.

The third category does not include items already released under MIT.
No copyright transfer is made by GitHub fork, and copyright ownership
must be distinguished from the license permitted to existing recipients.

## New technical boundary in this PR

1. `.gitignore` excludes `.oecl-private/`, `private-research/`,
   `client-research/` and `research-secret/` **prospectively**.
   Ignoring a path does not untrack previously committed data, encrypt
   anything, or prevent an explicitly forced `git add -f`.
2. `scripts/run-research-memory.ts` continues to call the **same
   ResearchMemoryEngine** but now writes to the ignored private root
   rather than the tracked `research-memory-results` path by default.
   The knowledge input defaults to an explicitly public legacy
   fixture and can be overridden for a separately protected analysis.
   Old memory history can be **explicitly seeded** using
   `OECL_RESEARCH_SEED_PUBLIC_HISTORY=1`; it is never silently
   reclassified as confidential.
3. `OECL_PRIVATE_RESEARCH_ROOT` may point to `.oecl-private/` in
   the repository (ignored) or to a separately permissioned directory
   **outside the public repository**. Attempts to point into any
   other location *inside* the public tree fail closed; existing
   symlinks are checked against the canonical real path. Two private
   JSON files are written atomically, with restrictive Unix file
   permissions where supported. This is not encryption at rest.
4. The new `scripts/check-public-research-boundary.cjs` rejects new
   tracked files inside private paths and additions/modifications
   under existing public result trees (`*-results/`,
   `analysis-results/`, `sources/research/`). Legitimate new
   public case studies should be **reviewed and intentionally
   published** under a separate public-fixture namespace rather than
   silently extending a historical mutable memory snapshot.
5. The CI workflow exercises a **negative control** that intentionally
   attempts to write memory into the public historical path and must
   be refused. It then runs the existing engine with public fixture
   input and a private temporary output directory and verifies no
   tracked research data was changed. It also checks path
   classifications and the base-to-head PR diff.

CI uses only existing **public test data**. Do not upload confidential
customer code, tokens, customer names or unpublished business
information to public GitHub Actions, issue comments, output logs or
artifact uploads.

## How to use prospective private research locally

By default, from the repository root:

```bash
npm ci
npm run memory:v2
```

The result now writes under
`.oecl-private/research-memory/OECL-V2-RESEARCH-MEMORY.json`
and its `-RESULT.json` companion, **not** into the historical Git-tracked
`research-memory-results/`.

For a protected external storage location containing separately
authorized input data:

```bash
OECL_PRIVATE_RESEARCH_ROOT=/secure/oecl-research \
OECL_RESEARCH_KNOWLEDGE_INPUT=/secure/oecl-input/knowledge.json \
OECL_RESEARCH_SOURCE_ID=CONTROLLED_SOURCE_ID \
npm run memory:v2
```

This CLI command does not create a hosted secure database or an
organization-wide backup. Protect the external directory with actual
filesystem ACLs, encryption at rest, encrypted backups, key rotation,
retention/deletion rules and role-based access. Avoid personal or
confidential identifiers in diagnostic logs and public reports.

To reproduce *public historical* research memory continuity in your
own private working store, optionally set
`OECL_RESEARCH_SEED_PUBLIC_HISTORY=1` on an **empty** private output
directory. The previous public snapshot remains unchanged. Do not call
the seeded snapshot a new independent EVM confirmation.

## Release-architecture contract

A later hosted Research service can maintain a private research store
and return a **minimum sufficient publication package**:

```text
OECL open Core                         OECL private Research service
---------------
public ERC specifications             access-controlled client requests
public reproducible examples          unpublished research hypotheses
read-only dossier verifier            private cumulative memory and indexes
source/EVM evidence controls          original future advanced strategies
             |                                  |
             +-------- reviewed export ---------+
                         |
              public or client-authorized
              scoped evidence dossier
```

The research store must not be included in the public application
bundle, Next.js static generation, public Git clones, GitHub Actions
artifacts, Vercel runtime logs, browser props or downloadable archives
except through an explicit verified, authorized export. Consider
individual customer data isolation and lawful retention separately.

A **private copy of already public MIT code** does not make that
historical code secret. Protection can apply prospectively to genuinely
new original material and appropriate confidential databases, subject
to contributor rights and third-party licenses.

## Legal and operational unresolved decisions

- Human IP/copyright review of whether any historical research data
  includes third-party rights or confidentiality duties.
- Verify software authorship and contributor permissions; review
  `docs/CLA.md` before accepting external contributions routinely.
- Scope and comply with AGPL obligations of the pinned Solmate
  **test research dependency**; do not publish/market its derived
  fixture as OECL proprietary code without separate review.
- Decide whether future unpublished algorithms need a separate
  repository, access-controlled database, commercial license, or
  additional contractual protection.
- Review user/agent consent, customer submissions, privacy policies
  and data retention before enabling client research uploads.
- Verify GitHub branch protections and access logs; `gitignore` or
  CI alone cannot prevent users with unrestricted push privileges
  from publishing a file.
- Ensure an external party can reproduce **published scientific
  claims** from an authorized evidence export, rather than trusting
  unreleased private reasoning alone.

**The existing #49 public scientific consolidation and #50 isolated
privacy proposal remain unmerged.** The privacy boundary was first
prepared independently in #50 against `main`; it has now been joined
to #49 through an **explicit two-parent integration in draft #51**.
#51 is the intended single future release candidate, not an excuse
to merge #49 and #50 separately. Its CI must prove that the original
72 research/quality source blobs are still identical and that the
five privacy changes are exactly the reviewed files. No main-branch
merge or public deployment occurs without human authorization.

This is a technical risk review, not an assertion of
trade-secret eligibility or a substitute for legal advice.
