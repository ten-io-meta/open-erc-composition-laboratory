# OECL V2.1 Final Validation

## Frozen candidate

Branch: `oecl-v2.1-quality-pass`

Pre-validation implementation HEAD:

`50b6bfc Add executable scientific demo CLI`

## Final regression

The OECL scientific regression suite discovered 216 checks.

- Executed: 211
- PASS during full suite: 206
- FAIL during full suite: 5
- Excluded: 5
- Empty: 0
- TypeScript: PASS

The suite-level result was therefore FAIL and is not represented as 211/211 PASS.

## Failure classification

Four failures were live The Graph checks:

- `check-live-the-graph-agent0-erc8004.ts`
- `check-live-the-graph-product-discovery.ts`
- `check-live-the-graph-protocol-attribution.ts`
- `check-live-the-graph-subgraph-inspection.ts`

All four aborted before live validation because `THE_GRAPH_API_KEY` was not available.

They are recorded as NOT VALIDATED, not as scientific failures.

The fifth failure was:

- `check-v21-real-control-generic-boundary-bridge-runtime.ts`

During the full suite it failed because the GitHub source adapter could not resolve `github.com`.

The check was rerun independently after connectivity recovered and passed:

- PASS: 8
- FAIL: 0
- RESULT: PASS

## Final validated state

Unique executed checks with successful validation:

- 206 passed in the complete regression run
- 1 additional previously failed check recovered and passed independently

Therefore 207 unique executed checks are validated PASS.

Four live The Graph checks remain NOT VALIDATED because their external API-key prerequisite was unavailable.

Known scientific failures after targeted recovery: 0.

## Scientific controls

- Positive real control ERC-8004 × ERC-8060: SUPPORTED
- Challenged real control: no qualifying real violation selected; none manufactured
- Inconclusive real control ERC-8301 → ERC-8354: INCONCLUSIVE

## V2.1 projection layers

Validated additions include:

- Final Scientific Report
- Candidate Composition Dossier
- Why / Why not explanation
- Clean demo CLI

These layers are projections of upstream scientific state and do not create scientific polarity.

## Freeze condition

Before freeze:

- TypeScript: PASS
- Main worktree: CLEAN
- External scientific baselines: CLEAN
- Known scientific failures: 0
- Live The Graph checks without API key: NOT VALIDATED

OECL V2.1 is frozen with this validation state explicitly recorded.
