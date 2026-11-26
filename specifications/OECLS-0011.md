# OECLS-0011 — Emergent Scientific Discovery Admission

Status: Draft
Version: 0.1
Type: OECL scientific methodology proposal
Scope: Two or more ERC/protocol participants, without favoring any standard

---

## 1. Purpose and continuity

OECL was created to investigate systemic properties arising from the composition of Ethereum standards, not merely whether two contracts can be called together. This proposal defines the minimum evidence needed to announce a **scoped emergent property** honestly and reproducibly.

It extends the open, protocol-neutral experimental principles of OECLS-0001, the observation-only experiment model of OECLS-0003, the composition framework of OECLS-0007, and the community review process of OECLS-0010. It does not retroactively change any of them.

**An experiment observes; a scientific assessment interprets evidence.** The assessment MUST NOT rewrite source observations, transaction receipts, or earlier findings to obtain a desired result.

This is a proposed admission standard, **not** a claim that OECL has already discovered or demonstrated a novel emergent property. It is not an official Ethereum ERC/EIP, a security certification, a declaration of cross-ERC compatibility, or an authorization to deploy contracts.

## 2. Operational definition

A candidate emergent property P is a precisely defined systemic behavior or invariant of a composition C involving two or more identifiable participants, for which OECL proposes a specific cross-participant mechanism M.

For a **scoped emergence** claim, the evidence must support all of the following:

- P is observable or formally decidable under stated assumptions, with a test or proof that could challenge the claim.
- The behavior is not adequately explained by each participant acting separately, their mere coexistence, a generic feature of the EVM, or behavior injected by a test coordinator.
- The identified interaction M makes a causal difference to P in controlled counterfactuals, or an equivalently discriminating formal analysis when a physical ablation is not meaningful.
- The result is independently checked and its exact limitations are retained.

An observed conjunction of existing functions, shared inheritance, same-transaction execution, a passing call, or a high confidence score is **not** sufficient by itself. The researcher need not prove philosophical or absolute computational irreducibility. The burden is to rule out plausible simpler explanations **within the published scope**.

Emergence may be beneficial, harmful, neutral, conditional, or fragile. Financial usefulness never determines whether a scientific claim passes.

## 3. Seven mandatory admission gates

An announcement of **SCOPED_EMERGENCE_SUPPORTED** requires all seven gates to pass for the same claim identity, source revisions, context, and mechanism. A gate with absent or unverifiable evidence remains **UNRESOLVED**, never implicitly passed.

### G1 — Defined property and falsifier

Record the participating roles, the property P, its units and observable predicate, initial state, environment, scope, and conditions. Specify at least one observation or logical countermodel that would refute the precise claim.

A vague label such as "synergy", "compatible", or "secure" is not a property definition.

### G2 — Hypothesis origin and prospective design

Record whether the hypothesis originated from a human, OECL's machine process, or joint work. Preserve source inputs, rule/model or engine version, search/selection trail, prior failures, and a time-ordered hypothesis record.

Exploratory observations may generate hypotheses, but any confirmatory experiment MUST use a separately preregistered prediction, conditions, controls, and falsifier before its confirmatory observations are produced. Never call a post-hoc fit a prospective prediction.

Machine-origin credit requires a timestamped or commit-pinned machine proposal generated before the confirmation, without a pair-specific human-coded expected answer. Using a bounded deterministic rule is valid but must be disclosed as such. A human-proposed property proved by OECL remains a valid scientific result, **not** an autonomous machine discovery.

### G3 — Non-triviality and competing explanations

Compare P against separate participant baselines and the non-interacting combination wherever meaningful. Identify and challenge simpler mechanisms: inherited behavior, common infrastructure, generic Ethereum transaction atomicity, prior adapter behavior, external scripts, fixtures, or shared dependencies.

If the complete effect comes from a generic coordinator or already-known environment property, classify it accordingly. Do not attribute it to the convergence of the named ERC standards.

### G4 — Mechanism and participant contribution

Trace the smallest currently justified cross-participant mechanism M: relevant interfaces, state transitions, authorization roles, units, ordering, dependencies, and invariants. For each required participant, identify what it contributes and why that contribution matters.

Separate official **specification** requirements from one concrete **Solidity implementation**, test wrappers, adapters, and EVM observations. A behavior of one pinned implementation is not automatically a property of all conforming implementations or of the ERC specification.

