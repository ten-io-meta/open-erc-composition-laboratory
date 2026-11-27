# OECL-ED-001 — First prospective, blind source-science campaign

Status: EXPERIMENT DESIGN / AWAITING CI; no scientific property admitted.
Version: 0.1
Scientific standard: proposed OECLS-0011 (Draft PR #52)
Implementation dependency: Draft PRs #53 and #54
Scope: registered, immutable Solidity source-only screening; no EVM execution or external user contracts.

## Research question

Can the existing OECL scientist independently *propose falsifiable cross-source research questions* from a predeclared, finite cohort of pinned Solidity implementations, without being given the desired answer for a particular pair?

This stage does **not** ask whether emergent behavior has been proven. It is a *screening experiment* designed to discover what OECL actually proposes, including zero-pattern outcomes, before planning a separate confirmatory trial.

## Locked cohort before observing new campaign results

The reviewed source-registry contains ten implementation profiles:
ERC-8060, ERC-8098, ERC-20, ERC-721, ERC-1155, ERC-20-BURNABLE, ERC-165, ERC-2612, ERC-2981 and ERC-4626. ERC-20-BURNABLE is an OpenZeppelin extension, **not a new ERC standard**. These profiles cover a limited selection, **not the 626-document ERC corpus**.

All GitHub source revisions in the registry are 40-hex immutable commits. OpenZeppelin sources use audited package version 4.9.6 from the registered pinned dependency fixture, with the same exact lock and Solidity compiler used by the existing source matrix workflow. No arbitrary source URL, uploading code, mainnet RPC, new contract deployment or access to third-party funds is authorized.

Exactly 45 unordered, distinct pairings are possible for ten profiles. The pre-existing source-workflow is configured for ten. For scientific independence from previous configured regression pairs, **all 35 remaining pairs** will form the prospective cohort, enumerated by registry index i < j, minus the configured pair set, sharded by index modulo 3. No pair is removed based on expected compatibility, perceived value or a preferred token protocol.

**The previous ten pairs are excluded from the *new screening* count; this is not a claim that OECL executed all 45 pairs in this campaign.**

## Frozen extraction and selection rule

The experiment runs OECL's *existing* pinned source worker and its blind scientist baseline, unmodified. The machine can emit exactly two pre-existing AST question families:

- SHARED_STANDARD_INHERITANCE — a source-level overlap and a question about actual behavioral semantics; never proof of interoperability.
- POTENTIAL_COUPLED_STATE_DECREASE — two structurally observed paths that invite a new question about state transitions; never proof of executable atomic coupling, matching units or emergent behavior.

The baseline's automatic questions, falsifiers, source revisions and unresolved feasibility flags are retained. Every pair must produce a recorded result, including **zero matches**; a zero-match row means *no match in these two bounded rules*, not incompatibility or absence of emergence.

The first human-review queue is generated only from POTENTIAL_COUPLED_STATE_DECREASE, sorted **lexicographically by canonical source-pair key and then hypothesis ID**. Other patterns remain preserved as research/control material. The first entry, if any, is proposed for human review of the **semantics and feasibility**, not for EVM execution. If there are no entries, the result is "no candidate under this rule", not a fabricated discovery.

No researcher may substitute an appealing pair after looking at the experimental outcome without publicly versioning the new selection rule and running an independent new campaign. This rule is locked in code and this document *before this PR's source matrix CI run*.

## Measures and required independent controls

The source-screen report must record:
- Exact registry content SHA-256, selection rule SHA-256 and 3 input shard SHA-256 identities.
- 35 unique attempted pairs / 45 possible pairings, ten previously configured pair identifiers (not newly audited).
- Number with patterns, number without a rule match, counts of each hypothesis kind and all source-attributed questions.
- Hypothesis source IDs, source hashes, compiler graph/hypothesis/feasibility artifact hashes and retained counterexample questions.
- Zero new EVM executions, zero accepted properties, zero certified discoveries, zero machine-origin discoveries and all existing NOT_ADMITTED / INCONCLUSIVE states.

Existing pinned source-graph and blind-autonomy validators must independently check artifacts before the aggregator may compile a register. New adversarial tests challenge reordered or duplicated pairs, missing shards, post-hoc outcome injection, forged EVM execution, false autonomy claims, digest manipulation and unsupported hypothesis types.

This is **source-file provenance**, not verification of Ethereum mainnet behavior, independent economic/security auditing or scientific proof that a property is emergent.

## Separately preregister a confirmatory trial — NOT part of this screening

Only after reviewing the blind source results, an investigator may propose a new, separately versioned protocol containing: a named P property and precise falsifier; exact implementation code and constructor/ABI/role/unit assumptions; validated mechanisms and competing explanations; a coordinator-only control; isolated and non-interacting controls; a selective causal ablation; restoration when meaningful; adversarial preconditions; verification approach; expected outputs under alternative hypotheses; and conditions that will **reject or withhold** the claim.

This confirmatory experimental plan must be committed or externally timestamp-attested **before** its new confirmatory observations are generated. Choosing a hypothesis from an exploratory screen is legitimate; describing an exploratory observation as a preregistered confirmation is not.

The new trial can then be reviewed for isolated-EVM safety, ability to execute a relevant operation, independent receipt/proof validation and cross-protocol causal interpretation. All such experiments remain **NOT AUTHORIZED** by OECL-ED-001 source screening.

## Scientific boundaries

- Hypothesis origin: **PREEXISTING RULE-BOUND AST MACHINE GENERATOR**, not a claim of unlimited AI originality.
- Scientific admission: **NO EMERGENT PROPERTY PROVEN**; any potentially interesting structural paths still need semantic validation.
- Proof by difference: a same-transaction result may be explained by generic EVM atomicity, an adapter or a purpose-built fixture; it is not enough by itself.
- Neutrality: no preference for ERCs authored by the maintainer or for commercially useful findings.
- Reproducibility: the published workflow can regenerate source artifacts from immutable profiles; CI artifacts have a retention period and are not self-authenticating external scientific proofs.
- Privacy: public CI only processes already public registered sources, source-only graphs and machine questions. No client or unpublished research memory.
- Ownership: no proprietary right is claimed over ERC standards, the underlying source authors or pre-existing discoveries.
- Commercial use: hosted research, consulting, integration and independent auditing of the *method* may sustain OECL, but a paid project cannot bypass scientific falsification.

## Reproduction and review

The dedicated GitHub Action works in three source-only shards and one aggregation job. It reuses:
- scripts/run-remaining-registered-source-pairs.cjs
- scripts/check-blind-scientist-autonomy-baseline.cjs
- scripts/check-blind-autonomy-boundary.cjs

Its new deterministic, read-only register is generated by:
- scripts/build-oecl-ed001-prospective-register.cjs

Adversarial fixtures, which are **synthetic documents and not experiment findings**:
- scripts/check-oecl-ed001-prospective-register.test.cjs

Once the initial workflow completes successfully, archive the exact report together with the workflow head revision, individual shard artifacts, any failed/empty outcomes and a review of its limitations. No promotion to OECLS-0011 G1-G7 is implied.
