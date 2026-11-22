# PR #14 — Solidity AST graph explorer security / scientific review

**Date:** 2026-11-22
**Target:** PR #13 `feat/oecl-v2-isolated-generic-ast-worker`
**Decision:** **READ-ONLY SOURCE RESEARCH, KEEP DRAFT.** Do not merge automatically or publicly enable research dispatch.

## Verifiable implemented scope

- Renders source-derived functions, inherited bases, modifier links, guard conditions, state decreases and unadmitted hypotheses in an SVG explorer. Supports keyboard selection, filters, source links and JSON download. The visualization does **not** execute contracts, infer general ERC compatibility, or synthesize runnable composition experiments.
- Four historical, pinned CI sample graphs are available through read-only `GET /api/scientific/source-views`. Their immutable snapshot is checked by a fixed SHA-256. The fourth, ERC-1155 × ERC-20, is a **negative discovery control (zero hypotheses)**, not evidence of incompatibility.
- The native projection `ScientificGraphView.cjs` checks schema, artifact SHA-256 consistency, source provenance, selected participants, compiler function IDs, called AST edges, state-write locations and explicitly unadmitted hypotheses. It intentionally displays a bounded subset rather than every AST node.
- `GET /api/scientific/source-jobs/:id/view` is a separate authenticated research-only route. It checks the job UUID, workflow identity/run and requested registered pair; follows a bounded GitHub-signed artifact download, rejects ZIP path/CRC/size tampering, checks request.json correlation and projects the graph. If the archive is not verified, it returns a failure rather than substituting a historical snapshot.
- PR #13's separate job-status gate now requires the exact named, nonempty, nonexpired GitHub artifact before it reports `SOURCE_ARTIFACT_AVAILABLE`. The graph view performs deeper document-level checks when the verified archive is requested.

## Scientific interpretation

- Source-only evidence is **not** proof that a function is actually reachable or that two standards can safely execute in one EVM transaction. Modifier prerequisites, inherited guards, cross-contract custody, adapter choices, concurrency, dynamic dispatch, and runtime environment remain unresolved.
- A dashed `HYPOTHESIZES` graph edge is an **unverified research hypothesis**. A solid `CALLS` edge is a compiler-resolved source relationship, not a path-feasibility proof.
- Reported conclusion remains `INCONCLUSIVE`, candidate `NOT_ADMITTED`, `sourceOnly=true`, `evmExecuted=false`. The pinned ERC-8060 × ERC-8098 experiment is distinct and must not be promoted by this graph.
- Four hashes for embedded snapshots establish **internal identity of reviewed historical data**. They do not prove that an independent party replayed source acquisition or that arbitrary new contracts have compatible behavior.

## Security gates and residual risks

1. Keep research dispatch and live artifact retrieval **disabled by default** on public/production deployments; credentials belong server-side and must never be committed or stored in client-readable configuration.
2. GitHub Actions jobs execute from `main` for manual dispatch, while the reference Solidity sources are fixed by commits. A green workflow on `main` does not by itself pin OECL producer code for future runs. Preserve workflow SHA and enforce reviewed producer-revision policy before public release.
3. The ZIP reader's CRC32 only detects accidental/naive corruption; **CRC is not a cryptographic signature**. Trust still depends on GitHub's authenticated API, run metadata, pinned source report chain, and the explicit SHA-256 source-manifest linkage.
4. Signed artifact URL origins are intentionally limited but include approved GitHub storage infrastructure; review endpoint security and token scope before wider deployment. Avoid assuming a redirect response is automatically scientifically trustworthy.
5. Public multi-user operation still lacks persistent job identity/ownership, atomic shared quotas, deduplicated queueing, precise consumption budgets, and hardened restricted-network compilation.
6. The fixed sample JSON is a historical research snapshot; updating the source registry or worker does **not** regenerate those samples automatically. Snapshot provenance and original run must remain visible.
7. No auditor has certified deployment safety, no independent EVM replay exists for new AST pairs, no generic Solidity repository input is permitted, and no emergent property has been scientifically admitted.
8. Require on the latest branch head: green source-worker/falsification workflow with four real pairs, web verification and production smoke, native recipe, pinned EVM, CI and main scientific regression. A prior branch's green results are insufficient.

## Reconciliation with PR #13

- PR #14 now contains the upstream source-job artifact-verification fix and PR #9/12/13 scientific safety reviews. The incoming Git history is retained as a second parent.
- The `GenericSourceLabLauncher` only renders a live graph after the source-job API confirms `SOURCE_ARTIFACT_AVAILABLE`. A failed live load does not silently show an unrelated historical graph.
- Existing reference ERC repositories and OECL `main` were not modified in this PR review.

**Release decision:** Draft research feature. A working AST visualization is a valid OECL deliverable, but not a validated or production-secure composability engine.