### G5 — Causal contrasts and ablation

Design discriminating contrasts appropriate to the scientific claim:

1. A alone, in a meaningful equivalent context.
2. B alone, in a meaningful equivalent context.
3. A and B present but not cross-interacting.
4. A and B interacting through the proposed mechanism M.
5. Selective ablation of M, keeping unrelated conditions comparable.
6. Restoration of M when feasible, checking whether the predicted effect returns.
7. A generic coordinator/adapter or environment control to test whether that component alone explains P.

For N participants, extend the contrasts to the indispensable roles rather than assuming pairwise findings prove a global N-party property.

A single successful joint transaction is not a causal contrast. If an isolated control is logically undefined, or selective ablation is infeasible, explicitly explain why and supply an alternative formal counterfactual or other equally discriminating evidence. Otherwise G5 remains UNRESOLVED. Do not destroy the surrounding environment and call the resulting failure a selective ablation.

### G6 — Independent, appropriate demonstration

Select evidence appropriate to the claim: reproducible formal proof for a mathematical property; independently verifiable source/ABI/AST evidence for a source claim; and concrete state transitions plus execution evidence for a claim about EVM behavior.

For EVM behavior: pin implementation bytes and dependencies, compiler settings, deployment/code identity, network or local chain ID, caller/role setup, arguments, pre/post state, events, gas/rollback constraints, positive and adversarial controls, and transaction or call identities. Distinguish mined receipts, unmined simulations, and static checks. A local Hardhat receipt is not a mainnet Ethereum observation.

An independent checker must reconstruct the relevant evidence or repeat the experiment via a separately implemented verification path. Rehashing the producing system's JSON, re-reading its claimed verdict, or replaying its arithmetic without authenticating its inputs is not sufficient to claim full independent replication. Disclose exactly what the second checker did and did not reproduce.

A proof or EVM run supports only the tested assumptions and versions. A passing test never constitutes a universal security or compatibility certification.

### G7 — Scope, prior knowledge, and attribution

Record what is supported, which alternatives remain open, applicable implementation versions, and whether the effect generalizes beyond the tested configuration. Search and cite relevant prior art before claiming novelty to the wider community. Failure to find an earlier publication is **not** proof of worldwide novelty.

Distinguish "newly found in the OECL corpus", "reproduced known behavior", and "apparently novel subject to community review". Respect authorship, upstream licenses, and contributor attribution. Publication of an OECL finding never transfers ownership of an ERC, a third-party implementation, or another researcher's work.

## 4. Scientific outcome and discovery attribution are separate

Proposed **emergence assessment** categories (not existing production enum values):

- **HYPOTHESIS_PROPOSED** — falsifiable proposal; no claim of observation.
- **EMERGENCE_CANDIDATE** — specific mechanism and discriminating protocol designed.
- **SCOPED_EFFECT_OBSERVED** — relevant effect measured, but causal/independent gates incomplete.
- **SCOPED_EMERGENCE_SUPPORTED** — G1–G7 supported by scoped, independently verified evidence.
- **CHALLENGED_OR_REFUTED_WITHIN_SCOPE** — a valid counterexample or contradiction under specified assumptions.
- **INCONCLUSIVE** — inadequate or conflicting evidence; no absence-of-emergence conclusion.

Proposed **hypothesis-origin** labels: **HUMAN_PROPOSED**, **OECL_MACHINE_PROPOSED**, and **HYBRID_PROPOSED**, supported by provenance rather than marketing descriptions.

An OECL machine-proposed hypothesis can earn a supported scoped emergence verdict without proving unconstrained machine autonomy. A human-proposed hypothesis can earn the same scientific verdict without being credited as machine-origin discovery. Neither axis may be inferred from the other.

A logically demonstrated incompatibility or impossibility is a valuable **CONDITIONAL_IMPOSSIBILITY_FINDING**, with named assumptions, countermodels and scope. It belongs in the research catalog but is not mislabeled as an observed emergent property.

Keep **composition candidate admission**, **compatibility verdict**, **research-source corroboration**, **runtime observation**, and **emergence assessment** as distinct epistemic dimensions. No new state may overwrite historical OECL verdicts.

## 5. Minimum discovery dossier

Each announced claim must reference a versioned, append-only evidence dossier containing:

