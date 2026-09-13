import {
  CompositionWorkbench,
} from "@/components/CompositionWorkbench";

import {
  EvidenceReceiptGateway,
} from "@/components/EvidenceReceiptGateway";

import {
  ProtocolDiscovery,
} from "@/components/ProtocolDiscovery";

import {
  ScientificCorpusOverview,
} from "@/components/ScientificCorpusOverview";


export default function Home() {

  return (
    <main className="min-h-screen">

      <header className="border-b border-[#dcded9]">

        <div className="mx-auto flex max-w-[1480px] items-center justify-between px-6 py-5 md:px-10 lg:px-14">

          <div className="flex items-baseline gap-4">

            <div className="text-[15px] font-semibold tracking-[-0.02em]">
              OECL
            </div>

            <div className="hidden text-xs text-[#858983] sm:block">
              Open ERC Composition Laboratory
            </div>

          </div>


          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#858983]">
            ETHOnline 2026 · V2.2
          </div>

        </div>

      </header>


      <section className="mx-auto max-w-[1480px] px-6 pb-24 pt-16 md:px-10 md:pt-24 lg:px-14">

        <div className="grid gap-14 lg:grid-cols-[1.7fr_.7fr] lg:gap-20">

          <div>

            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#174c38]">
              Verified evidence infrastructure
            </p>

            <h1 className="mt-7 max-w-[950px] text-[48px] font-medium leading-[0.99] tracking-[-0.055em] md:text-[72px] lg:text-[82px]">
              Evidence you can hand
              <br />
              to another machine.
            </h1>

            <p className="mt-8 max-w-3xl text-[17px] leading-8 text-[#70746f] md:text-[18px]">
              OECL turns standardized live blockchain observations into
              independently witnessed, machine-readable EvidenceReceipts
              before agents or research systems are allowed to reason from them.
            </p>


            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-[#dcded9] pt-5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#70746f]">

              <span>The Graph observes</span>
              <span>Chain state witnesses</span>
              <span>OECL decides</span>

            </div>

          </div>


          <aside className="border-l border-[#dcded9] pl-6 lg:pt-9">

            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#858983]">
              Live system
            </div>


            <div className="mt-8 border-b border-[#dcded9] pb-6">

              <div className="text-[38px] font-medium tracking-[-0.045em]">
                1
              </div>

              <div className="mt-1 text-xs text-[#70746f]">
                standardized query
              </div>

            </div>


            <div className="border-b border-[#dcded9] py-6">

              <div className="text-[38px] font-medium tracking-[-0.045em]">
                5
              </div>

              <div className="mt-1 text-xs text-[#70746f]">
                mainnet targets
              </div>

            </div>


            <div className="py-6">

              <div className="font-mono text-[11px] font-semibold text-[#174c38]">
                OECL_EVIDENCE_ADMISSION_V1
              </div>

              <div className="mt-2 text-xs leading-5 text-[#70746f]">
                ADMISSIBLE · REJECTED · INCOMPLETE
              </div>

            </div>

          </aside>

        </div>


        <EvidenceReceiptGateway />


        <section className="mt-28 border-t border-[#cfd2cc] pt-10">

          <div className="grid gap-10 lg:grid-cols-[.7fr_1.5fr]">

            <div>

              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#174c38]">
                How it works
              </p>

              <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em]">
                Observation is not evidence.
              </h2>

            </div>


            <div className="grid md:grid-cols-4">

              <div className="border-t border-[#dcded9] py-5 md:border-l md:border-t-0 md:px-5 md:py-0">

                <div className="font-mono text-[9px] text-[#959992]">
                  01
                </div>

                <div className="mt-3 text-sm font-medium">
                  Observe
                </div>

                <p className="mt-2 text-xs leading-5 text-[#777b75]">
                  One standardized GraphQL model reads ERC-8004 state.
                </p>

              </div>


              <div className="border-t border-[#dcded9] py-5 md:border-l md:border-t-0 md:px-5 md:py-0">

                <div className="font-mono text-[9px] text-[#959992]">
                  02
                </div>

                <div className="mt-3 text-sm font-medium">
                  Witness
                </div>

                <p className="mt-2 text-xs leading-5 text-[#777b75]">
                  Independent RPC calls inspect the corresponding indexed block.
                </p>

              </div>


              <div className="border-t border-[#dcded9] py-5 md:border-l md:border-t-0 md:px-5 md:py-0">

                <div className="font-mono text-[9px] text-[#959992]">
                  03
                </div>

                <div className="mt-3 text-sm font-medium">
                  Compare
                </div>

                <p className="mt-2 text-xs leading-5 text-[#777b75]">
                  Chain ID, block hash, registry runtime and agent ownership are checked.
                </p>

              </div>


              <div className="border-t border-[#dcded9] py-5 md:border-l md:border-t-0 md:px-5 md:py-0">

                <div className="font-mono text-[9px] text-[#959992]">
                  04
                </div>

                <div className="mt-3 text-sm font-medium">
                  Admit
                </div>

                <p className="mt-2 text-xs leading-5 text-[#777b75]">
                  OECL emits a deterministic EvidenceReceipt for downstream systems.
                </p>

              </div>

            </div>

          </div>

        </section>


        <section className="mt-28 border-t border-[#cfd2cc] pt-10">

          <div className="grid gap-10 lg:grid-cols-[.7fr_1.5fr]">

            <div>

              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#174c38]">
                Scientific consumer
              </p>

              <h2 className="mt-4 max-w-sm text-3xl font-medium tracking-[-0.035em]">
                Evidence enters research only after admission.
              </h2>

            </div>


            <div>

              <p className="max-w-3xl text-[15px] leading-7 text-[#70746f]">
                OECL V2.1 is the first scientific consumer of this evidence
                model. Its current composition corpus remains frozen and
                deterministic: live receipts do not rewrite existing
                conclusions, and verified protocol presence still does not
                establish compatibility.
              </p>

            </div>

          </div>


          <ScientificCorpusOverview />


          <div className="mt-12">

            <CompositionWorkbench />

          </div>

        </section>


        <section className="mt-28 border-t border-[#cfd2cc] pt-8">

          <details>

            <summary className="flex cursor-pointer items-center justify-between py-3 text-sm font-medium">

              <span>
                Advanced protocol discovery
              </span>

              <span className="font-mono text-[10px] text-[#8b8f89]">
                THE GRAPH MCP
              </span>

            </summary>


            <div className="mt-3 border-t border-[#dcded9] pt-3">

              <ProtocolDiscovery />

            </div>

          </details>

        </section>

      </section>


      <footer className="border-t border-[#dcded9]">

        <div className="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-4 px-6 py-7 text-[11px] text-[#858983] md:px-10 lg:px-14">

          <span>
            Open ERC Composition Laboratory
          </span>

          <span className="font-mono text-[9px] uppercase tracking-[0.14em]">
            Discovery ≠ compatibility
          </span>

        </div>

      </footer>

    </main>
  );
}