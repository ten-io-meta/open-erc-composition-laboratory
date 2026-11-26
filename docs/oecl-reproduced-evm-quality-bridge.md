# OECL scoped two-EVM reproduction → scientific quality contract bridge

## Scientific aim

Our objective is not to say that a good-looking AI report proves compatibility.
We want a user and another agent to know **exactly what was hypothesized,
what was observed on the EVM, what a second runner reproduced and what the
evidence cannot support**.

This PR connects a **real existing independently repeated local-EVM experiment**
from draft PR #47 with the **five-pillar documentary quality contract and
epistemic claim ledger** from draft PR #46. It does NOT merge either upstream
stack or overwrite the documentary pair's conclusion.

## Original evidence and pinned archive

Source experiment: [GitHub Actions run 45901609187](https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/45901609187), reviewed source commit
`c7fb535fba976488f3a0c24dba2b700b5938dbfd`.

The original run executed the same preregistered program twice **in two
different GitHub Actions jobs with separately written EVM executors**.
It compiled pinned OpenZeppelin 4.9.6 and pinned Solmate ERC-4626,
then deployed test fixtures in ephemeral Hardhat chain 31337.

| Fixed fixture | OpenZeppelin | Solmate |
|---|---:|---:|
| Minted test ERC-20 underlying | 100 | 100 |
| Deposited into new vault | 40 | 40 |
| Direct underlying donation | 2 | 2 |
| Underlying withdrawn | 21 | 21 |
| Shares burned | **21** | **20** |
| Shares remaining | 19 | 20 |
| Underlying remaining in vault | 21 | 21 |

For **each execution**: 14 mined transactions (including four deployments),
plus six unmined `eth_call` controls (four revert, two success).
The combined experiment therefore generated **28 mined receipts and
12 unmined controls**.

A real falsifiable null hypothesis —
`EQUAL_BURNED_SHARES_UNDER_EQUAL_ASSET_INTERVENTION` — was refuted
under this exact pair of local fixture implementations. This is a
**source-specific, scenario-specific difference in rounding**, not
proof that either library violates ERC-4626 or that its ERC-20
integration is unsafe.

The pinned archive includes:
- Proposal digest `bc7c0474f659057b1e3854d25f90ff47141805655c827c74837b032143532e74`
- Original-witness JSON semantic SHA-256
  `eab4261ed3c206460b2b48c8f838035f8032107b914bc2dee8cbd8d408e53271`
- Second-witness JSON semantic SHA-256
  `4b92ed5d276786d4b54b93f9554fb4797746844bc36ce3ebe7730caffc2c694f`
- Independent comparison JSON semantic SHA-256
  `13b5ae18135a56ecf66a0b5b849eb634561669b7e123ee6bcc67d951721ba809`

Here **semantic SHA-256** is precisely `SHA-256(JSON.stringify(parsedJson))`
with JavaScript insertion order. This is neither RFC 8785 canonical JSON
nor a cryptographic signature. It is different from hashing the raw
pretty-printed source files as UTF-8.

GitHub Actions artifact identifiers are `15155408982` for proposal +
original EVM witness, and `15155722505` for independent EVM witness +
comparison. **They can expire**; the workflow here re-executes both
experiments on a fresh pair of CI workers to keep the scientific result
reproducible even after that original archive is no longer available.

## Connection to the existing five-pillar quality contract

The **existing** `OECL_SCIENTIFIC_QUALITY_CONTRACT_V1` and
`OECL_SCIENTIFIC_CLAIM_LEDGER_V1` remain unchanged. For the selected
ERC-4626 × ERC-20 documentary pair they still state:
`experiment.status=NOT_EXECUTED`,
`scientificVerdict=NOT_EVALUATED`,
`claimLedger.observations=[]`,
`claimLedger.conclusion.status=NOT_EVALUATED`.

The new separately versioned
`OECL_SCIENTIFIC_REPRODUCTION_ADDENDUM_V1`
is linked to the current documentary contract hash and claim ledger hash.
It **cannot substitute** for them. It identifies a different question:
a comparison of **two ERC-4626 implementations** with an ERC-20 underlying,
not a general standard composition or compatibility proof.

The addendum has the same five epistemic responsibilities:
- **Investigate:** exact equal-share-burn null hypothesis and falsifier,
  pinned model/ABI provenance and automatic *parameter* search
