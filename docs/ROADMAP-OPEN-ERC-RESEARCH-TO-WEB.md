# OECL — Open ERC research-to-composition delivery contract

Status: implementation plan, **not** evidence that the features are already operational.

## Product mission

Given any two or more identified Ethereum ERC standards, OECL must retrieve attributable specifications, implementations and discussions; derive their capabilities, requirements and invariants; propose falsifiable cross-protocol hypotheses; test executable configurations where feasible; and return **which properties are inherited, complementary, emergent, contradicted, or not yet established**. No unsupported verdicts.

GitHub and Ethereum Magicians are different evidence classes. A forum claim does not prove deployed behavior; an interface name does not prove executable compatibility; an ERC proposal is not necessarily finalized. OECL must not conflate standards, implementations, deployment instances or revisions.

"All ERCs" means a **continuously discoverable, paginated and versioned research universe**, not an unbounded one-shot crawl or a claim of complete coverage. Start with Ethereum EIPs/ERCs registry and relevant GitHub repos, then link matching Ethereum Magicians topics. Record crawl coverage, exclusions, source failures, and timestamps.

## Existing reusable infrastructure

- `sources/manifest.json` and research ingestion, semantic and provenance engines.
- Scientific candidate discovery, capability and boundary attribution, compatibility, N-protocol solver, global evaluation, Harmony, composition value.
- Joint contract harness and interaction shadow validation for evidence-backed execution.
- Web Next.js `/api/scientific/discovery` and `/api/scientific/pair`, currently materialized snapshots rather than on-demand research.
- The Graph / independent RPC evidence receipt gate, currently scoped to selected ERC-8004 observations.

**Do not replace these with a new parallel engine.** Integrate via explicit typed artifacts and deterministic, testable adapters.

## Phase 1 — Versioned standards and discussion corpus (first deliverable)

Define `ProtocolIdentity` with `ercNumber`, `eipNumber?`, `status`, `standardRevision`, `canonicalSpecUrl`, `sourceRepository?`, `sourceCommit?`, `implementationAddress?`, `chainId?`, `retrievedAt`, `contentHash`. Treat one ERC with multiple revisions or implementations as multiple evidence subjects.

Define `SourceObservation` with `sourceType: EIP_SPEC | GITHUB_CODE | GITHUB_TEST | MAGICIANS_POST | CHAIN_STATE`, `url`, `author?`, `publishedAt?`, `retrievedAt`, `contentHash`, `revision?`, `claimType`, `extractedClaim`, `quoteSpan?`, `attribution`, `verificationStatus`. Preserve exact citations and forum post timestamps.

- EIP/ERC source adapter: paginated registry discovery, status and revision, canonical EIP/ERC document, linked repositories.
- GitHub source adapter: source-code and test provenance pinned to commit SHA; respect permissions, API quotas and repository size.
- Ethereum Magicians adapter: Discourse topic/post API with pagination, rate limits, attribution and edit timestamps; extract **claims and counterarguments**, not authoritative code facts.
- Reconciliation: exact identity and version matching, contradicting evidence retained, no forced consensus. Discussions can propose hypotheses but cannot directly set SUPPORTED.
- Scheduled incremental refresh with cursor/checkpoint, retry/backoff, content hashes, idempotent updates and auditable coverage report. Do not store secrets in repo or generated public artifacts.
- First corpus acceptance: enumerate registry pages, retrieve 10 deliberately diverse ERCs, associate available Magicians topics, report source coverage and discrepancies; prove a missing/unreachable source is UNKNOWN rather than incompatible.

## Phase 2 — Existing pipeline wired end to end

`source observations -> revision-aware protocol profiles -> declared capability graph -> candidate graph -> relevant boundaries -> hypotheses -> execution/evidence -> global N-protocol solver -> Harmony -> composition value -> final report`.

Every stage emits input/output IDs, source revisions, errors and coverage. A candidate must remain unevaluated until qualifying evidence arrives. A pair result must not be synthesized from documentary relations or lexical overlap.

For execution, use registered recipes only when source materialization and sandbox restrictions permit. No arbitrary untrusted repository code or forum-supplied commands in production web requests. Isolation, resource caps, dependency pinning and human-reviewed execution recipes are required. Record what was simulated vs actually executed.

