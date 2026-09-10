import { CompositionExplorer } from "@/components/CompositionExplorer";
import { ProtocolDiscovery } from "@/components/ProtocolDiscovery";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-6 md:px-10 lg:px-14">
      <header className="mx-auto flex max-w-[1500px] items-center justify-between border-b border-[#dfe4e1] pb-5">
        <div>
          <div className="text-sm font-semibold">OECL</div>
          <div className="text-xs text-[#68706c]">Open ERC Composition Laboratory</div>
        </div>

        <div className="font-mono text-xs text-[#68706c]">
          V2.1 · VALIDATED SCIENTIFIC SNAPSHOT
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] pt-12">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#1e5d46]">
          Ethereum composition intelligence
        </p>

        <h1 className="mt-5 max-w-5xl text-5xl font-medium leading-[1.02] tracking-[-0.045em] md:text-6xl">
          Find out how Ethereum standards can work together.
        </h1>

        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#68706c]">
          Discover composition candidates, check a protocol pair, understand what each standard contributes,
          and inspect the evidence behind the scientific result.
        </p>

        <div className="mt-9 grid gap-4 md:grid-cols-2">
          <a
            href="#compositions"
            className="rounded-[24px] border border-[#cfd7d2] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="font-mono text-xs text-[#1e5d46]">01 · FIND COMPOSITIONS</div>
            <div className="mt-3 text-xl font-medium">What can work with my ERC?</div>
            <p className="mt-2 text-sm leading-6 text-[#68706c]">
              Explore discovered candidates, contributions, barriers, boundaries and scientific state.
            </p>
          </a>

          <a
            href="#compositions"
            className="rounded-[24px] border border-[#cfd7d2] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="font-mono text-xs text-[#1e5d46]">02 · CHECK A PAIR</div>
            <div className="mt-3 text-xl font-medium">Can ERC-X compose with ERC-Y?</div>
            <p className="mt-2 text-sm leading-6 text-[#68706c]">
              Inspect the candidate route, evidence, boundaries and Why / Why Not explanation.
            </p>
          </a>
        </div>
      </section>

      <div id="compositions">
        <CompositionExplorer />
      </div>

      <section className="mx-auto mt-12 max-w-[1500px] pb-20">
        <details className="rounded-[24px] border border-[#dfe4e1] bg-white">
          <summary className="cursor-pointer px-6 py-5 text-sm font-medium">
            Advanced Live Evidence · The Graph
          </summary>

          <div className="border-t border-[#e2e7e4] px-1 pb-1">
            <ProtocolDiscovery />
          </div>
        </details>
      </section>
    </main>
  );
}

