# OECL independent, portable quality verifier (research stage)

## Why

A server can claim that its own report is verified. That is not
independent scrutiny. The scientific quality contract in PR #44
already separates its producer from a second structural reviewer,
but both run in OECL infrastructure. This additional verifier is a
**standalone Node.js program**, with no imports from OECL application
or server modules, that a researcher or external agent can execute
on independently obtained JSON files.

It is **not** a blockchain verifier, an ENS identity, a signed
attestation, a marketplace registration or proof of universal ERC
compatibility.

## Portable API / CLI

Download the quality response and underlying source report separately:

```bash
# 1. JSON from GET /api/scientific/quality?basis=documentary&protocolA=ERC-4626&protocolB=ERC-20
#    -> quality.json
# 2. JSON from GET /api/scientific/standards-pair?protocolA=ERC-4626&protocolB=ERC-20
#    -> report.json
node web/scripts/verify-quality-artifact.mjs quality.json report.json
```

For a pinned pair:

```bash
# quality.json from GET /api/scientific/quality?basis=pinned&protocolA=ERC-8060&protocolB=ERC-8098
# report.json from GET /api/scientific/dossier?protocolA=ERC-8060&protocolB=ERC-8098
node web/scripts/verify-quality-artifact.mjs quality.json report.json
```

For stronger documentary *byte-level* consistency, supply a third
JSON file mapping each **published** standard to the raw Markdown
string collected separately:

```bash
node web/scripts/verify-quality-artifact.mjs quality.json report.json exact-raw-erc-sources.json
```

`exact-raw-erc-sources.json` has entries such as `{"ERC-20":"---\neip: 20\n..."}`.
These strings must be exact UTF-8 source text, not a summary or
reformatted copy. Their SHA-256 must match the quality envelope and
the source report, and their front matter must name the same ERC.
The program never fetches network content or grants execution
permissions. Inputs are bounded to 4 MB per JSON file and
200,000 characters per raw Markdown document.

## What an agent can independently check

The verifier independently and offline:

- Recomputes the envelope's exact SHA-256 JSON insertion-order digest;
  rejects hidden JSON properties, fabricated signatures and all
  incompatible or admitted universal verdicts.
- Recomputes the documentary planner's serialized hash, checks that
  hypotheses and falsifiers match that plan, and reconciles their
  source anchors against submitted documentary source records.
- Checks that documentary research has **no EVM receipts**, no
  execution authority and no new implementation-verification claim.
- Optionally checks the exact supplied published ERC Markdown bytes
  and front-matter identifiers, without claiming the origin is
  authenticated.
- For ERC-8060 × ERC-8098 specifically, checks the submitted archived
  dossier against the **hardcoded trusted snapshot hash**
  `9cfb5bbd4bf0b98a424827a13057507d5ef3f3ea3e30e256eb9cc8cdf2ef13a6`,
  then checks archived evidence references, all untested threats,
  source revisions, and the local chain-31337 transaction reference.
- Does **not** import the original contract builder or its
  `oeclScientificQualityReviewer` module; it also ignores any
  server-supplied `review.accepted` field.
- Exits with status 1 when the reconciled claims do not match.

If the checks pass, the result status is
`CONSISTENT_WITH_PROVIDED_EVIDENCE`. This is deliberately narrower
than `PROVEN`. It emits the exact `verificationTier`:
`DOCUMENTARY_RECONCILIATION_ONLY`,
`SUBMITTED_RAW_DOCUMENT_BYTES_MATCHED`, or
`KNOWN_PINNED_ARCHIVE_SNAPSHOT_MATCHED`.

## Trust boundary: the verifier must be falsifiable too

**Self-consistency is not independent authentication.** If both
`quality.json` and `report.json` come from one compromised server,
they may agree with each other despite being false. The optional raw
files prove exact submitted bytes, not that the bytes came from the
canonical Ethereum ERC repository. A third-party user must acquire
and authenticate the upstream material through their own trust
channel and use a reviewed, pinned version of this verifier.

For the pinned EVM report, matching the hardcoded historical dossier
does not make the original local transaction verifiable on a public
Ethereum chain. The original chain was ephemeral. The portable
reviewer does not compile Solidity, run Hardhat, check signed receipts
against canonical blocks, or independently replay the EVM.
It therefore always emits:
`evidenceReexecuted=false`,
`remoteSourceOriginAuthenticated=false`,
`downloadedFromServerTrusted=false`,
`scientificClaimsPromoted=false`,
`compatibilityVerdict=NOT_EVALUATED`,
`candidateAdmission=NOT_ADMITTED`.

This is exactly the kind of evidence separation OECL needs before
offering research to other autonomous agents.

## CI and security tests

The independent test in
`web/scripts/check-portable-scientific-quality.mjs` runs the
verifier against real pinned dossier data and a synthetic
documentary source-plan fixture, then tries **29 tampered inputs**
including self-rehashed unsupported conclusions, added signature
claims, fake EVM transactions, altered source hashes, hidden
adversarial unknowns and a changed raw document. It also runs the
real CLI as a separate Node process and expects a nonzero exit
for corrupted source content.

This test is required by the existing production-web CI.
The implementation is a **new stacked PR on #44**, and will not
publish #43's unmerged Solmate program or its ephemeral EVM receipts.
After the base contract lands and the upstream source-bound planner
has passed normal dependency review, a future bridge can use this
portable boundary to audit proposed experiments before any local
EVM authorization.
