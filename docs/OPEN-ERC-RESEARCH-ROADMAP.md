# OECL: open ERC discovery and evidence-scoped composition research (phase 1)

**Research contract:** The objective is to study arbitrary ERC compositions, discover candidate emergent properties, run reproducible joint experiments, and establish precisely which participant boundaries hold. **No standard, including ERC-8060, has priority.** This PR adds a public documentary source-index and web workbench, **not an assertion that the full scientific goal is finished**.

## Data origins

- Official primary standard source: [ethereum/ERCs](https://github.com/ethereum/ERCs), `master/ERCS/erc-*.md`. The sync clones at one Git revision, records the immutable commit hash, and pins every ERC's source URL. Metadata: title, status, abstract, `requires`, and distinct plain-text mentions.
- Bare numeric `requires` references are classified as an `ERC-<number>` only when that number has an official ERC document in this pinned corpus. Otherwise the index records `REF-<number>-UNCLASSIFIED` rather than pretending a core EIP or unpublished proposal is an ERC.
- Source status **must be shown**. A Draft or Stagnant ERC is not Final. A proposal absent from the official repo may still exist on GitHub, Magicians, as a pending PR, or as a separate interface. Absence is *not* incompatibility.
- Secondary discourse: [Ethereum Magicians](https://ethereum-magicians.org). Each ERC `discussions-to` link is preserved. The scheduled/bounded catalog attempts only two recent Discourse topic-list pages, and the pair API optionally reads the first post of up to two linked topics. Any failure is recorded as `UNAVAILABLE`. Topic titles or statements are not proof of contract behavior.
- Existing scientific results: `web/src/data/scientificPairCatalog.json` remains an **unchanged frozen baseline**. The new pair endpoint displays its existing polarity/Harmony/value only for an *exact pair already present*. No documentary reference, similarity or forum opinion creates `SUPPORT` or `EMERGENT_PROPERTY`.

## Entry points

- `node scripts/sync-public-erc-corpus.mjs --erc-root /tmp/oecl-official-ERCs --output web/src/data/publicErcCorpus.json --magicians-pages 2`
- `node --test tests/public-erc-corpus.test.mjs`
- `GET /api/research/erc?q=...&limit=24` — search official catalog.
- `GET /api/research/pair?left=ERC-721&right=ERC-8004` — compare standard declarations, discussion links, materialized scientific scope and explicit test questions.
- `web/src/components/ErcResearchExplorer.tsx` — searchable/selectable research user interface.
- `.github/workflows/public-erc-corpus.yml` — fetch/validate snapshot, test web and commit back **only to the review branch**, never main.

## Important remaining gaps

1. The *entire official ERC markdown collection* is ingested when the corpus job succeeds. This does **not** mean all GitHub ERC proposals, rejected/unmerged PRs, independent implementations or Magicians thread histories have been indexed. Those require separately sourced, paginated and rate-limited acquisition with provenance and permission checks.
2. The current forum index covers only a bounded recent sample, plus direct standards-linked posts fetched on demand. Broad historical Magicians ingestion still needs incremental/paginated snapshotting.
3. The current web route is a documentary inspection aid, **not a new runtime joint-execution pipeline**. To claim new properties, feed selected pairs into OECL's existing capability graph, N-protocol solver, global boundary observations, ablation controls and evidence receipt chain.
4. For each property claim, require an independently testable hypothesis, actual positive and negative/ablation controls, immutably pinned versions and compiler settings, observed relevant boundaries and runs, adversarial traces, and a verdict of SUPPORT, CHALLENGE or INCONCLUSIVE. A discovered candidate cannot silently become compatible.
5. Do not modify frozen scientific baselines, production UI, any ERC contracts, NFT holders or onchain funds. Test this in a **draft PR** and manually review security/legibility before merging.

## Scientific honesty invariants

- `DECLARED_REQUIREMENT` means the official ERC declares `requires`; it is not implementation compatibility.
- `DOCUMENTARY_MENTION` means a standard text references another; it is not a composed system.
- `FORUM_FIRST_POST_OBSERVED` means a source post was read; it is not independently verified behavior.
- `NOT_EVALUATED` or `NOT_ESTABLISHED` means missing evidence, not incompatibility.
- `observedEmergentProperties: []` must remain empty without a linked, reproducible experiment establishing such a property.

**Long-term milestone:** extend existing scientific composition evaluation—not replace it with a generic language-model verdict—so a source-backed hypothesis is tested as a physically executed N-protocol composition with per-participant and global boundaries, plus ablation controls, then displayed with provenance and limits.