First end-to-end acceptance: use existing ERC-8004 + ERC-8060 positive-control work, ERC-8301 + ERC-8354 inconclusive control and an independently evidenced negative boundary violation. Ensure results are derived from artifacts rather than hard-coded `satisfied: true` gate arrays. Add one N>=3 experiment with a supported subset and unresolved full set.

## Phase 3 — Emergent-property discovery (not just fixed labels)

Introduce `PropertyHypothesis` with:
- `propertyId`, `statement`, `observablePredicate`, `participants`, `configuration`, `baselineControls`, `expectedFailureModes`, `evidenceIds`, `counterEvidenceIds`, `status`.
- Distinguish `INHERITED` (already in one participant), `COMPLEMENTARY` (combined coverage), `EMERGENT_CANDIDATE` (new cross-protocol behavior), `EMERGENT_VERIFIED` (experimentally demonstrated and attributable), `CHALLENGED` and `INCONCLUSIVE`.
- Compare full composition with each isolated protocol and with leave-one-out controls. Demonstrate the observed behavior is absent from required baselines, depends on the claimed interaction, survives boundary/invariant checks, and is reproducible under stated conditions.
- Generate falsifiable hypotheses from unmet needs, cross-protocol calls, state transitions and capability graphs; do not promote a text-generation guess into an established property.
- Preserve counterexamples, partial scopes, revision dependencies, and explicit confidence limits. A `SUPPORTED` composition is **not** automatically an emergent property.

Acceptance: one reproduced emergent behavior with control evidence, one inherited behavior rejected as "emergent", one challenged behavior and one unresolved case. No manufactured verdicts.

## Phase 4 — Research web UX

Build on existing `web/` (Next.js), not a separate frontend.

Pages:
1. **Explore ERCs**: searchable, filterable standards inventory; source status, spec revision, GitHub implementation, Magicians discussions, last research timestamp and coverage.
2. **Compose**: select 2..N ERCs and an objective, with exact revisions/implementations; show discovery candidate vs evaluated composition distinctly.
3. **Composition dossier**: capabilities/needs, dependency graph, viable full and partial configurations, invariants and risks, inherited/complementary/emergent hypotheses, status and exact evidence citations.
4. **Experiments**: reproducible recipe, environment, observations, controls, run ID and failures; explicit request/review workflow for unregistered execution.
5. **Research provenance**: contradictory claims, source hashes, stale/unavailable sources and rerun history.

API contract: `GET /api/protocols`, `GET /api/protocols/:id`, `POST /api/compositions/research` (async job + idempotency key), `GET /api/research/:jobId`, `GET /api/compositions/:id/report`. Auth and rate-limit expensive jobs. Do not expose arbitrary execution.

The existing `/api/scientific/pair` and `/api/scientific/discovery` remain clearly marked **snapshot** APIs until they use verified current research artifacts. No empty result is an incompatibility verdict.

## Release gates

1. Unit tests for identity/revision/source conflict, candidate vs proof, missing sources and deterministic output.
2. Integration tests for paginated GitHub/EIP/Magicians ingestion with recorded fixtures, rate-limit and update behavior.
3. Scientific regression tests including positive, negative, inconclusive, partial and leave-one-out controls.
4. Web e2e for multi-ERC selection, asynchronous progress, evidence drilldown and stale-data warnings.
5. CI: TypeScript, lint, tests, provenance validation, no production secrets, no arbitrary code execution.
6. Independent manual review of scientific verdicts before a public claim that OECL "discovers verified emergent properties".

## Immediate engineering order

1. Implement the corpus identity/source observation schemas and **one real paginated adapter**, with fixtures and coverage report.
2. Add Magicians discussion adapter and cross-source reconciliation.
3. Wire existing engines to produce a revision-pinned scientific dossier for two selected ERCs.
4. Build searchable corpus and compose UX over real data.
5. Implement experimental baselines and verified emergent-property reporting.
6. Scale crawling and N-protocol experiments incrementally with observability and cost controls.

No production contract changes, holder migrations, ERC-8060 modifications or on-chain transactions are authorized by this plan.
