# OECL scientific web

This Next.js interface **displays pinned scientific evidence and allows documentary exploration of published ERC specifications**. It never admits new native composition candidates or infers implementation compatibility from document metadata.

## Any published ERC: documentary pair investigation

The main workbench accepts any two positive numeric ERC IDs (up to 8 digits). For pairs without a pinned AST/EVM result, it calls:

- `GET /api/scientific/standards-pair?protocolA=ERC-4626&protocolB=ERC-20`
- Retrieval: `src/server/oeclErcDocumentaryDiscovery.ts`; the input cannot specify a host, URL, repository, branch, contract, or script.
- Source: official `ethereum/ERCs` repository's `ERCS/erc-N.md` documents on the public `master` branch, with SHA-256 of each retrieved document. This branch is **mutable**, so it is not an immutable source-code attestation.
- Results: document title/status, summary, declared `requires` prerequisites, labeled interface elements and normative excerpts, with provenance links.
- Pair relations: explicit declaration that one ERC requires the other; shared declared prerequisites; or no declared direct dependency. Missing/unreachable documents produce an **incomplete-document** state instead of a compatibility claim.
- Scope: `OFFICIAL_ERC_SPECIFICATIONS_ONLY`, `scientificVerdict: NOT_EVALUATED`, `candidateAdmission: NOT_ADMITTED`, `implementationVerified: false`, `evmExecuted: false`.
- Unit/security tests: `node --experimental-strip-types web/scripts/check-erc-documentary-discovery.mjs` (run from repository root); integration and browser checks run in the OECL Web Scientific Dossier workflow.

**This broadens discovery but does not run Solidity for any arbitrary ERC.** The ERC number identifies a specification, not a unique implementation or ABI. Arbitrary draft/unmerged proposals or missing official documents remain unverifiable without a separate submitted source. A future isolated source-worker must accept an immutable source reference, enforce resource limits, derive structural facts from the compiler, evaluate constraints, and produce independent EVM evidence before any general-science claim.

## Pinned scientific dossier: ERC-8060 × ERC-8098

The workbench defaults to ERC-8060 × ERC-8098 and loads its pinned local-EVM dossier automatically. Select another official numeric ERC pair to start a documentary comparison.

- UI: src/components/ScientificDossierResults.tsx
- Read-only API: GET /api/scientific/dossier?protocolA=ERC-8060&protocolB=ERC-8098
- JSON download: append &download=1
- Pinned payload: src/data/erc8060Erc8098ScientificDossier.json
- Server integrity gate: src/server/oeclScientificDossier.ts
- Evidence source: https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/44963511127

The payload was projected from real compiler AST and pinned local-EVM artifacts. It reports the source-only hypothesis, bounded emergent-property observation, scientific questions, observed adversarial scenarios, untested threats, exact source revisions, and original artifact digests.

**Scientific boundary:** INCONCLUSIVE, NOT_ADMITTED. The native scientific candidate was not admitted. The ten questions have scoped local observations, but source coverage is incomplete and the observations are not independent public-chain replay or a full security proof. A local constraint SUPPORT never becomes global SUPPORTS in this web projection.

