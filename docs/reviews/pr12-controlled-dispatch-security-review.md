# PR #12 — Controlled GitHub Actions dispatch: security and scientific review

**Date:** 2026-11-22  
**Branch:** `feat/oecl-v2-controlled-on-demand-reproduction`  
**Verdict:** **PRIVATE-RESEARCH-BETA-ONLY / DISABLED BY DEFAULT.** Not production-hardened. Do not publicly enable or merge automatically.

## What this implementation actually does

- `GET /api/scientific/jobs` reports whether the private beta is configured.
- `POST /api/scientific/jobs` accepts **no body**, user repository, source code, arbitrary command, commit, or URL. It verifies a server-configured, high-entropy shared researcher key and dispatches exactly one pre-reviewed `joint-pinned-references.yml` workflow.
- The GitHub workflow still pins ERC-8060 to `c7eed906835ab39fbc8439eb0493e5a5371b23a2` and ERC-8098 to `68a05289bd68d89db8453c49500e0a1ae6cd11ec`, on local Hardhat chain 31337.
- A UUIDv4 is used to correlate a workflow-dispatch run name and a request. The Next.js route does **not** execute Solidity or handle Ethereum private keys.
- `GET /api/scientific/jobs/{id}` looks up the corresponding workflow by pinned repository/workflow and name, refusing to manufacture a scientific conclusion.
- The GitHub Actions success status first maps to `AWAITING_EVIDENCE`. Only a separate GitHub run-scoped artifact-list request confirming a nonempty, unexpired artifact named `oecl-two-pinned-references` permits `EVIDENCE_AVAILABLE`.
- Artifact listing alone does **not** verify the JSON contents, independently replay EVM transactions, or produce scientific `SUPPORTS`. Scientific verdict and candidate admission remain null on the job-status API; existing ERC-8060 × ERC-8098 dossier remains `INCONCLUSIVE` / `NOT_ADMITTED`.

## Safety controls observed in source

- Feature disabled unless `OECL_ENABLE_PINNED_ANALYSIS=true` and both private server-side credentials are configured.
- Access key comparison uses SHA-256 and constant-time digest comparison, with minimum key-length checks.
- GitHub API host, repository, workflow, run list and dispatch body are fixed server-side.
- Origin is rejected on explicit mismatch; the access-key header also prevents a simple cross-site form from being an authorized dispatch.
- Experimental workflow has `contents: read` and executes fixed source checkouts.
- Recent run-list quota prevents ordinary sequential overuse and avoids dispatch while a request is still active; it is **not** an atomic distributed rate limit.
- Unit checks include authorized mock dispatch, malformed job IDs, run-name/event mismatch, missing credentials, and missing/expired/empty/forged GitHub artifact listings.

## Remaining restrictions before any wider release

1. The shared researcher key is not user identity; deploy per-user authentication and revocation, an atomic shared quota, persistent job storage, duplicate-request rejection and budget tracking.
2. The GitHub `workflow_dispatch` API runs from a specified `main` ref. While source contracts are pinned, the OECL workflow/producer code on `main` is a **moving revision**, not an immutable scientific run definition. Record and attest its actual `github.sha`; consider a preapproved immutable producer revision for public use.
3. GitHub's run-list API is queried on the first page only (100 rows), so absence from the list is not proof of permanent nonexistence. Handle pagination, timeouts, and stale or ambiguous job states.
4. EVIDENCE_AVAILABLE establishes only GitHub artifact existence. Before comparing new research findings with the pinned dossier, download, hash-check and independently validate the complete evidence contents.
5. Verify API routes against concurrent dispatch, long-running job failures, rate exhaustion, request-body attacks and unauthorized requests in deployed HTTP tests. Mocked backend checks do not replace this.
6. Restrict server-side GitHub token to the single repository with minimal Actions permissions; never expose it as `NEXT_PUBLIC_*` or commit it.
7. `workflow_dispatch` requires the workflow on the default branch; this feature must remain disabled before reviewed integration and deployment.
8. Confirm GitHub Actions on the latest PR #12 head, including `OECL Web Scientific Dossier`, CI, native recipe, pinned EVM and core regression. Green web Preview is not proof of production deployment.

## Scientific merge gate

- The PR adds **controlled reproduction** only, not free-form ERC discovery.
- The UI must never treat successful EVM execution or GitHub artifact availability as global ERC compatibility or an emergent-property proof.
- PR #12 remains a **Draft** stacked on PR #11 and PR #9 until an independent review; its functionality stays disabled on untrusted/public deployments.