- Claim ID, candidate property P, participants and roles, mechanism M, predicate, scope, unit and assumptions.
- Exact ERC specification revisions and separately identified implementation/adapter/runner sources, hashes, dependencies and toolchains.
- Hypothesis origin, actual machine/human contribution, search log, timestamp or commit provenance, and confirmatory preregistration.
- Seven individually assessed gates, with rationale, independent evidence IDs, missing controls and counterevidence.
- Baselines, joint interaction, non-interacting control, ablation, restoration and coordinator-control results or justified equivalent tests.
- Verifiable raw measurements or proof artifacts, positive and negative/adversarial tests, independent checker procedure and its actual scope.
- Alternative explanations, prior-art references, unresolved threats, uncertainty, attempted refutations and follow-up questions.
- A separately stated **practical value** assessment (safety, cost, interoperability, risk or new functionality), which cannot alter scientific admission.
- Publication rights, redactions, upstream attribution, and a reproducibility statement limited to what can genuinely be disclosed and checked.

Corrections and contrary evidence create new linked versions; do not silently rewrite the original observation, hypothesis origin, or experiment ID. Confidential client material is not copied to public GitHub or CI. If confidentiality prevents independent verification of a claim, report that limitation and do not claim public reproducibility.

## 6. Falsification and non-promotion examples

An independent gate implementation MUST reject these promotion attempts:

- A shared successful EVM transaction is called "emergent" without participant baselines, a causal mechanism and controlled contrasts.
- A property supplied entirely by an auxiliary coordinator is credited to two ERCs without ruling out the coordinator-only explanation.
- A positive observation is selected first and the supposed prediction is recorded afterward as if preregistered.
- A source AST call edge or shared inheritance is called an executable or universal behavior.
- A locally verified, pinned implementation result is projected onto all implementations of the ERC.
- A repeatedly counted source or a self-authored JSON hash is represented as an independent replication.
- Missing EVM evidence or a zero-hypothesis result is interpreted as proof of incompatibility or impossibility.
- A prior known technique or generic atomicity is advertised as a newly discovered cross-ERC property.
- A new research classification changes V2.1 compatibility/admission outcomes without their established evidence gates.
- A confidential or inaccessible record is described as publicly reproducible despite missing independent verification.

Conversely, the framework MUST permit well-scoped hypotheses without EVM execution, legitimate negative results, independently checked formal impossibility findings in their separate class, and human-origin discoveries with truthful attribution.

## 7. Current status and safe implementation sequence

**Status at proposal:** NO FIRST EMERGENT DISCOVERY IS ADMITTED BY THIS SPECIFICATION. Existing OECL pinned local EVM experiments, documentary catalogs, AST findings, synthetic controls and historical V2.1 conclusions retain their original scientific status and value.

Acceptance sequence after community review:

1. Ratify or revise this methodological proposal through the ordinary OECLS draft/review process.
2. Add a standalone, fail-closed admission assessor with typed evidence references and adversarial tests; do not replace the existing hypothesis, compatibility, memory or EVM engines.
3. Connect it to the current evidence graph and independent source/EVM reviewers without giving any presentation layer authority to promote findings.
4. Run a prospective, unbiased search across a declared corpus; preserve candidates, misses and failed attempts before registering confirmatory experiments.
5. Test the first candidate with controls, selective causal interventions, independent repetition and a public dossier; announce only the supported scope.

Until these steps exist and pass review, no UI, API, report, agent, or marketing material may imply OECL has already met this proposed first-discovery threshold. This proposal itself does not enable user-supplied Solidity execution, third-party funds custody, signing, wallets, arbitrary RPC endpoints, or production contract deployment.

Open scientific methods and appropriately releasable evidence support community adoption. Optional paid research, hosting, integration and support may sustain OECL, but financial interest is not scientific evidence, never overrides the gates, and does not confer ownership of upstream standards or contributors' research.

## References within OECL

- OECLS-0001 — Open ERC Composition Laboratory Specification.
- OECLS-0003 — Experiment Model.
- OECLS-0007 — Composition Framework Specification.
- OECLS-0010 — Governance Specification.
- docs/OECL-V1-ARCHITECTURE.md — early property discovery, hypotheses and research memory.
- docs/OECL-V2-ARCHITECTURE.md — deterministic, falsifiable external-source research.
- docs/v2.1-quality-pass/A1-real-scientific-controls.md — evidence before verdict; no forced positive result.
- docs/reviews/pr9-final-security-evidence-review.md — observed joint local behavior is not yet a proven emergent property.
