# OECL v2 — Verified Solidity source-graph explorer

## Purpose

Make compiler-resolved source evidence and unadmitted generic hypotheses visible
in the OECL Next.js application without asking the user to open JSON files
in GitHub Actions. This feature extends the source-only worker in PR #13.

**No new EVM evidence, safety certification or admitted candidate is produced.**

## Four verified, immediately browsable examples

The source worker's real GitHub Actions regression generated four projections:

| Pair | AST hypothesis count | Scientific verdict |
| --- | ---: | --- |
| ERC-8060 × ERC-8098 | 1 | INCONCLUSIVE |
| ERC-8060 × ERC-20 Burnable extension | 1 | INCONCLUSIVE |
| ERC-8098 × ERC-20 | 1 | INCONCLUSIVE |
| ERC-1155 × ERC-20 | 0 | INCONCLUSIVE |

CI run: https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/44968168041

The projector `laboratory/scientific-open-source-worker/ScientificGraphView.cjs`
validates the source graph and hypothesis digests against the raw scientific
report, then checks the actual compiler IDs, call edges, state-change
locations, source hashes and participant identities. It refuses forged
verdicts, missing source evidence and invented call paths.

The four CI-produced views were promoted into the immutable web snapshot
`web/src/data/oeclAstExamples.json`. Server validation rejects any change
to the canonical snapshot JSON without a corresponding audited update:

- SHA-256: `93c27209e59493996106305f1652f106e51db8aa24ae7e3ae2d99c8fbd02f978`
- Source workflow SHA: `8ca66ecf07522a1ca2b33da20635249147f3a0db`
- CI run: `44968168041`

`GET /api/scientific/source-views?sourceA=ERC-8060&sourceB=ERC-8098`
serves one verified example with no GitHub credential requirement. A registered
pair without a precomputed example gets HTTP 404 and `NOT_EVALUATED`;
this is not incompatibility.

## User experience

`GenericSourceLabLauncher` offers the registered source dropdowns,
an **Explore verified AST example** action, and a separate authenticated
**Analyze selected pair** action if a deployed worker is available.

`ScientificAstGraphExplorer` presents:

- source contracts, exported functions, inherited bases, call edges,
  state decreases, guards and modifiers
- a clickable, keyboard-accessible SVG graph with filters for calls, guards
  and source-only hypotheses
- selected node details, source unit, line number and exact source SHA-256
- source-linked hypothesis evidence and unproved constraints
- native, reproducible graph-view JSON export
- immutable GitHub Actions source evidence links and scientific limits

Dashed graph relationships are only source hypotheses, never execution
paths proven feasible in an EVM. A focused view is not the full compiler AST.

## New research jobs (not deployed publicly yet)

The existing research beta can dispatch two reviewed source profiles to
an isolated GitHub Actions worker after server credentials are configured
and the workflow is merged into the repository's default branch.

`GET /api/scientific/source-jobs/{requestId}/view?sourceA=...&sourceB=...`
loads the **actual new** ZIP archive after a confirmed successful run.
The server:

1. Rechecks access authorization and the UUID job identifier.
2. Finds the workflow run by exact request correlation and verifies the
   workflow name, project repository, source workflow SHA and main branch.
3. Retrieves only the matching GitHub Actions artifact ZIP.
4. Applies strict compressed/inflated byte, path, central-directory,
   duplicate-entry, CRC and file-count limits.
5. Matches `request.json` to the selected pair, run ID and workflow SHA.
6. Verifies the graph, source hypothesis and report SHA-256 chain.
7. Checks the compiler AST call paths, state changes and source facts
   before generating the same UI model as the fixed examples.

If any validation is inconclusive or fails, the API returns HTTP 503
`SOURCE_GRAPH_NOT_VERIFIED`. Workflow completion alone never becomes a
scientific verdict. The UI does not quietly substitute a stale example
for a failed live run.

## Verification and limitations

The web CI validates sample digest, graph edge consistency, four scenarios
including the negative control, malicious ZIP paths, CRC tampering,
production Next.js compilation, and the read-only HTTP routes.

The original source AST worker has a finite six-profile registry, with
OpenZeppelin ERC-20 Burnable explicitly labelled an extension. These are
reviewed source profiles, not arbitrary ERC repositories.

Security work required before public general access remains: replace
advisory GitHub-run limits with atomic per-user quotas, harden execution
and network isolation, review the dependency audit alerts, add persistent
verified job ownership, expiry and bundle retention. Signed/independently
replayed EVM receipts and path-feasibility proofs are **not** implemented
by this UI work.

## Next scientific milestones

1. Extend contradictory-guard/modifier/inherited-dependency analysis to
   estimate path feasibility, without treating call edges as reachable.
2. Derive explicit preconditions and tests for proposed interactions.
3. Execute separately isolated EVM experiments with real receipts, positive
   and negative controls, and reproducible source hashes.
4. Admit candidates only when the existing native scientific evaluator
   has sufficient source, constraint and EVM evidence.

The ERC-8060 × ERC-8098 full scientific result remains INCONCLUSIVE,
and none of the generic AST hypotheses is admitted.
