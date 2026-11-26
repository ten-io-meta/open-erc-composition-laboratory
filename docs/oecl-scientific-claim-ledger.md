# Scientific claim ledger: hypotheses, observations, conclusions and actual utility

This increment turns **"no hype: research others can question and verify"**
into strict contract and verifier behavior in OECL's main scientific flow.

## Three noninterchangeable scientific levels

A companion `OECL_SCIENTIFIC_CLAIM_LEDGER_V1` is emitted next to
`OECL_SCIENTIFIC_QUALITY_CONTRACT_V1` without changing the latter's
strict v1 schema or breaking its existing offline verifiers.

| Class | Documentary pair | Existing pinned ERC-8060 × ERC-8098 dossier |
|---|---|---|
| **HYPOTHESIS** | Source-anchored and falsifiable, **not executed** | Source-derived, not proven by one experiment |
| **OBSERVATION** | **No observations**, no receipts | **One historical local Hardhat transaction**, bounded numeric measures and artifact hashes; **not independently replayed by this verifier** |
| **CONCLUSION** | **NOT_EVALUATED** | **INCONCLUSIVE** about broader compatibility and security |
| **USEFULNESS** | **NOT_YET_DEMONSTRATED** | **SCOPED_REVIEWABLE_FINDING_ONLY**, no verified external impact |

These categories do not inherit the confidence of the next category.
A compiled AST hypothesis does not become an EVM observation.
An EVM receipt in an archived local run does not automatically become
an independently replicated experiment, a proof of universal
interoperability, a security certification or a profitable product.

The local EVM observation is bound to the **original** pinned
ERC-8060 × ERC-8098 archive, the original source and quality hashes,
the one historical transaction hash and the exact measured values.
The untested threat classes remain explicit. This is **not** a
new experiment or a replay.

## Prove usefulness, don't count hypotheses

The accompanying `utility` object has **no score**:
`score=null`, `countingHypothesesIsEvidence=false`,
`demonstratedExternalImpact=false`, `securityCertification=false`.

A documentary hypothesis has the limited practical use of identifying
**preconditions and falsification controls for a future study**.
A pinned local observation can help a reviewer inspect a **scoped
atomicity/rollback scenario**, and only that scenario. Neither
proves practical impact on real deployments or end-user safety.

The scientific upgrade gate is evidence, not throughput: stronger
future claims require independently authenticated source revisions,
a reviewed concrete implementation, bounded preregistered EVM
experiments, independently reproducible receipt/ledger evaluation,
adversarial counterexamples and identified external applicability.
The claim ledger preserves all original unresolved items as
`missingForStrongerClaim`. No hypotheses-per-minute metric is
exposed as a scientific KPI.

## Independent verifier and anti-forgery checks

`web/src/server/oeclScientificClaimReviewer.ts` **does not import**
`oeclScientificClaimLedger.ts`. It reconstructs hypothesis IDs,
falsifiers, controls, source links, pinned local observations, ledger
conclusions and utility limits from the separately supplied source
report and quality contract, and rejects added JSON fields.

A forged issuer can recompute SHA-256 after changing a claim;
the independent reviewer still checks the altered meanings and
rejects them. The offline agent client in
`web/scripts/verify-quality-artifact.mjs` includes a **separate**
`verifyPortableClaimLedger` implementation, with no imports from
either server module. It verifies any included companion claim
ledger and reports its result, with no request to OECL's API.
For documentary reports downloaded from the public route, it
reconstructs the original source document without the response's
added quality/review fields before checking its SHA-256.

Both implementations explicitly say:
`independentEvmReplay=false`,
`externalImpactValidated=false`,
`candidateAdmission=NOT_ADMITTED` and
`compatibilityVerdict=NOT_EVALUATED`.
External source origin authentication and public-chain verification
are **not** part of this increment.

## Public integration

Existing routes (read-only):
- `GET /api/scientific/standards-pair?protocolA=ERC-4626&protocolB=ERC-20`
- `GET /api/scientific/dossier?protocolA=ERC-8060&protocolB=ERC-8098`
- `GET /api/scientific/quality?protocolA=...&protocolB=...&basis=documentary|pinned`
- `GET /api/scientific/quality/verify?protocolA=...&protocolB=...&basis=...&sha256=...&claimsSha256=...`

Responses contain both `claimLedger` and `independentClaimReview`.
`X-OECL-Claims-SHA256` is the content digest for each claim ledger.
The verification endpoint now optionally accepts `claimsSha256` and
returns **409** for a mismatching claim digest. As before, such a
mismatch can arise from changing mutable source documents, not
necessarily from malicious tampering.

The existing legacy dossier `download=1` still returns the
unmodified original dossier (compatibility with older clients).
The dedicated quality `download=1` includes the ledger for agents.
The main UI displays the three epistemic levels and a truthful
practical-use assessment beneath the five existing pillars.

## Release and reproducibility

The exact-head required web workflow runs
`node --experimental-strip-types scripts/check-scientific-claim-ledger.mjs`.
It tests the original source-only and pinned dossier cases and asks
both independent reviewers to reject **50 independently rehashed
forgery cases** involving invented observations, adjusted receipts,
forged utility claims, missing falsifiers and premature admission.
It also checks API claim digests and their 409 mismatch response
in a production Next.js server, plus browser-visible labels
in both main ERC selection journeys.

This PR is stacked on draft #45, which depends on #44. The independent
Solmate counterexample in draft PR #43 (and its parents #39–#42)
is **not** made publicly executable or asserted as a main-flow
source of new evidence here. A separate, reviewed integration can
bring #43's bounded proposals through this ledger only after
source identity, signed execution authorization and independent
EVM-receipt review are demonstrated.

No signing, live wallet, arbitrary Solidity, ENS name, payment
or autonomous agent marketplace access is added.
