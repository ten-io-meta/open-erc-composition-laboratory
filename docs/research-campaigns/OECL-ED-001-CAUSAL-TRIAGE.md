# OECL-ED-001 — Causal source triage and conditional EVM protocol

Status: POST-EXPLORATORY SOURCE REVIEW; NOT AN EMERGENCE CLAIM.
Scope: the exact 13 hypotheses actually produced by the completed prospective 35-pair screen.
Parent method: draft OECLS-0011; campaign: docs/research-campaigns/OECL-ED-001.md.

## Finding from the 13 archived compiler-AST hypotheses

The causal triage algorithm checks source report SHA-256 references, exact selected pair IDs, compiler graph and feasibility artifact digests, declared hypothesis IDs, source-unit hashes, inherited base ancestry, compiler-resolved internal CALLS edges and actual write sites. It is not a new speculative natural-language property generator.

| Original hypothesis family / source signature | Count | What OECL can truthfully say |
| --- | ---: | --- |
| Shared standard implementation ancestry | 7 | Two source profiles reuse a base contract, not a runtime cross-contract interaction |
| Offsetting decrease and increase of one state variable in the same function | 4 | The ERC-721 safeTransferFrom path reaches ERC721._transfer, which decreases sender balance and increases recipient balance; not a token-supply burn |
| Identical compiler-resolved source definition of a state decrease | 2 | Different profiles reach shared ERC20 _burn code; identical source bytes do not establish shared deployed storage |
| Authenticated cross-contract causal dependencies | 0 | No physical deployed target binding, role/unit model and selective interventions were established by these source artifacts |

**All 13 remain SOURCE_ONLY_UNEVALUATED / INCONCLUSIVE / NOT_ADMITTED.** The result is about this finite artifact corpus, not about an inability of Ethereum standards to produce emergent properties.

The selected ERC-20-BURNABLE × ERC-4626 case is still hypothesis AST-HYP-7214d7722c09498a9c45c2e8. Its two _totalSupply decreases refer to the same ERC20 base SOURCE definition. The vault ERC20 share supply and a separately deployed underlying ERC20 asset supply must not be conflated. The other same-source-definition state hypothesis is ERC-20-BURNABLE × ERC-8098: both routes reach imported ERC20 Burnable behavior; the source relation does not prove a shared ledger.

## Six source questions reviewed, not six EVM-ready protocols

| Source pair | Structural source pattern | Missing causal explanation |
| --- | --- | --- |
| ERC-20-BURNABLE × ERC-4626 | Two _burn paths in the same imported ERC20 definition | Share versus asset supply, deployable runtime asset binding, specific cross-participant trigger |
| ERC-20-BURNABLE × ERC-721 | Fungible burn and ERC721 transfer | ERC721 transfer decreases sender balance and increases recipient balance; a cross-contract dependence is not shown |
| ERC-20-BURNABLE × ERC-8098 | Both reach the same ERC20 _burn definition | Source ancestry and two independent token instances cannot be treated as emergent coupling |
| ERC-4626 × ERC-721 | ERC4626 share redemption and ERC721 transfer | Different asset classes, permissions and no demonstrated dependency |
| ERC-721 × ERC-8060 | NFT transfer and ERC8060 decrease of totalRedeemableValue | Different state quantities and missing causal binding |
| ERC-721 × ERC-8098 | NFT transfer and fungible token burn | Balance transfer is not supply destruction; no target call edge proved |

These descriptions are SOURCE interpretations. Inheritance and source-reuse observations are not discoveries of a new mechanism. The other seven inheritance questions can support a scoped conformance comparison, not a claim of emergent ERC interaction.

## Necessary experimental progression (proposed; no EVM authorized)

**A. Source/semantic gate.** For a candidate, identify concrete deployable contracts and source revisions, verified ABI selectors, identity of runtime state (NOT source variable names), units (NFT balance, ERC20 supply, shares, underlying assets, obligations), caller permissions, constructor parameters, proxies/delegation and exact recipient/callee addresses. Record an actual cross-participant causal hypothesis, or abstain.

**B. Preregister an independent confirmatory experiment.** Specify property P, scope, quantitative expected outputs, null model, falsifier, alternatives and the exact causal edge M BEFORE observing confirmatory measurements. Track what part came from bounded AST machine proposals and what was written by humans during review.

**C. Only if A and B can be independently reviewed, use an isolated EVM fixture with:**

1. Participant A alone; participant B alone, under comparable conditions;
2. A+B present but NOT interacting, with a generic coordinator-only control;
3. A+B with the PREDECLARED cross-protocol mechanism M active;
4. A selective ablation of M, keeping other conditions comparable;
5. Restoration of M when feasible, and separately tested negative/authorization/rollback cases;
6. Independent source/bytecode identity and pre/post-state/receipt reconstruction.

A failing test, an impossible causal control, or a null result must be published as a bounded negative/inconclusive finding, not reframed as a win. A coordinator making two same-transaction calls is not itself proof of emergence because generic EVM atomicity may fully explain it.

**D. OECLS-0011 admission is separate.** Even a full local receipt set cannot by itself pass all seven scientific gates, prove global ERC compatibility, or establish novelty to the research community.

### Example measurement plan, not an executable contract

For the first selected ERC-20-BURNABLE × ERC-4626 research question, a human reviewer may investigate a concrete OpenZeppelin/ERC20Burnable token as the asset of one deployed ERC4626 vault. However, it is not known from the two AST paths that anyone can burn the vault's underlying holdings. Distinguish and measure:
- asset token totalSupply and individual balance of the vault;
- vault ERC20 share totalSupply and holder shares;
- vault totalAssets and asset(), allowance/role state;
- redeem() effects versus separately authorized burn() effects;
- whether an explicit interaction beyond base vault accounting exists and persists when the proposed causal edge is selectively removed.

No adapter, burn permission, EVM receipt, quantitative prediction or property P is invented or pre-approved here. If no ERC-specific causal mechanism can be stated, the correct outcome is **NO_CAUSAL_HYPOTHESIS_READY**, not an executed test with a favorable label.

## Implementation and audit

- laboratory/scientific-causal-mechanism/ScientificCausalSourceTriage.cjs — read-only, fixed-grammar causal source screen.
- scripts/check-oecl-ed001-causal-source-triage.test.cjs — adversarial synthetic unit cases and exact archived 13-hypothesis integration tests, including graph mutation.
- .github/workflows/oecl-ed001-prospective-screen.yml — produces both the frozen source register and a separate causal-triage JSON artifact. The new step cannot authorize an EVM transaction.

Source-only hashes bind the recorded artifacts but do not authenticate external code bytes independently of the original compiler job, or prove runtime behavior. The detailed human review of the first candidate is in docs/research-campaigns/OECL-ED-001-FIRST-SEMANTIC-REVIEW.md.

This is a prototype of better **epistemic discrimination**, not a breakthrough in automatic causal discovery. Production UI/API, prior scientific memory, licensing, custody restrictions, existing receipts and legacy verdicts remain untouched.
