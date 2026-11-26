# OECL scientific quality contract v1 — main investigation flow

## Purpose

The scientific quality contract is an **evidence boundary**, not a branding label.
Every investigation selected through OECL's public ERC selector now includes
a structured quality document, reviewed separately from its producer, answering
five questions:

1. **Investigate:** Which hypotheses are linked to identifiable original
   source snapshots, compiler material or reviewed implementation revisions?
2. **Challenge:** What specific, falsifiable observations would contradict
   each hypothesis? Which positive and negative controls exist or remain
   unexecuted?
3. **Experiment:** Did EVM execution occur or is the report documentary
   only? Are transaction hashes local, and are simulated calls kept distinct?
4. **Demonstrate:** What evidence references are available? Were those
   exact receipts independently replayed here? **No** is an acceptable,
   mandatory answer when no fresh independent replay occurred.
5. **Recognize limits:** Which source paths, adversarial cases and
   implementation assumptions are still unresolved? What is the maximum
   warranted verdict?

A researcher must never promote a conclusion on the strength of a
hash, a successful build, a structural AST hypothesis or an isolated
local-EVM transaction.

## Versioned contract schema

`OECL_SCIENTIFIC_QUALITY_CONTRACT_V1` has immutable
`basis`, `subject`, `provenance`, `investigate`, `challenge`,
`experiment`, `demonstrate`, `limits`, global verdicts and
`integrity` fields. `SHA-256(JSON.stringify(document_without_integrity))`
is bound to the exact serialized document as **insertion-order JSON**,
not a cross-language canonicalization standard or a digital signature.

The envelope **always** preserves:
`compatibilityVerdict=NOT_EVALUATED`,
`candidateAdmission=NOT_ADMITTED`,
`demonstrate.universalCompatibilityProven=false`,
`experiment.noExecutionAuthority=true`,
`experiment.evmReceiptReplayedByQualityVerifier=false`,
`demonstrate.independentlyReplayed=false`.

**Documentary** standard pairs are sourced from the existing published
ERC lookup and autonomous research planner. They retain the SHA-256
of each fetched document, but the official source URL points to
`ethereum/ERCs/master`, a **mutable** Git branch, not an immutable
Git revision. Hypotheses are `PROPOSED_NOT_EXECUTED` and there are
zero EVM transactions. Missing source documents must cause abstention,
not an assumed incompatibility. No new Solidity execution is exposed.

**Pinned EVM** quality is currently issued only for the already
verified, archived ERC-8060 × ERC-8098 dossier. It exposes the two
locked source references, referenced graph and EVM artifact hashes,
the archived local Hardhat transaction hash, observed adversarial
case IDs, **all nine untested threat classes**, and the unchanged
global `INCONCLUSIVE` verdict. It does not imply that the verifier
can query the destroyed transient Hardhat chain or prove mainnet
interoperability.

## Independent structural reviewer

`oeclScientificQualityReviewer.ts` does **not import the quality
document producer**. It rechecks the envelope integrity, original
source identifiers, exact official documentary planner outputs,
hypothesis anchors, positive and negative controls, all excluded
threat classes, evidence references, receipt scope and the
unresolved scientific limitations against **separately supplied
server-side data**.

A compromised sender could recompute SHA-256 after forging a claim.
The reviewer rejects changed claim content *even if its hash has
been recomputed*. That is why integrity hashing alone is never
sufficient to establish evidence truth.

The reviewer returns
`INDEPENDENT_STRUCTURAL_REVIEW_PASSED` only for matched source
relationships and allowed scope. It explicitly returns
`independentEvmReplay=false` and
`externalSourceBytesReverified=false`. A genuine independent
EVM replay belongs in a separate, stronger evidence tier and is not
implemented by this PR.

## Public, agent-readable entry points

Existing main flow, now fail-closed:
- `GET /api/scientific/standards-pair?protocolA=ERC-4626&protocolB=ERC-20`
  includes `qualityContract` and `independentQualityReview`.
- `GET /api/scientific/dossier?protocolA=ERC-8060&protocolB=ERC-8098`
  includes the same quality fields for the pinned local EVM dossier.
  The legacy `&download=1` route still returns its original raw
  dossier snapshot for backwards compatibility.

Dedicated machine-readable endpoints:
- `GET /api/scientific/quality?protocolA=ERC-4626&protocolB=ERC-20&basis=documentary`
- `GET /api/scientific/quality?protocolA=ERC-8060&protocolB=ERC-8098&basis=pinned`
- Add `download=1` to get the exported JSON with an attachment header.
- `GET /api/scientific/quality/verify?protocolA=ERC-8060&protocolB=ERC-8098&basis=pinned&sha256=<64-hex>`
  rebuilds the quality document from server-side source inputs and
  compares the digest in a separate reviewer. Mismatch returns HTTP
  **409** and must NOT be interpreted automatically as fraud: a
  documentary source at `master` may have changed since issuance.

Only a valid *pair of numeric ERC identifiers*, a fixed basis and
a SHA-256 digest are accepted. Endpoints are read-only and
do not accept RPC URLs, arbitrary contract code, execution requests,
API keys, agent instructions or external signing payloads.

## UX and future Agentic Markets / ENS integration

The main composition selector displays all five pillars, the
separate reviewer result, scope limitations, the evidence digest
and links to download and reconstruct the artifact.
An agent can consume exactly the same JSON without scraping the UI.

There is **no ENS identity, ERC-8004 registration, agent marketplace
payment, arbitrary runtime execution or signed agent attestation**
in this increment. ENS discovery could later bind a real agent
identity to the service, but it cannot substitute for independent
scientific evidence or magically authenticate the quality document.

## Security regression and release gate

The required web CI step
`node --experimental-strip-types scripts/check-scientific-quality-contract.mjs`
reconstructs source-backed and pinned dossiers, then rejects
**40 adversarial changes** (including self-rehashed forged claims,
false admissions, invented EVM executions, missing falsifiers,
altered document anchors, forged receipts, hidden untested threats,
and fake independent replay, and hidden forged JSON fields). Production API smoke tests verify
export, digest matching, wrong-digest HTTP 409, missing pair HTTP
404, no-store policy and backwards compatibility.

The PR is intentionally based directly on `main`, separate from
draft #39–#43; it must not automatically merge or imply those
unmerged EVM experiments are publicly available. The user alone
performs PR comments, reviews and merges.