- **Challenge:** separately repeated revert and successful simulated controls
- **Experiment:** two local EVM CI executions, 28 mined receipts,
  12 unmined controls, Hardhat 31337, same engine and compiler
- **Demonstrate:** scoped 21-versus-20 shares, exact source CI/artifact hashes,
  archive references and evidence-review tier
- **Recognize limits:** `INCONCLUSIVE` overall,
  `NOT_EVALUATED` compatibility, `NOT_ADMITTED` candidate,
  no real-world impact/security certification, no public consensus
  verification, no externally authenticated upstream source origin.

## Independent verification of the *complete* witness

The standalone, dependency-free script
`web/scripts/verify-vault-reproduction.mjs` reads the **four raw JSON
artifacts** and rebuilds the program's custody/share accounting, mined
receipt status, typed ERC-20/ERC-4626 event effects, negative/positive
`eth_call` control outcomes, runtime code identity, source provenance,
and matching second-run economic transitions.

Example, after extracting the two original Actions artifact ZIPs:

```bash
node web/scripts/verify-vault-reproduction.mjs \
  original/autogenerated-counterexample-proposal.json \
  original/autogenerated-counterexample-witness.json \
  second/independent-second-evm-witness.json \
  reconciliation/cross-run-scientific-reconciliation.json \
  historical
```

For **fresh** matching CI evidence use `fresh` instead of
`historical`. This explicitly does **not** query the terminated Hardhat
chain, inspect authenticated live Ethereum consensus, or establish
that a forged collection of mutually consistent JSON was actually
mined. The two trusted source-checked GitHub CI runners are the
execution provenance, not the hash algorithm.

The web read-only adapter **does not load old receipts and replay them
on every GET request**. Its separate structural reviewer compares
the addendum to pinned archive metadata and to the independently
reviewed documentary parent. Therefore the web record says
`receiptBytesIndependentlyVerifiedByThisWebRequest=false`,
`reexecutedByThisWebRequest=false`. Agents can inspect the original
archive and run the separate validator themselves.

## Continuous scientific reproduction

The new `OECL Reproduced EVM Scientific Quality Bridge` CI workflow
always creates new evidence without depending on the expiration of
run 45901609187:

1. CI job 1 checks out the **fixed #47 source commit** and locked
   Solidity origins, regenerates the candidate, and mines the
   first local EVM witness.
2. CI job 2 starts on **another worker**, recompiles the locked
   sources and mines another 14 receipts under a separate CI-only
   reviewed policy gate.
3. CI job 3 reconstructs both full witnesses using the existing
   third-program comparator, then runs **a new portable independent
   witness auditor** and a test that rejects **55 tampered source,
   receipt, control, ledger and verdict cases**.
4. The separate production web CI verifies the five-pillar addendum,
   with **45 rehashed fake addenda rejected**, and checks Next.js
   production, API download/digest verification and real browser display.

No user wallet, arbitrary Solidity, live RPC, new execution permission,
ENS name, Agentic Markets registration, token issuance outside local
fixtures, or automatic admission is added.

## API and browser behavior

For documentary `ERC-4626` and `ERC-20` only, the existing
`/api/scientific/standards-pair` and
`/api/scientific/quality?basis=documentary` include
`reproductionAddendum` and `independentReproductionReview`
**in addition to**, never instead of, the original
`qualityContract` and `claimLedger`. The response header
`X-OECL-Reproduction-SHA256` provides the addendum digest.

`/api/scientific/quality/verify` now optionally accepts
`reproductionSha256`. The server reconstructs all source-backed
parents and the pinned addendum, returning HTTP **409** if the
submitted digest does not match.

The main selector shows a clearly separated observation section
with the implementation names and 21/20 share effects, but keeps the
documentary status visibly unexecuted. Other ERC pairs never receive
this unrelated reproduction evidence.

## Release dependencies

This PR stacks on #46, itself on #45 and #44. It also references
**fixed, unmerged** implementation research source at PR #47, which
depends on #43 → #42 → #41 → #40 → #39.

CI may be green while all upstream stacks remain drafts. The user
reviews/merges them personally. A human security/source-license
review (particularly Solmate AGPL-3.0-only) is still necessary.
No GitHub comments or merge decisions are made on behalf of the user.

**Scientific conclusion:** one scoped null hypothesis is refuted by
two local EVM executions, but compatibility, universal safety and
market utility remain unproven.
