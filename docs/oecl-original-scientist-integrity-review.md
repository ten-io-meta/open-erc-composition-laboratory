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

## Next scientific/security gates

- Audit all sources of the legacy \`ResearchConclusionEngine\` \`ESTABLISHED\` label and the \`HypothesisValidationEngine\` \`CONFIRMED\` label. Their heuristic/status thresholds cannot be assumed equivalent to independent experimental truth. Introduce typed challenge/corroboration receipts before any user-facing promotion.
- Add scenario-specific counterfactual hypotheses, exact provenance for implementation vs specification, and cross-run revision tracking before claiming autonomous emergent property discoveries.
- Model-theory completeness, semantic aliasing, non-canonical evidence, dependency transitivity and causal confounding remain open research areas.
- No claim of a complete independent security audit, an exploitable contract issue, or general ERC pair compatibility follows from this checkpoint.

**Release:** Keep PR #29 DRAFT stacked onto PR #28 (itself #27 -> #26). No deploy, merge, secrets or public execution. Exact-head CI and full scientific regression must pass before further integration.
