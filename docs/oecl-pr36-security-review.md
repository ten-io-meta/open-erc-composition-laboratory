# OECL PR #36 — security review and scientific admission decision

Review scope: new source-only generic hypothesis planner, pinned-source compiler bridge,
CLI, second-runner reviewer, admission guard and their tests/workflow. This review
**does not** certify Solidity contracts, any EVM behavior, arbitrary ERC compatibility,
a public endpoint, or third-party independently audited security.

## Threats, mitigations and observed boundary

| Threat / failure mode | Implementation and verification | Decision |
|---|---|---|
| Unregistered or substituted Solidity | `choosePair` uses reviewed registry; locked dependency checkout; lockfile SHA-256; source byte identities rechecked against compiler AST graph | Fail-closed on missing/mismatched source |
| Fake ABI or AST digest | ABI and AST path digests computed from a single pinned solc invocation; generated planner validates those digests; independent CI rebuild compares complete dossiers | Structural research only |
| Interface declarations mistaken for implementation | Declared interface methods excluded from executable candidate lookup via compiler contract kinds | Fix validated on ERC-20 |
| Ambiguous overload or multiple affected state variables | Rejects ambiguous concrete function mapping and methods with multiple identified affected state variables | No candidate for ambiguous route |
| Unresolved compiler call, external callback, or conditional path | Recorded as uncertainty; `executionSafety=SOURCE_ONLY_REVIEW_REQUIRED` regardless of count; a reachable AST write is **not** a proof of runtime feasibility | Never authorizes execution |
| Invented mined transaction, forged witness, or raised verdict | Reviewer independently rehashes source-only hypothesis ID and AST path. Admission gate rejects claimed runtime receipts/admission and enforces `NOT_EXECUTED`, `INCONCLUSIVE`, `NOT_EVALUATED`, `NOT_ADMITTED` | No evidence promotion |
| Arbitrary contract execution, wallet, live RPC or unsafe fixture | No deployment, transaction signing, RPC, bytecode, public dispatcher or fixture creation in any of the nine changed files. CLI outputs local JSON only. | Outside PR #36 scope |
| Regression of original MISL or prior EVM experiments | Original MISL PR9, source regression, existing EVM/composition, AST matrix and web CI required green at exact head | Retain legacy safeguards |

### Reviewer independence: exact claim
The second CI job performs **fresh source compilation from a fresh dependency checkout**
and compares the complete generated report. A separate verifier rehashes the archived
scientific identifiers and enforces source-only limitations. The two jobs still run
the **same source-generation implementation** and share the same compiler version:
this establishes deterministic reconstruction, **not** independent formal verification
of Solidity semantics or authenticity of any terminated/local EVM state.

### Known residual limitations
- Graph reachability is structural, not symbolic path feasibility; a shortest call path
  may omit alternate branches, modifiers and dynamic behavior.
- All new hypotheses are restricted to reviewed, registered sources and a deliberately
  small subset of typed ABI operations. This is not arbitrary ERC support.
- Compiler, dependency checkout and CI platform form an explicit trusted computing base.
  A malicious code change to both generator and reviewer still requires human PR review.
- Input source and compiler hashes prove identity only under the trusted checkout and
  package-lock context; hashes alone do not authenticate arbitrary user submissions.
- No new EVM transaction, controls or proof is produced by this PR. Existing
  ERC-721/ERC-1155 experiments are unchanged; cross-ERC compatibility remains
  `NOT_EVALUATED`.

## Admission criteria, release gate and expected results
1. Exact PR head: all original MISL PR9, source, EVM, web/security CI successful.
2. Exact PR head: generic unit/falsification tests, locked solc compilation and fresh
   independent dossier comparison all successful.
3. Explicit source-only admission gate succeeds **only** with
   `SOURCE_ONLY_RESEARCH_ADMISSIBLE` and simultaneously
   `executionAuthorized=false`, `evmExecuted=false`,
   `candidateAdmission=NOT_ADMITTED`, `compatibilityVerdict=NOT_EVALUATED`.
4. No public dispatcher, remote RPC, arbitrary calldata, generated fixture or new
   mined witness in this PR.
5. Record reviewer findings and retain PR **draft, unmerged**, regardless of passing CI;
   separate authorization is required for subsequent fusion or new executor.

### Result and sign-off boundary
The code review and automated controls are designed to support the **narrow source-only
security boundary**. Passing this gate is neither a contract security certification nor
an authorization to execute or to merge. The GitHub CI record on the exact final commit
is the authority for pass/fail; do not copy earlier green results onto a newer commit.
