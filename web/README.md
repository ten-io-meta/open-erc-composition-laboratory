# OECL scientific web

This Next.js interface **displays upstream scientific evidence**. It does not admit new composition candidates or infer compatibility from a user-selected pair.

## Pinned scientific dossier: ERC-8060 × ERC-8098

The workbench defaults to ERC-8060 × ERC-8098. Select **Inspect available evidence** to see the report created by OECL's pinned local-EVM workflow.

- UI: src/components/ScientificDossierResults.tsx
- Read-only API: GET /api/scientific/dossier?protocolA=ERC-8060&protocolB=ERC-8098
- JSON download: append &download=1
- Pinned payload: src/data/erc8060Erc8098ScientificDossier.json
- Server integrity gate: src/server/oeclScientificDossier.ts
- Evidence source: https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/44963511127

The payload was projected from real compiler AST and pinned local-EVM artifacts. It reports the source-only hypothesis, bounded emergent-property observation, scientific questions, observed adversarial scenarios, untested threats, exact source revisions, and original artifact digests.

**Scientific boundary:** INCONCLUSIVE, NOT_ADMITTED. The native scientific candidate was not admitted. The ten questions have scoped local observations, but source coverage is incomplete and the observations are not independent public-chain replay or a full security proof. A local constraint SUPPORT never becomes global SUPPORTS in this web projection.

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
