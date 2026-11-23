# OECL original scientist — evidence, falsification and security boundary

## Scientific mission (existing architecture, not a new claim)
The original V2 architecture explicitly says: deterministic research, novel composition knowledge from external sources, traceability to evidence, reproducibility, and **falsifiable hypotheses**. Machine-generated proposals cannot authoritatively change accepted knowledge.

The EVM is a test instrument, NOT the generator or sole judge of scientific explanations. A hypothesis may be soundly stated as **provisional** when execution evidence is absent; missing EVM evidence never proves incompatibility.

## End-to-end evidence trust chain
1. **Source ingress:** verify source identity, immutable revision and content SHA-256; never trust URLs and titles as implementation proof. Defend against oversized input, source substitution and prompt-like instructions embedded in scraped text.
2. **Extraction and attribution:** retain which exact source contains which claim, typed semantic role, imports, origin and revision. Reject unknown and mixed provenance. Neither repeated aliases nor duplicate copies count as independent observations.
3. **Independence:** require independently attested pairwise evidence. A previous exponential bit-mask search overflowed for >=31 sources; and input-order-dependent contradictory pair attestations could be accepted. A bounded exact-small/conservative-large algorithm now denies both and fails closed on mismatched independent-source count.
4. **Hypothesis:** derive a conditional, falsifiable research proposition from actual source patterns. Include what would refute it, alternative explanations, uncertainties, known counterevidence and provenance IDs. Do not promote by high confidence score alone.
5. **Independent research conclusion:** explicit PROVISIONAL, SOURCE_CORROBORATED, CHALLENGED and INSUFFICIENT_EVIDENCE statuses. These describe the **research claim**, not contract interoperability, source-code proof or EVM safety.
6. **EVM and constraints:** when a fixed implementation exists, test predicted behavioral invariants with positive/negative/adversarial controls, transaction hashes and independent receipt validation. A passed receipt can falsify or support only its tested scoped property; it never self-promotes candidate admission or global compatibility.
7. **Publication:** show epistemic status and compatibility verdict separately; retain untested assumptions, evidence lineage, counterfactual alternatives, latest verified revision and the limits of execution. No arbitrary-source public runner until hardened isolation, atomic quotas, identity and scoped authorization are reviewed.

## Implemented research-proof controls in PR #29

