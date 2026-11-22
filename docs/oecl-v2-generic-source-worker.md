# OECL v2 — Generic compiler-AST source laboratory

## What this implementation actually does

OECL accepts **two registered source profiles** and routes the request to an
ephemeral GitHub-hosted Action, separate from the Next.js server. The worker
acquires commit-pinned GitHub Solidity blobs, verifies their Git SHA-1 blob IDs
against the immutable commit tree, computes SHA-256 source identities,
recursively resolves local Solidity imports, and compiles them to a Solidity
AST using a pinned dependency installation.

The existing OECL `ScientificSolidityAstGraph.cjs` derives inheritance,
functions, call edges, modifiers, state writes, guards, branches, external
calls and unresolved references. The new generic adapter
`GenericAstPairHypotheses.cjs` proposes **source-only** relations
without naming ERC-8060 or ERC-8098 in its discovery rules.

Supported source profiles in `source-registry.json`:

- ERC-8060 reference (exact pinned GitHub commit)
- ERC-8098 reference (exact pinned GitHub commit)
- ERC-20 reference implementation (OpenZeppelin v4.9.6)
- ERC-721 reference implementation (OpenZeppelin v4.9.6)
- ERC-1155 reference implementation (OpenZeppelin v4.9.6)
- ERC-20 Burnable **extension** (not a standalone ERC; OpenZeppelin v4.9.6)

The catalogue is deliberately finite in this research beta. An arbitrary
GitHub URL, file upload, unregistered ERC, branch name or user-supplied
build command is **not** a valid job input. New catalogue entries require
source-identity review and a new regression test.

## Scientific output / limitations

Files per successful job:

- `structural-ast-graph.json`: compiler-derived graph, source hashes,
  unresolved references and scientific limitations
- `generic-source-hypotheses.json`: hypotheses and their actual AST source
  evidence (per-function call paths and affected state variables)
- `source-scientific-report.json`: selected source identities, pinned
  revisions, compiler version, graph/hypothesis digests, summary and limitations

`SHARED_STANDARD_INHERITANCE` means two contracts have a source-resolved
base class; it **does not** prove that they are compatible or composable.

`POTENTIAL_COUPLED_STATE_DECREASE` means that each implementation contains
a compiler-resolved public-to-state-decrease call path; it **does not** prove
the path is feasible under restrictions, that an atomic coordinator exists,
or that the two assets use interchangeable units.

All outputs deliberately retain:
`scientificVerdict: INCONCLUSIVE`,
`candidateAdmission: NOT_ADMITTED`,
`sourceOnly: true`, `evmExecuted: false`.

No cross-protocol EVM execution is performed here. No source candidate is
automatically admitted. Existing PR #9 EVM receipts are kept separate.

## Reproduction and CI

GitHub Actions:
`.github/workflows/oecl-generic-source-lab.yml`

The workflow installs an audited, immutable dependency-carrier repository
from a pinned commit via `npm ci --ignore-scripts`; it does **not** run
source repository package scripts. It uses `solc` in a separate GitHub runner
to compile only to AST.

For source-only regression, the workflow executes three real pairs:

1. ERC-8060 × ERC-8098
2. ERC-8060 × ERC-20 Burnable extension
3. ERC-8098 × ERC-20
4. ERC-1155 × ERC-20 — negative control expected to produce no hypothesis

The first three runs must produce at least one AST-derived hypothesis. The
fourth must produce zero and remain INCONCLUSIVE. All runs maintain
`INCONCLUSIVE`. Additional adversarial unit tests remove call edges,
forge source digests, alter pinned blobs, attempt import traversal and
tamper with scientific verdicts.

To reproduce from an Action checkout directory:

    npm ci --ignore-scripts  # in dependency-source/ only
    node oecl/scripts/check-generic-source-worker.cjs
    node oecl/laboratory/scientific-open-source-worker/run-generic-source-worker.cjs ERC-8060 ERC-20-BURNABLE dependency-source source-output/test

On manual dispatch, the source profile IDs and UUID are validated against
the registry before fetching source code; the output artifact contains
the job correlation ID and workflow commit. GitHub workflow_dispatch must
exist on the default branch before the website can trigger it.

## Web / API

- `GET /api/scientific/source-jobs`: catalogue and runner availability
- `POST /api/scientific/source-jobs`: authenticated, two-profile source
  selection, no arbitrary repository fields or URLs
- `GET /api/scientific/source-jobs/:id`: correlated external run status

The `GenericSourceLabLauncher` component presents choices in the OECL
composition workbench, polls only an authorized job, and links to the
original GitHub artifacts when the workflow has completed.

A green GitHub workflow first reports `AWAITING_SOURCE_ARTIFACT`.
Only after the status API separately lists a nonempty, unexpired artifact
named `oecl-generic-ast-evidence` for that exact run ID can it report
`SOURCE_ARTIFACT_AVAILABLE`. This is an **artifact existence state**, not a
scientific conclusion or independent verification of source output bytes.
The web never upgrades this to `SUPPORTS`, `ADMITTED` or a claim of
security certification. PR #14 adds read-only, SHA-256-pinned AST example
views and a separately authenticated live-archive verification gateway that
can project the compiler facts into the SVG explorer. Live source reports are
still unavailable without a verified workflow run and trusted artifacts;
no execution feasibility or general compatibility is thereby proven.

The server-side feature flag is `OECL_ENABLE_GENERIC_SOURCE_ANALYSIS=true`.
It also requires `OECL_ANALYSIS_ACCESS_KEY` and
`OECL_GITHUB_ACTIONS_TOKEN`. Do not use `NEXT_PUBLIC_` for these
credentials or commit them to the repository.

**Default = disabled**. The worker endpoint returns HTTP 503 without
credentials, preserving the public read-only dossier workflow.

## Security boundary and remaining work

Current bounds: fixed GitHub API origin, immutable commit tree and blob
identities, allowed local/package imports, no symlinked source paths,
256 KiB max/file, 2 MiB max source total, 110 files maximum, 12-minute
GitHub job timeout, read-only contents permission, 3 dispatches/day
advisory limiter and no concurrent active source job.

This is **separate execution from Next.js** on an ephemeral GitHub runner,
not a fully network-isolated or formally hardened sandbox.
The inherited dependency-carrier lockfile has npm audit findings.
Using a source compiler still requires a reviewed, patched toolchain,
secure quotas and resource isolation before allowing unrestricted public
user submissions.

Remaining milestones:

1. Independent content validation and comprehensive ingestion tests for new AST run archives, beyond bounded presence and source report consistency.
2. Stronger path-feasibility analysis for conditions/modifiers/inheritance,
   including contradictory restrictions and negative controls.
3. Cross-protocol experimental test synthesis with a separately isolated
   EVM job; no generic EVM claim before this is implemented.
4. Public auth, atomic distributed rate limit/queue, private worker without
   outbound network, signed provenance, dependency vulnerability remediation.

This staged rollout explicitly avoids misleading claims that OECL can already
verify every ERC pair on demand.
