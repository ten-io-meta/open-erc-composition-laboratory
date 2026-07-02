# OECL Legacy Audit

## Purpose

This document classifies existing OECL components before closing the V2 core.

No directory is deleted in this phase.

The purpose is to distinguish:

- active V2 components
- legacy V1 components
- compatibility scripts
- experimental modules
- candidates for future cleanup

---

## Active V2 Core

These directories are part of the current OECL V2 core pipeline.

- `laboratory/source-manifest`
- `laboratory/research-source`
- `laboratory/evidence-profile`
- `laboratory/extraction`
- `laboratory/protocol-semantics`
- `laboratory/knowledge-graph`
- `laboratory/reasoning`
- `laboratory/composability-evidence`
- `laboratory/evidence-support`
- `laboratory/corpus`
- `laboratory/composition-learning`
- `laboratory/hypothesis`
- `laboratory/research-knowledge`
- `laboratory/incremental-knowledge`
- `laboratory/research-memory`
- `laboratory/pipeline`

---

## Legacy V1 / Compatibility

These components may still be referenced by older scripts.

They should not be deleted until their usages are removed or migrated.

- `laboratory/hypotheses`
- `scripts/run-composition-hypotheses.ts`
- `scripts/run-hypothesis-validation.ts`
- `scripts/run-research-knowledge.ts`
- `scripts/run-research-memory.ts`

---

## Earlier Research Engines

These components were created before the V2 core pipeline.

Some may still be useful, but they are not currently part of the main V2 execution path.

- `laboratory/adaptive-research`
- `laboratory/intelligence`
- `laboratory/research-report`
- `laboratory/research-memory`  

Note: `laboratory/research-memory` is now active V2 and should not be removed.

---

## Experimental / Supporting Components

These may remain useful for future V2 or V3 work.

- `laboratory/benchmark`
- `laboratory/matrix`
- `laboratory/patterns`
- `laboratory/relationships`
- `laboratory/emergent`
- `laboratory/validation`
- `laboratory/scenario`
- `laboratory/scenario-generation`
- `laboratory/experiment`
- `laboratory/campaign`

---

## Do Not Delete Yet

Because the repository contains many generated artifacts and legacy flows, cleanup must be performed only after dependency checks.

Before removing any directory:

1. Search imports.
2. Search npm scripts.
3. Check generated result dependencies.
4. Run `npx tsc`.
5. Run `npm run v2`.
6. Commit separately.

---

## Current Decision

For V2 core closure:

- Keep all legacy directories.
- Mark old hypothesis flows as legacy.
- Use `laboratory/hypothesis` as active V2 hypothesis engine.
- Use `laboratory/research-memory` as active V2 memory engine.
- Use `npm run v2` as canonical V2 entry point.

---

## Cleanup Candidate List

To review later:

- duplicate hypothesis flows
- older knowledge scripts
- older memory scripts
- generated result folders
- unused experimental adapters