- The source independence engine is bounded and deterministic, refuses contradictory/malformed attestations, checks attested independent source count, and never uses JavaScript bit shifts for an unbounded source set.
- The upstream source-pair assessor is now also fail-closed: conflicting explicit independence/dependence declarations or declarations lacking concrete evidence IDs and a written basis yield INCONCLUSIVE instead of accepting the first record. This addresses the intake gate before set aggregation.
- The independent review engine takes historical cross-source patterns, pairwise independence attestations and contradictory claims, derives **falsifiable hypotheses** and **provisional textual conclusions**, and always emits compatibility \`NOT_EVALUATED\`, admission \`NOT_ADMITTED\` and \`evmExecuted:false\`.
- The original research corpus has **no persisted verified independence attestation matrix for its source pair**. Its sample is therefore properly PROVISIONAL, not SOURCE_CORROBORATED or ESTABLISHED. A controlled regression shows the stronger status only when an explicit independent-source attestation is supplied.
- The automated review outputs a JSON report with SHA-256 of the two original input artifacts and archives it in GitHub Actions, without deploying Vercel or running Solidity/EVM.

## Confirmed original conclusion authority boundary and mitigation

- The legacy `ResearchConclusionEngine` previously promoted any pattern object with status `SUPPORTED` and confidence >=70 to research conclusion `ESTABLISHED` without itself checking claimed source IDs, concrete evidence IDs or independent source assessments. A direct or corrupted input could falsely inflate research authority.
- The new guard defaults to `PRELIMINARY` when pairwise independence is missing or source evidence IDs are absent; explicit pairwise independence attestation across at least two sources is required for `SUPPORTED`, three for `ESTABLISHED` with a bounded confidence. An upstream error prevents conclusion emission. All these are **research-source** categories, never EVM contract interoperability proofs.
- Falsification control `check-original-research-conclusion-evidence-boundary.ts` verifies high-confidence spoofing, duplicate identities, contradictory source assessments, missing claims and malformed scores cannot claim `ESTABLISHED`. This change deliberately errs on the side of weaker conclusions when historical pipelines did not persist independent-source attestations.

## Circular hypothesis validation boundary (PR #29 extension)

In the original V2 cycle, learning-derived hypotheses and the hypothesis validator drew on the **same underlying composability evidence claims**. Previously, the validator elevated a matched source claim with confidence >=70 to `CONFIRMED`, could elevate status to `VALIDATED`, and could label hypotheses `REJECTED` merely because there was no matching source claim. Those are not independent confirmations or empirical falsifications.

- The legacy learning generator no longer marks a statistical `STABLE` relation `VALIDATED` merely because the underlying claims scored highly; it proposes `EMERGING` hypotheses awaiting fresh tests.
- The V2 correlator still records source-claim matches for useful investigation, but **never emits `CONFIRMED` or `VALIDATED` from recycled claims**. It does not raise confidence, counts unique prior claim IDs, and labels no-match as an evidence gap rather than a counterexample.
- Each validation entry now explicitly declares `verificationScope: PRIOR_SOURCE_CLAIM_CORRELATION_ONLY`, `independentlyValidated:false`, `evmExecuted:false`, `compatibilityVerdict:NOT_EVALUATED`. Existing `PARTIAL` and `UNSUPPORTED` enumeration values are retained for legacy consumers but must be interpreted with these scoped fields.
- The scientist workflow reruns the archived DOI-0001 historical hypothesis dataset, rejects any circular promotion or unobserved rejection, and archives the regenerated JSON alongside the independent research conclusion. This does **not** change, sign, execute or fabricate EVM receipts.
- Evidence useful to confirm or refute a hypothesis must be collected separately, with a documented pre-registered test, new provenance, independent source/implementation identity and a reproducible counterfactual.

## Scoped scientific predictions versus EVM measurements

A new side-effect-free `ScientificEvmHypothesisAlignmentEngine` compares a **pre-registered invariant prediction** against a numeric observation, using the existing OECL composition-constraint evaluator to recalculate the predicate from measured operands. A comparison is allowed only when candidate ID, an exact immutable source revision (40-hex Git commit or 64-hex SHA-256 source digest), constraint ID, participant side, and named scenario all match.

The comparison **never modifies an EVM observation**. If the predicted outcome and recomputed measured outcome disagree, the output records `REPORTED_MEASUREMENTS_CHALLENGE_PREDICTION`; a matching observation is `REPORTED_MEASUREMENTS_MATCH_PREDICTION`. A mismatched underlying-token versus vault-share scenario, forged verdict, missing receipt hash, or mismatched revision returns `NOT_COMPARABLE`.

**Trust boundary:** this utility checks consistency of **reported** measurements only. It does not query Ethereum or independently authenticate a tx receipt; its output always states `receiptAuthentication:NOT_PERFORMED_BY_COMPARISON_ENGINE`. Only the existing verified pinned-EVM execution/receipt chain can supply an authenticated observation. It never upgrades scientific research to an EVM or universal compatibility verdict.

## AST-originated hypothesis tested against fresh local EVM receipts — 23 November 2026

The fixed compiler source worker, **not a manually crafted positive or negative prediction**, generated two original structural hypotheses for the pinned ERC-8098 + ERC-4626 source pair:

- \`AST-HYP-2d7dcb67ee7551b470d05939\`— \`SHARED_STANDARD_INHERITANCE\`: both concrete implementations share an ERC-20 base.
- \`AST-HYP-7bb4f7ca6a8dfee4feeb62cc\` — \`POTENTIAL_COUPLED_STATE_DECREASE\`: ERC-8098 has a compiler-resolved public \`burn\` path to \`_totalSupply\` decrease, while ERC-4626 has a \`redeem\` path to \`_totalSupply\` decrease. The path feasibility model says \`NOT_PROVEN_EXECUTABLE\`, not \`EXECUTABLE\`.

A restricted, deterministic **experiment adapter** selected the latter hypothesis by its structural kind, verified the original signed-off graph, source file and path-hypothesis SHA-256s, and generated a plan **before the local test contracts were deployed**. The plan SHA-256 is:

\`5888bd5f87df31a440901f5e37944b538ffe87b71e25c1b607777dae50574991\`

The plan predicted that a successful eligible-owner operation \`redeem\` would strictly decrease vault share \`totalSupply\`, and a successful eligible-owner \`burn\` would strictly decrease ERC-8098 underlying \`totalSupply\`. Two new mined local Hardhat receipts, their blocks, function selectors and Transfer-to-zero burn events were verified against exact source revision and code hashes. Observations:

| Observed operation | Before | After | Restricted hypothesis interpretation |
| --- | ---: | ---: | --- |
| ERC-4626 \`redeem\` | 100 shares | 60 shares | Strict source-inspired state decrease observed in this fixture |
| ERC-8098 \`burn\` | 1,000 underlying | 990 underlying | Strict source-inspired state decrease observed in this fixture |

The scope remains **two separate owner-authorized EVM actions**; it does NOT prove an atomic, coupled or universally interoperable composition. Cross-checks confirmed the underlying totalSupply was unchanged by redeem, and separate vault shares totalSupply was unchanged by burning underlying.

[Source AST and local EVM run 45238186707](https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/45238186707) **PASS**. A separate same-run CI job downloaded those exact source/EVM artifacts, regenerated the AST hypothesis from the recorded graph and independently re-evaluated both measured predicates using the TypeScript scientist comparator: \`OECL_AST_GENERATED_SCIENTIST_INDEPENDENT_EVM_REPLAY_PASS\`, 2/2 scoped positive observations. That scientist comparator still declares \`receiptAuthentication: NOT_PERFORMED_BY_COMPARISON_ENGINE\`; only the upstream live local-provider workflow checked receipts and blocks.

**Scientific honesty:** this is a meaningful first **machine-generated AST hypothesis→preregistered design→EVM observation→independent scientific interpretation** pipeline, using reviewed fixed adapters. It is not autonomous unconstrained hypothesis creation, automatic EVM experiment synthesis, independent Ethereum mainnet attestation, proof of economic security or a globally compatible ERC pairing.

The original 45 registered source-profile pairings remain covered: adding ERC-8098 + ERC-4626 to the dedicated CI source list changes the matrix accounting from **9 configured + 36 remaining** to **10 configured + 35 remaining** (still 45), and shard sizes must be calculated dynamically.


## Source-generated adversarial counterexamples and epistemic refinement (23 November 2026)

The source-only AST finder produced the `POTENTIAL_COUPLED_STATE_DECREASE` hypothesis `AST-HYP-7bb4f7ca6a8dfee4feeb62cc`. **Its actual original claim** was only compiler-resolved paths from public `burn` and `redeem` to `_totalSupply` decreases, with source path feasibility `NOT_PROVEN_EXECUTABLE`. It did not claim every call must decrease supply.

The new deterministic self-falsification generator reads the compiler AST and both source-hypothesis reports, verifies source hashes and the previously registered positive experiment, then constructs **four boundary challenges before any local EVM deployment**:

- ERC-8098 `burn(0)`: a successful mined call leaves `totalSupply` unchanged. This **refutes the overly broad extrapolation** that every successful `burn` decreases supply, while not challenging the prior observed positive `burn(10)` case.
- ERC-4626 `redeem(0)`: a successful mined call leaves share `totalSupply` unchanged. This **refutes the same over-generalization** for `redeem` while not challenging the prior positive `redeem(40)` case.
- ERC-8098 burn above available caller token balance: unmined read-only EVM `callStatic` revert with tracked state unchanged. This challenges unconditional executability.
- ERC-4626 redeem above available caller share balance: unmined read-only EVM `callStatic` revert with tracked state unchanged. This also challenges unconditional executability.

New plan SHA-256 `1ce82a7a35403eaf02afe466a40f0cd937cd39d6f09a73060b1d8a751efb60fe`, bound to the previous positive-plan SHA-256 `5888bd5f87df31a440901f5e37944b538ffe87b71e25c1b607777dae50574991`. All inputs, AST path identities, source revisions and generated case IDs are retained in the artifact.

[Verified initial source/EVM workflow #45240150826](https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/45240150826) **PASS** in both independent jobs. The second job verified the archived observations, preregistered SHA-256 provenance and epistemic interpretation. It emitted `OECL_INDEPENDENT_AST_SELF_FALSIFICATION_REPLAY_PASS`: **2 zero-value mined counterexamples and 2 unmined negative reversions**. The original positive AST experiments remain supported **only in the precise tested setting**, not universally.

The scientist's independent reviewer additionally emits **conditioned revision proposals** rather than treating these results as a general vulnerability:
- A strictly positive eligible-owner invocation of each method decreased the tested token's supply in the pinned fixture.
- Successful zero-quantity invocations did not decrease it.
- Above-balance invocations reverted in read-only simulations.
- No coordinated atomic composition, hostile callback safety, proxy upgrade behavior, or general ERC compatibility is established.

**Scope warning:** this generation uses a small reviewed boundary-rule catalogue (`ZERO_AMOUNT_BOUNDARY`, `ABOVE_OWNED_BALANCE`) and a pair-specific local-EVM adapter. It is authentic machine generation from AST facts **within that finite rule set**, not unlimited autonomous security research, formal verification, or a verified exploit. It does not revise original experimental receipts or user-facing compatibility conclusions. Every refined hypothesis requires human review.


## Next scientific/security gates

- Audit all sources of the legacy \`ResearchConclusionEngine\` \`ESTABLISHED\` label and the \`HypothesisValidationEngine\` \`CONFIRMED\` label. Their heuristic/status thresholds cannot be assumed equivalent to independent experimental truth. Introduce typed challenge/corroboration receipts before any user-facing promotion.
- Add scenario-specific counterfactual hypotheses, exact provenance for implementation vs specification, and cross-run revision tracking before claiming autonomous emergent property discoveries.
- Model-theory completeness, semantic aliasing, non-canonical evidence, dependency transitivity and causal confounding remain open research areas.
- No claim of a complete independent security audit, an exploitable contract issue, or general ERC pair compatibility follows from this checkpoint.

**Release:** Keep PR #29 DRAFT stacked onto PR #28 (itself #27 -> #26). No deploy, merge, secrets or public execution. Exact-head CI and full scientific regression must pass before further integration.
