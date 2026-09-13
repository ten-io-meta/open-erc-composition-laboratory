# Open ERC Composition Laboratory (OECL)

**Scientific infrastructure for discovering and evaluating Ethereum standard composition.**

OECL investigates one central question:

> Which Ethereum standards can work together, what does each one contribute, and how far can composition go without violating the rules of any participant?

OECL separates **discovery** from **scientific validation**.

---

## ETHOnline 2026 Continuity Extension

OECL is a pre-existing research project. The validated V2.1 scientific baseline was frozen before ETHOnline 2026.

For continuity attribution:

- pre-hackathon baseline: `e9b5517`
- baseline tag: `oecl-v2.1-main`
- hackathon development branch: `oecl-v2.2-dev`

The following live evidence infrastructure was built during **ETHOnline 2026** on top of that baseline:

- standardized live ERC-8004 observation across Ethereum, Base, and Polygon using The Graph
- one shared GraphQL observation model across the three networks
- independent Ethereum JSON-RPC verification at the exact block indexed by The Graph
- block-hash, chain-id, registry-code, and sampled-agent ownership cross-checks
- generic protocol evidence descriptors
- ERC-165 behavioral validation before protocol identity can be accepted
- separation of source claims from independently observable on-chain evidence
- fail-closed evidence gating before interaction analysis
- explicit candidate selection: OECL does not invent or privilege a protocol pair

The core rule of this extension is:

> **Knowledge defines what to test. Ethereum determines whether the test passes.**

The Graph acts as a standardized observation layer. Ethereum is the independent witness. OECL deterministically verifies whether the available evidence is sufficient to advance.

A source claim, repository, forum discussion, or discovered relationship can guide investigation, but none of them can independently create compatibility or composition.

### Hackathon scientific boundary

During ETHOnline 2026, OECL does **not** claim that ERC-8004 and ERC-8060 are composing on mainnet.

The current live system distinguishes:

`SOURCE CLAIM -> LOCATOR -> ON-CHAIN CODE -> PROTOCOL IDENTITY -> INTERACTION ELIGIBILITY -> COMPOSITION EVALUATION`

Every transition may stop if evidence is missing or unresolved.

In particular:

- verified protocol presence is not compatibility
- shared infrastructure is not interaction
- correlation is not composition
- a source claim is not chain evidence
- no explicit candidate means no pair evaluation
- no qualifying on-chain interaction means no on-chain composition claim

This extension was implemented during the ETHOnline 2026 hackathon and is intentionally separated from the frozen V2.1 scientific baseline.

---
## Scientific Pipeline

`REAL SOURCE -> FACTS -> CONCEPTS -> PROTOCOL ATTRIBUTION`

`RELATIONS -> CONTRIBUTIONS / BARRIERS / NEEDS -> COMPOSITION FRAME`

`CROSS-PROTOCOL DISCOVERY -> COMPATIBILITY GATE -> COMPOSITION GRAPH`

`CANDIDATES / PATHS -> SCIENTIFIC EVALUATION -> EXPERIMENT / RUNTIME -> CONCLUSION`

---

## V2.1 Internal Scientific Control: ERC-8004 x ERC-8060

OECL detects that both protocols have a structural dependency on ERC-721.

- ERC-8004 -> ERC-721
- ERC-8060 -> ERC-721
- shared foundation -> ERC-721
- discovery candidate -> UNEVALUATED

A shared foundation opens a candidate. It does not prove compatibility.

The real positive control then evaluates six required scientific gates:

- qualifying composition candidate: PASS
- known relevant boundaries: PASS
- observed relevant boundaries: PASS
- no observed boundary violation: PASS
- sufficient compatibility evidence: PASS
- functional configuration evidence: PASS

**6 / 6 gates -> SUPPORTED**

This is a V2.1 candidate-scoped internal scientific control. It is not evidence of a real on-chain ERC-8004 x ERC-8060 interaction, and it is not a universal compatibility claim.

---

## Fail-Closed Uncertainty

OECL preserves uncertainty when evidence is insufficient.

Real control: ERC-8301 -> ERC-8354

- documentary evidence: 2
- known boundaries: 0
- compatibility observations: 0
- functional configurations: 0

**decision: INCONCLUSIVE**

Documentary evidence can open a candidate without manufacturing compatibility.

- discovery != compatibility
- candidate support != global support
- missing evidence != preserved boundary

---

## Scientific Outputs

### Final Scientific Report

Projects the final scientific state, candidates, compositions, evidence lineage, unresolved evidence, and polarity.

### Candidate Composition Dossier

Projects candidate kind, participants, boundaries, relevance scope, evidence gaps, compatibility state, and runtime configuration evidence.

### Why / Why Not

Turns upstream scientific reason codes and observed conditions into human-readable explanations without recalculating the decision.

### Clean Demo CLI

Consumes projected scientific outputs only.

The CLI cannot execute the solver, promote a candidate, change polarity, or invent evidence.

---

## Quick Scientific Demo

From the repository root:

`npx tsx .\scripts\check-v21-real-control-structural-foundation-runtime.ts`
`npx tsx .\scripts\check-v21-real-positive-control-decision-runtime.ts`
`npx tsx .\scripts\check-v21-real-inconclusive-control-runtime.ts`

Expected scientific behavior:

- ERC-8004 x ERC-8060 -> shared ERC-721 foundation -> UNEVALUATED at discovery
- REAL-CONTROL-POSITIVE-8004-8060 -> 6/6 gates -> SUPPORTED
- REAL-CONTROL-INCONCLUSIVE-8301-8354 -> INCONCLUSIVE

---

## V2.1 Validation

Frozen scientific implementation:

- commit: `f3f8855c467ea3966d10de362eb20af5b4318f8b`
- tag: `oecl-v2.1-final-quality-pass-validated`

- TypeScript: PASS
- full-suite passes: 206
- recovered targeted check: PASS
- unique executed checks validated: 207
- known scientific failures: 0

Four live The Graph checks remain **NOT VALIDATED** because `THE_GRAPH_API_KEY` was unavailable during final validation.

They are not represented as passing checks.

Full validation record: `docs/v2.1-quality-pass/F-final-validation.md`

---

## Challenged Control Integrity

A real CHALLENGED control was preregistered, but no qualifying real boundary violation was found in the current corpus.

OECL therefore did not manufacture a CHALLENGED result from:

- synthetic fixtures
- semantic cues
- injected observations
- missing evidence
- rejected invalid transactions

---

## Scientific Principles

- real evidence before compatibility claims
- discovery and evaluation remain separate
- no known boundary does not mean compatible
- no observed violation does not by itself prove preservation
- shared foundation does not imply functional complementarity
- pairwise support does not imply whole-composition support
- uncertainty is preserved rather than guessed away
- presentation layers cannot invent scientific state

---

## Project Status

OECL V2.1 scientific quality pass is frozen and validated.

Post-freeze work is limited to presentation and documentation layers such as README, video, and web.

Maintainer: **tenio.eth**

Validation: `docs/v2.1-quality-pass/F-final-validation.md`
Challenged-control audit: `docs/v2.1-quality-pass/A3-real-challenged-control-audit.md`

### AI-assisted development

AI tools were used as development assistants during the ETHOnline
2026 extension. They are not part of OECL's runtime scientific
decision path. See [AI_USAGE.md](./AI_USAGE.md) for the full disclosure.
