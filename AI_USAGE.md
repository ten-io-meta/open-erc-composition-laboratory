# AI Usage Disclosure

ChatGPT / OpenAI was used as a development assistant during the
ETHOnline 2026 Continuity work.

AI assistance was used for implementation support, debugging,
refactoring, test construction, UI/UX iteration, documentation,
and presentation planning for the hackathon extension.

AI-assisted work included parts of:

- The Graph live integration
- multichain chain-state verification
- EvidenceReceipt and evidence-admission implementation
- API and web UI
- deterministic test scaffolding
- ETHOnline documentation

The project author directed the OECL concept, pre-existing V2.1
scientific methodology and corpus, ERC/EIP research, architecture,
evidence boundaries, protocol interpretation, validation strategy,
and final acceptance or rejection of changes.

All AI-assisted changes were executed, inspected and validated by
the author.

AI is not part of OECL's scientific decision path in this submission.

Evidence admission is deterministic:

- matching observer and chain witness -> ADMISSIBLE
- observed contradiction -> REJECTED
- unavailable evidence -> INCOMPLETE