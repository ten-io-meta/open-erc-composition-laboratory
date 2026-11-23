import { CompositionWorkbench } from "@/components/CompositionWorkbench";
import { EvidenceReceiptGateway } from "@/components/EvidenceReceiptGateway";
import { ProtocolDiscovery } from "@/components/ProtocolDiscovery";
import { ScientificCorpusOverview } from "@/components/ScientificCorpusOverview";
import { ResearchDisclosure } from "@/components/ResearchDisclosure";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7faf7] text-[#1e2e25]">
      <header className="border-b border-[#dce5df] bg-white">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-4 px-5 py-5 md:px-10">
          <a href="#top" className="flex items-center gap-3" aria-label="OECL laboratory home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#174c38] text-sm font-bold text-white">OE</span>
            <span>
              <span className="block text-base font-bold tracking-[-0.03em]">OECL</span>
              <span className="block text-[10px] text-[#78897d]">Open ERC Composition Laboratory</span>
            </span>
          </a>
          <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#415c49] md:gap-6">
            <a href="#composition-workbench" className="hover:text-[#1e8c54]">Investigate</a>
            <a href="#method" className="hover:text-[#1e8c54]">Method & limits</a>
            <a href="#other-research" className="hover:text-[#1e8c54]">Other evidence</a>
            <a href="https://github.com/ten-io-meta/open-erc-composition-laboratory" target="_blank" rel="noopener noreferrer"
              className="rounded-lg border border-[#c8dacf] px-3 py-2 hover:bg-[#edf4ee]">Source code</a>
          </nav>
        </div>
      </header>

      <div id="top" className="mx-auto max-w-[1360px] px-5 pb-20 pt-9 md:px-10 md:pt-14">
        <section className="mb-8 grid items-end gap-7 lg:grid-cols-[1.6fr_.8fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[#23724e]">OECL / Scientific composition workbench</p>
            <h1 className="mt-4 max-w-4xl text-[clamp(2.3rem,5.1vw,4.8rem)] font-semibold leading-[1.08] tracking-[-0.055em]">
              Investigate how two ERC standards connect.
            </h1>
            <p className="mt-5 max-w-3xl text-[15px] leading-7 text-[#596e60] md:text-[17px]">
              Compare published ERC specifications and their declared requirements, then inspect compiler-grounded
              Solidity and EVM observations wherever audited implementations are available.
              Real evidence first. No invented compatibility verdicts.
            </p>
          </div>
          <aside className="rounded-2xl border border-[#ceded2] bg-white p-5" aria-label="Current scientific capabilities">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4a7460]">Available in this release</p>
            <ul className="mt-3 space-y-3 text-sm leading-5 text-[#3a5545]">
              <li><strong>Any published ERC pair</strong> for documented requirements</li>
              <li><strong>4</strong> reviewed AST composition examples</li>
              <li><strong>1</strong> scoped ERC-8060 × ERC-8098 dossier</li>
              <li><strong>10</strong> independent local-EVM receipts for a burnable ERC-20 example</li>
              <li><strong>0</strong> arbitrary Solidity executions enabled</li>
            </ul>
            <p className="mt-3 text-xs leading-5 text-[#7b887d]">Published specifications are document-level evidence; only pinned examples have tested Solidity and local-EVM coverage.</p>
          </aside>
        </section>

        <CompositionWorkbench />

        <section id="method" className="mt-14 scroll-mt-24 rounded-2xl border border-[#d7e3da] bg-white p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#30714f]">How to read the results</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">From source hypothesis to measured evidence</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-[#f3f8f4] p-5">
              <p className="text-xs font-semibold text-[#2d7a52]">01 · Source</p>
              <h3 className="mt-2 font-semibold">What the contracts expose</h3>
              <p className="mt-2 text-sm leading-6 text-[#607369]">Compiler-resolved functions, inherited paths, effects and restrictions. A structural match is only a hypothesis.</p>
            </div>
            <div className="rounded-xl bg-[#f3f8f4] p-5">
              <p className="text-xs font-semibold text-[#2d7a52]">02 · Execution</p>
              <h3 className="mt-2 font-semibold">What was actually tested</h3>
              <p className="mt-2 text-sm leading-6 text-[#607369]">Local transaction receipts and scoped invariants for specific pinned implementations, when available.</p>
            </div>
            <div className="rounded-xl bg-[#fff9ee] p-5">
              <p className="text-xs font-semibold text-[#92713a]">03 · Scientific verdict</p>
              <h3 className="mt-2 font-semibold">What cannot yet be claimed</h3>
              <p className="mt-2 text-sm leading-6 text-[#766852]">Unknown authorizations, alternative paths, hostile implementations, missing coverage and candidate admission blockers.</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-[#657567]">
            <strong>INCONCLUSIVE</strong> means the available evidence is insufficient to establish a general composition claim;
            it does not mean incompatible. Local <strong>SUPPORT</strong> for a tested property never certifies universal safety.
          </p>
        </section>

        <section id="other-research" className="mt-14 scroll-mt-24 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#30714f]">Additional OECL evidence services</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Related data, separate scientific questions</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#617369]">
              The following tools are available for advanced research. They do not automatically establish
              composition between your chosen ERC implementations.
            </p>
          </div>

          <ResearchDisclosure title="ERC-8004 live chain observations & EvidenceReceipts"
            description="Independent RPC witnesses and The Graph — separate from composition findings">
            <EvidenceReceiptGateway />
          </ResearchDisclosure>

          <ResearchDisclosure title="Historical scientific discovery corpus"
            description="Materialized candidates, not a newly executed pair analysis">
            <ScientificCorpusOverview />
          </ResearchDisclosure>

          <ResearchDisclosure title="Advanced protocol discovery via The Graph"
            description="Indexed protocol presence is not evidence of composability">
            <ProtocolDiscovery />
          </ResearchDisclosure>
        </section>
      </div>

      <footer className="border-t border-[#dce5df] bg-white px-5 py-7 md:px-10">
        <div className="mx-auto flex max-w-[1360px] flex-wrap justify-between gap-2 text-xs text-[#65796c]">
          <span>OECL · Open ERC Composition Laboratory</span>
          <span>Independent evidence · Reproducible limitations · Discovery ≠ compatibility</span>
        </div>
      </footer>
    </main>
  );
}