The upstream research-only security and evidence review is maintained in [PR #9 review](../docs/reviews/pr9-final-security-evidence-review.md). It explicitly distinguishes the 11 observed scenario classes from 9 untested classes, including adversarial asset implementations, concurrency, and public-chain replay. Reconciliation of the PR #9 branch with this web layer changes neither the pinned JSON payload nor its SHA-256; the dossier remains an immutable historical report, not a live scientific re-evaluation.

The snapshot is pinned with a SHA-256 over JSON.stringify of the imported JSON. If modified without revising the server manifest, the API rejects it. The website's digest confirms snapshot consistency, **not** independent validity of all source artifacts; source evidence remains available in the GitHub Actions run.

Other ERC pairs keep the original /api/scientific/pair materialized projection. The dossier route returns 404 NO_VERIFIED_DOSSIER for unpinned pairs; this is not an incompatibility result.

## Local verification

From web/:

    npm ci
    node scripts/check-scientific-dossier.mjs
    npm run lint
    npm run build
    npm run dev

The dedicated GitHub workflow .github/workflows/web-scientific-dossier.yml tests these steps on pull requests.

## Future: new user-initiated analyses

Not yet implemented. Do not execute arbitrary repository-supplied code inside the Next.js server.

A separately reviewed job service should accept validated repository URLs and immutable commit SHAs; enforce time, size, and network limits; obtain sources in a sandbox; run AST-first source analysis; register experiments only when sources and constraints are bound; and emit machine-readable provenance bundles.

The interface should expose QUEUED, RUNNING, INCONCLUSIVE, COMPLETED, and FAILED states. It must show the scientific outcome from the native evaluator, not compute it in the UI.

All source reads and EVM experiments must be isolated from the public request handler. Until the job service and its abuse controls are reviewed, requests remain read-only.

## Controlled on-demand reproduction (research beta)

The first on-demand job is intentionally **restricted to the already reviewed**
ERC-8060 × ERC-8098 pinned recipe; it is a new run, not an unrestricted analysis
of arbitrary ERC pairs.

- Browser: `PinnedAnalysisJobLauncher` in the Composition Workbench
- Discover availability: `GET /api/scientific/jobs`
- Start an approved fresh run: `POST /api/scientific/jobs` with no request body
- Follow state: `GET /api/scientific/jobs/{requestId}`
- Correlation: GitHub Actions workflow_dispatch with run name
  `OECL-REQUEST-{requestId}`, identified by a random UUIDv4
- Artifacts: existing pinned joint-EVM workflow uploads the scientific dossier,
  compiler-AST graph, source witness receipts and adversarial coverage. The
  request metadata is included in the new run artifact.

The server intentionally **does not** execute Solidity, accept user-supplied
code, trust a URL from a web request, decide compatibility or mint a science
candidate. No status other than a verified native evaluator can claim a
scientific verdict. A successful workflow initially reports `AWAITING_EVIDENCE`;
only a separate GitHub artifact-list verification confirming the expected
nonempty, unexpired artifact for the exact workflow run can report
`EVIDENCE_AVAILABLE`. Artifact listing is **not** a source-integrity replay,
scientific `SUPPORTS`, or candidate `ADMITTED`.

### Activation (only AFTER reviews and merging to the default branch)

GitHub workflow_dispatch is only supported when the matching workflow exists
on the repository's default branch. Until then no deployment should claim the
feature is active.

To activate **privately** on a trusted HTTPS deployment configure these
server-only variables (never add `NEXT_PUBLIC_`):

- `OECL_ENABLE_PINNED_ANALYSIS=true`
- `OECL_ANALYSIS_ACCESS_KEY` = unique random high-entropy key, minimum 32 characters
- `OECL_GITHUB_ACTIONS_TOKEN` = fine-grained GitHub token restricted to this
  repository, with **Actions: read and write** permission

Do not commit these secrets. The research beta form accepts an access key only
for authorized testers; it remains in component memory, is not persisted to
local storage or sent as a URL parameter. Never embed the GitHub token in the
browser. Rotate secrets after exposure.

The web dispatcher additionally checks GitHub's recent run list, rejecting
new work when a previous controlled reproduction is queued/running or when
three controlled runs have started in 24 hours. This is advisory and **not**
an atomic distributed quota: a proper public deployment needs authenticated
per-user identities, a shared atomic rate limiter, queue persistence, request
deduplication, execution budget enforcement and isolated workers. Do not open
the beta dispatcher publicly without those controls.

If any variable is absent, the server returns `NOT_CONFIGURED`, and
`POST` returns 503 without contacting GitHub. Invalid keys return 401;
unknown workflow run IDs are `AWAITING_GITHUB_RUN`, never fabricated success.
A green workflow without an independently listed artifact stays `AWAITING_EVIDENCE`
(and GitHub lookup errors return 502), never an invented evidence receipt.

### Verification

Run after installing exact web dependencies:

    node --experimental-strip-types scripts/check-on-demand-jobs.mjs
    npm run lint
    npm run build
    node scripts/smoke-scientific-dossier.mjs

### Next science milestone

Create an isolated source-ingestion worker with allowlisted GitHub origin,
commit SHA pinning, compiler-locked dependency graph, resource quotas,
execution timeouts, no inbound secrets, no general outbound network, explicit
scientific admission gates, immutable artifact publication and a secure job
store. Only then may arbitrary ERC combinations be requested by normal users.
