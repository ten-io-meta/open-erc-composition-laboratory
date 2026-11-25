# OECL — first capability-derived generic local EVM experiment

## Scope and measurable claim

This increment **does not make the entire ERC corpus autonomously executable**. It provides the first narrowly safe, capability-derived protocol that accepts a pair of existing immutable registered Solidity profiles, compiles exact sources with locked solc, checks both ABIs and constructor bytecodes, and then either:

- **Preregisters** an isolated local EVM experiment for an exact, reviewed method family (\`supportsInterface(bytes4) -> bool\` with \`view\` mutability and zero-argument constructors); or
- **Blocks** execution with named capability failures such as required constructor inputs, absent reviewed read-only signature, missing/abstract bytecode or unresolved library linking.

Neither pathway treats an AST structural relation or an ABI match as compatibility evidence. No arbitrary source URLs, source uploads, user-provided test arguments, secrets, remotely supplied bytecode, mainnet RPC or public dispatch are accepted.

## Experiment chosen by source properties, not hardcoded pair-level behavior

The first reproducible fixture runs **ERC-165 × ERC-2981** from the lock-pinned OpenZeppelin 4.9.6 profiles. Both originals are marked `abstract` by OpenZeppelin, so solc cannot directly produce deployable creation bytecode. The runner handles this safely by generating SHA-256-identified **inheritance-only** concrete Solidity wrappers from the exact pinned original contracts, with no added methods, no storage initializer and no constructor arguments. A Solidity compile failure or an unsatisfied inherited constructor keeps the candidate blocked; the wrapper is not presented as the exact original contract deployment. The generic planner does not encode either standard's expected answer: it checks exact source identity, compiled ABI, constructor safety and three preregistered interface identifiers:

- \`0x01ffc9a7\`: positive control, canonical IERC165 ID;
- \`0xffffffff\`: negative control, deliberately invalid interface ID;
- \`0x2a55205a\`: bounded differentiating challenge, ERC-2981 royalties interface ID.

After the independent source-only preregistration artifact is written, the local Hardhat provider deploys each compile-verified contract **once**, checks the two mined creation transaction receipts and local code presence, and performs exactly six \`eth_call\` reads. Responses are decoded as canonical ABI booleans. A difference on the third challenge can refute the hypothesis that *the same function signature entails identical supported interfaces* for **those deployed immutable implementations**. It does not show general interoperability or universal incompatibility.

An intentionally unsupported **ERC-20 × ERC-721** pair is processed using the same planner, which must return \`BLOCKED_NO_REVIEWED_EXECUTION_CAPABILITY\` and execute no EVM: required constructor arguments and absence of the safe method are valid reasons to abstain.

## Independent reconciliation

The exact run stores a plan with compiler version, source SHA-256, registry source revision, AST graph SHA-256, source report digest, compiled ABI and creation bytecode hashes and the exact six-call budget **before** EVM deployment. A separate CI job fetches that artifact, recompiles all sources from the pinned registry in a fresh runner, regenerates the same plan and compares it byte-for-byte before accepting the archived EVM witness.

It also requires consistent response booleans and canonical ABI words, two distinct mined local deployment receipts, unmined \`eth_call\` probes, the prerequisite positive/negative controls and a source-scoped bounded difference.

**Scientific integrity:** the independent reviewer cannot independently requery a now-terminated in-memory Hardhat blockchain. Original receipts were checked against the local provider in the experiment job, while the second job checks provenance and internal consistency. These results are not mainnet attestations.

## Hard security gates

- source registry is a reviewed finite list with immutable GitHub commits and exact OpenZeppelin package version;
- source compiler uses locked Solidity 0.8.26, locked dependency integrity and bounded source acquisition;
- no dependency install scripts or unreviewed GitHub repository build scripts execute;
- read-only ABI probes only; zero-argument concrete constructor (including deterministic inheritance-only instantiation wrappers for reviewed abstract OpenZeppelin bases), linked bytecode, fixed bytecode bound, fixed number of deployments, calls and test vectors;
- ephemeral local Hardhat network ID 31337; no external RPC;
- public source dispatcher stays disabled; experimental protocol can only run inside the separate CI workflow;
- a parameter requiring a custom constructor, custom storage setup, transfers or external callbacks is a **blocked execution capability**, not an invitation to guess inputs.

The runner does not constitute a hardened no-network sandbox. CI checkout/package supply chain, parser/ABI trust, gas caps, atomic distributed user quotas, per-identity authorization, secure external source admission and human-reviewed adversarial scenarios remain release blockers for unrestricted public execution.

## What should be demonstrated next

1. Confirm this exact fixture produces two mined local creation receipts, six read-only local probes and at least one source-scoped differentiating response.
2. Keep the existing AST/EVM scientist cycles and public documentary planner unchanged until exact-head CI and independent review succeed.
3. Build a **typed constructor and role model** for other *reviewed* contract families; do not generate or run transaction sequences solely from the presence of ABI function names.
4. Only after stronger isolation, cross-run oracles and capability tests, cautiously consider opt-in execution for a larger registered cohort.

The correct claim is **a first reusable, capability-derived, preregistered local EVM runner for one safe ABI family**, not a universal ERC scientist.