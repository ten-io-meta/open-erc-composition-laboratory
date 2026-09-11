# OECL V2 Architecture Map

## Active V2 Core

```text
Source Manifest
↓
Research Source Bundle
↓
Evidence Profile
↓
Extraction
↓
Protocol Semantics
↓
Knowledge Graph
↓
Semantic Reasoning
↓
Composability Evidence
↓
Evidence Support
↓
Research Corpus
↓
Composition Learning
↓
Hypothesis Generation
↓
Hypothesis Validation
↓
Research Knowledge Base
↓
Incremental Knowledge
↓
Research Memory
↓
Global Knowledge Merge
↓
Research Report
Active Entry Points
npm run v2
npm run corpus
npm run learning
npm run hypothesis
npm run hypothesis:v2:validate
npm run knowledge:v2
npm run knowledge:incremental
npm run memory:v2
Active V2 Directories
laboratory/source-manifest
laboratory/research-source
laboratory/evidence-profile
laboratory/extraction
laboratory/protocol-semantics
laboratory/knowledge-graph
laboratory/reasoning
laboratory/composability-evidence
laboratory/evidence-support
laboratory/corpus
laboratory/composition-learning
laboratory/hypothesis
laboratory/research-knowledge
laboratory/incremental-knowledge
laboratory/research-memory
laboratory/pipeline
Source Structure
sources/
├── manifest.json
└── research/
    ├── DOI-0001/
    │   ├── source.json
    │   ├── evidence.json
    │   └── README.md
    └── DOI-0002/
        ├── source.json
        ├── evidence.json
        └── README.md
Legacy / Compatibility Areas

These components may still be used by V1 scripts or earlier experimental flows.

laboratory/hypotheses
scripts/run-composition-hypotheses.ts
scripts/run-hypothesis-validation.ts
scripts/run-research-knowledge.ts
scripts/run-research-memory.ts

Do not delete legacy components until their dependencies are migrated or explicitly retired.

Current Core Status

OECL V2 core is functional.

The system can:

process enabled sources from sources/manifest.json
load research bundles
apply evidence quality profiles
extract protocols and capabilities
build semantic graphs
generate composability claims
support claims with experimental/statistical evidence
generate hypotheses
validate hypotheses
build research knowledge
update incremental knowledge
record research memory
merge knowledge across sources
avoid duplicate processing of already-known sources
Pending Before Scientific Scaling
Replace cloned DOI-0002 with an independent source.
Add more real research bundles.
Automate Markdown report generation.
Expand evidence quality scoring.
Audit legacy directories before V2 final tag.