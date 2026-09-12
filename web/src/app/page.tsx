import { CompositionWorkbench } from "@/components/CompositionWorkbench";
import { ScientificCorpusOverview } from "@/components/ScientificCorpusOverview";
import { ProtocolDiscovery } from "@/components/ProtocolDiscovery";
import { LiveGraphStandardization } from "@/components/LiveGraphStandardization";
import { EthereumVerifiedEvidence } from "@/components/EthereumVerifiedEvidence";


export default function Home() {

  return (
    <main className="min-h-screen px-6 py-6 md:px-10 lg:px-14">

      <header className="mx-auto flex max-w-[1500px] items-center justify-between border-b border-[#dfe4e1] pb-5">

        <div>
          <div className="text-sm font-semibold">
            OECL
          </div>

          <div className="text-xs text-[#68706c]">
            Open ERC Composition Laboratory
          </div>
        </div>

        <div className="font-mono text-xs text-[#68706c]">
          V2.1 BASELINE · ETHONLINE 2026 EXTENSION
        </div>

      </header>


      <section className="mx-auto max-w-[1500px] pt-12">

        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#1e5d46]">
          Ethereum composition intelligence
        </p>

        <h1 className="mt-5 max-w-5xl text-5xl font-medium leading-[1.02] tracking-[-0.045em] md:text-6xl">
          Verify the evidence before reasoning about composition.
        </h1>

        <p className="mt-5 max-w-4xl text-lg leading-8 text-[#68706c]">
          OECL studies how Ethereum standards may work together without
          concluding more than the evidence supports. The ETHOnline 2026
          extension adds standardized live observation through The Graph and
          independent same-block verification against the chains themselves.
        </p>


        <section className="mt-12">

          <div className="rounded-[28px] border border-[#bfd7cc] bg-[#f4f9f6] p-6 md:p-8">

            <div className="flex flex-wrap items-start justify-between gap-6">

              <div>

                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#1e5d46]">
                  01 · ETHOnline 2026 live extension
                </p>

                <h2 className="mt-2 max-w-4xl text-3xl font-medium tracking-[-0.025em]">
                  One standardized observation becomes independently verified evidence
                </h2>

                <p className="mt-3 max-w-4xl text-sm leading-6 text-[#68706c]">
                  ERC-8004 is the live worked example. One GraphQL model and
                  query observe the protocol across Ethereum, Base and Polygon.
                  OECL then checks each observation against the corresponding
                  blockchain at the exact indexed block.
                </p>

              </div>

              <div className="rounded-full border border-[#bfd7cc] bg-white px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e5d46]">
                LIVE · STANDARDIZED · VERIFIABLE
              </div>

            </div>


            <div className="mt-7 grid gap-3 md:grid-cols-4">

              <div className="rounded-2xl border border-[#d7dfda] bg-white p-5">

                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#68706c]">
                  01 · Observe
                </div>

                <div className="mt-2 text-xl font-medium">
                  1 standardized query
                </div>

                <p className="mt-1 text-xs leading-5 text-[#68706c]">
                  The Graph supplies a consistent ERC-8004 observation model.
                </p>

              </div>


              <div className="rounded-2xl border border-[#d7dfda] bg-white p-5">

                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#68706c]">
                  02 · Reuse
                </div>

                <div className="mt-2 text-xl font-medium">
                  3 live networks
                </div>

                <p className="mt-1 text-xs leading-5 text-[#68706c]">
                  Ethereum, Base and Polygon use the same observation pattern.
                </p>

              </div>


              <div className="rounded-2xl border border-[#d7dfda] bg-white p-5">

                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#68706c]">
                  03 · Verify
                </div>

                <div className="mt-2 text-xl font-medium">
                  Same-block checks
                </div>

                <p className="mt-1 text-xs leading-5 text-[#68706c]">
                  Each chain independently answers for the indexed state.
                </p>

              </div>


              <div className="rounded-2xl border border-[#a9cbbb] bg-[#eaf4ef] p-5">

                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#1e5d46]">
                  04 · Decide
                </div>

                <div className="mt-2 text-xl font-medium text-[#173f32]">
                  Evidence decision
                </div>

                <p className="mt-1 text-xs leading-5 text-[#45695b]">
                  OECL determines what the observed facts are sufficient to support.
                </p>

              </div>

            </div>


            <div className="mt-6 rounded-2xl border border-[#d7dfda] bg-white p-5">

              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#1e5d46]">
                Trust boundary
              </div>

              <p className="mt-2 max-w-5xl text-sm leading-6 text-[#68706c]">
                The Graph is the standardized observer. The chain itself is the
                witness. OECL does not replace either one: it deterministically
                compares the evidence and refuses to advance unsupported claims.
              </p>

            </div>

          </div>


          <LiveGraphStandardization />

          <EthereumVerifiedEvidence />

        </section>


        <section className="mt-20 border-t border-[#dfe4e1] pt-12">

          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#1e5d46]">
            02 · Current scientific corpus
          </p>

          <h2 className="mt-3 max-w-4xl text-3xl font-medium tracking-[-0.025em]">
            Where verified evidence can ultimately become composition research
          </h2>

          <p className="mt-3 max-w-4xl text-base leading-7 text-[#68706c]">
            OECL V2.1 already contains a deterministic scientific snapshot of
            materialized composition candidates. This baseline is not an
            exhaustive survey and does not rank candidates by compatibility.
            It shows the research layer that live verified evidence is designed
            to support.
          </p>


          <ScientificCorpusOverview />


          <div className="mt-10">

            <CompositionWorkbench />

          </div>

        </section>

      </section>


      <section className="mx-auto mt-12 max-w-[1500px] pb-20">

        <details className="rounded-[24px] border border-[#dfe4e1] bg-white">

          <summary className="cursor-pointer px-6 py-5 text-sm font-medium">
            Advanced Live Evidence - The Graph
          </summary>

          <div className="border-t border-[#e2e7e4] px-1 pb-1">

            <ProtocolDiscovery />

          </div>

        </details>

      </section>

    </main>
  );
}