"use client";

import { useEffect, useState } from "react";
import { ScientificAstGraphExplorer, type AstGraphView } from "@/components/ScientificAstGraphExplorer";
import { ScientificDossierResults } from "@/components/ScientificDossierResults";
import { IndependentEvmEvidencePanel } from "@/components/IndependentEvmEvidencePanel";
import { DocumentaryPairExplorer } from "@/components/DocumentaryPairExplorer";
import { ErcCatalogBrowser } from "@/components/ErcCatalogBrowser";
import { FreshPairSourceAnalysis } from "@/components/FreshPairSourceAnalysis";
import { Erc4626LocalEvmPanel } from "@/components/Erc4626LocalEvmPanel";
import { PinnedScientificCyclePanel } from "@/components/PinnedScientificCyclePanel";
import type { ScientificDossier } from "@/server/oeclScientificDossier";

type Pair = { a: string; b: string };
type Tab = "overview" | "capabilities" | "evidence" | "limits";
type GraphResponse = { status: string; view?: AstGraphView; message?: string };
type DossierResponse = { status: string; dossier?: ScientificDossier; message?: string };

// Only pairs with independently checked, pinned AST-view artifacts are listed
// as examples. Do not infer coverage from the number of registry entries.
const examples = [
  { a: "ERC-8060", b: "ERC-8098", title: "Value-backed NFT × scarce token" },
  { a: "ERC-8060", b: "ERC-20-BURNABLE", title: "NFT redemption × burnable token" },
  { a: "ERC-8098", b: "ERC-20", title: "Monotone supply × ERC-20" },
  { a: "ERC-1155", b: "ERC-20", title: "ERC-1155 × ERC-20 (negative control)" },
] as const;

const documentaryExamples = [
  { a: "ERC-4626", b: "ERC-20", title: "Vaults × fungible tokens" },
  { a: "ERC-8098", b: "ERC-4626", title: "Monotone supply × vault shares (scientific cycle)" },
  { a: "ERC-7575", b: "ERC-4626", title: "Multi-asset vaults × vaults" },
  { a: "ERC-721", b: "ERC-165", title: "NFTs × interface detection" },
] as const;

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Findings" },
  { id: "capabilities", label: "Capabilities & graph" },
  { id: "evidence", label: "EVM & evidence" },
  { id: "limits", label: "Risks & unknowns" },
];

function normalize(value: string): string {
  const raw = value.trim().toUpperCase().replace(/\s+/g, "");
  const match = raw.match(/^(?:ERC-?)?([1-9][0-9]{0,7})$/);
  return match ? "ERC-" + match[1] : raw;
}
function validId(value: string): boolean {
  return /^ERC-[1-9][0-9]{0,7}$/.test(value) || value === "ERC-20-BURNABLE";
}
function verifiedPair(pair: Pair): Pair | null {
  const entry = examples.find(x =>
    (x.a === pair.a && x.b === pair.b) ||
    (x.a === pair.b && x.b === pair.a));
  return entry ? { a: entry.a, b: entry.b } : null;
}
function isDossier(pair: Pair): boolean {
  return (pair.a === "ERC-8060" && pair.b === "ERC-8098") ||
    (pair.b === "ERC-8060" && pair.a === "ERC-8098");
}
function isIndependentEvm(pair: Pair): boolean {
  return (pair.a === "ERC-8060" && pair.b === "ERC-20-BURNABLE") ||
    (pair.b === "ERC-8060" && pair.a === "ERC-20-BURNABLE");
}
function pill(status: string) {
  return <span className="inline-flex rounded-full border border-[#d3dfd6] bg-[#f0f6f2] px-3 py-1 text-[11px] font-semibold text-[#275843]">{status}</span>;
}

export function CompositionWorkbench() {
  const [inputA, setInputA] = useState("ERC-8060");
  const [inputB, setInputB] = useState("ERC-8098");
  const [pair, setPair] = useState<Pair>({ a: "ERC-8060", b: "ERC-8098" });
  const [tab, setTab] = useState<Tab>("overview");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [result, setResult] = useState<{
    key: string; graph: AstGraphView | null; dossier: ScientificDossier | null; failure: string | null;
  } | null>(null);

  const normalizedA = normalize(inputA), normalizedB = normalize(inputB);
  const canInspect = validId(normalizedA) && validId(normalizedB) && normalizedA !== normalizedB;
  const dirty = normalizedA !== pair.a || normalizedB !== pair.b;
  const pinned = verifiedPair(pair);
  const pairKey = pair.a + "|" + pair.b;
  const current = result?.key === pairKey ? result : null;
  const graph = current?.graph ?? null;
  const dossier = current?.dossier ?? null;
  const failure = current?.failure ?? null;
  const loading = Boolean(pinned) && current === null;
  const dossierPair = isDossier(pair);
  const independentEvm = isIndependentEvm(pair);
  const hasNewLocalEvm = (pair.a === "ERC-4626" && pair.b === "ERC-20") ||
    (pair.b === "ERC-4626" && pair.a === "ERC-20");
  const hasPinnedScientificCycle = hasNewLocalEvm ||
    (pair.a === "ERC-8098" && pair.b === "ERC-4626") ||
    (pair.b === "ERC-8098" && pair.a === "ERC-4626");

  useEffect(() => {
    const abort = new AbortController();
    const selected = verifiedPair(pair);
    if (!selected) return () => abort.abort();
    const key = pair.a + "|" + pair.b;

    async function read() {
      try {
        const graphUrl = "/api/scientific/source-views?sourceA=" +
          encodeURIComponent(selected!.a) + "&sourceB=" + encodeURIComponent(selected!.b);
        const requests: Promise<Response>[] = [
          fetch(graphUrl, { signal: abort.signal, cache: "no-store" }),
        ];
        if (isDossier(pair)) requests.push(fetch(
          "/api/scientific/dossier?protocolA=ERC-8060&protocolB=ERC-8098",
          { signal: abort.signal, cache: "no-store" }));
        const responses = await Promise.all(requests);
        const view = await responses[0].json() as GraphResponse;
        if (!responses[0].ok || view.status !== "VERIFIED_SOURCE_GRAPH" || !view.view ||
          view.view.scientificVerdict !== "INCONCLUSIVE" ||
          view.view.candidateAdmission !== "NOT_ADMITTED" ||
          view.view.sourceOnly !== true || view.view.evmExecuted !== false ||
          view.view.selected?.[0]?.id !== selected!.a ||
          view.view.selected?.[1]?.id !== selected!.b) {
          throw new Error(view.message || "Verified AST evidence could not be established.");
        }
        let pinnedDossier: ScientificDossier | null = null;
        if (responses.length > 1) {
          const result = await responses[1].json() as DossierResponse;
          if (!responses[1].ok || result.status !== "PINNED_SCIENTIFIC_DOSSIER" ||
            result.dossier?.verdict !== "INCONCLUSIVE" ||
            result.dossier?.candidateAdmission !== "NOT_ADMITTED" ||
            result.dossier?.experiment.propertyStatus !== "OBSERVED_IN_PINNED_LOCAL_EVM") {
            throw new Error("Pinned local-EVM dossier is unavailable or failed its scientific scope checks.");
          }
          pinnedDossier = result.dossier;
        }
        if (!abort.signal.aborted) setResult({
          key, graph: view.view, dossier: pinnedDossier, failure: null,
        });
      } catch (cause) {
        if (!abort.signal.aborted) setResult({
          key, graph: null, dossier: null,
          failure: cause instanceof Error ? cause.message : "Evidence unavailable.",
        });
      }
    }
    void read();
    return () => abort.abort();
  }, [pair]);

  function inspect(a: string, b: string) {
    const next = { a: normalize(a), b: normalize(b) };
    if (!validId(next.a) || !validId(next.b) || next.a === next.b) return;
    setInputA(next.a);
    setInputB(next.b);
    setPair(next);
    setTab("overview");
  }

  const hypothesis = graph?.hypotheses[0];
  const paths = graph?.pathFeasibility?.hypotheses ?? [];
  const pathStatus = paths[0]?.pathScreen;
  const relation = dossier ? "Potential atomic coordination of two independently constrained resource decreases" :
    hypothesis?.finding ?? null;

  return <section id="composition-workbench" aria-label="OECL composition workbench"
      className="scroll-mt-24 space-y-6 rounded-[28px] border border-[#cddbd2] bg-white p-5 shadow-[0_12px_50px_rgba(15,40,27,0.04)] md:p-8">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#236246]">01 / Investigate a composition</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] md:text-3xl">Choose any two ERC standards</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#607369]">
          Investigate published ERC specifications and their declared dependencies, then inspect
          compiler-grounded Solidity and local EVM evidence when available. Documentary relations are not executable proof.
        </p>
      </div>
      {pill("Read-only scientific evidence")}
    </div>

    <form onSubmit={event => { event.preventDefault(); inspect(inputA, inputB); }}
      className="grid gap-3 rounded-2xl bg-[#f3f7f3] p-4 md:grid-cols-[1fr_1fr_auto] md:items-end md:p-5">
      <div>
        <label htmlFor="oecl-protocol-a" className="mb-2 block text-xs font-semibold text-[#425b4d]">ERC protocol A</label>
        <input id="oecl-protocol-a" value={inputA}
          onChange={e => setInputA(e.target.value)} autoComplete="off"
          placeholder="ERC-8060" className="w-full rounded-xl border border-[#c9d8ce] bg-white px-4 py-3 text-sm outline-none focus:border-[#27694d] focus:ring-2 focus:ring-[#b4dfc3]" />
      </div>
      <div>
        <label htmlFor="oecl-protocol-b" className="mb-2 block text-xs font-semibold text-[#425b4d]">ERC protocol B</label>
        <input id="oecl-protocol-b" value={inputB}
          onChange={e => setInputB(e.target.value)} autoComplete="off"
          placeholder="ERC-8098" className="w-full rounded-xl border border-[#c9d8ce] bg-white px-4 py-3 text-sm outline-none focus:border-[#27694d] focus:ring-2 focus:ring-[#b4dfc3]" />
      </div>

      <button type="submit" disabled={!canInspect}
        className="rounded-xl bg-[#174c38] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0f3929] focus:outline-none focus:ring-2 focus:ring-[#5eac7b] disabled:cursor-not-allowed disabled:opacity-40">
        Inspect pair
      </button>
    </form>

    <div className="space-y-3 rounded-xl border border-[#d6e4d8] bg-[#f7faf6] p-3 md:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#26583d]">Want to combine another ERC?</p>
          <p className="mt-1 text-xs text-[#607468]">Browse the full official document index plus OECL experimental source profiles — not just the examples below.</p>
        </div>
        <button type="button" aria-expanded={catalogOpen} aria-controls="oecl-erc-directory"
          onClick={() => setCatalogOpen(open => !open)}
          className="rounded-xl bg-[#225b40] px-4 py-3 text-sm font-semibold text-white hover:bg-[#164630] focus:ring-2 focus:ring-[#80bb91]">
          {catalogOpen ? "Close ERC directory" : "Browse all ERCs"}
        </button>
      </div>
      {catalogOpen && <div id="oecl-erc-directory">
        <ErcCatalogBrowser onChoose={(side,id) => {
          if (side === "A") setInputA(id);
          else setInputB(id);
        }}/>
      </div>}
    </div>

    <div aria-label="Verified example pairs" className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs text-[#607369]">Source-tested examples:</span>
      {examples.map(x => <button type="button" key={x.a + x.b} onClick={() => inspect(x.a, x.b)}
        className="rounded-full border border-[#cfdcd2] bg-white px-3 py-2 text-xs font-medium text-[#265841] transition hover:bg-[#eaf4ed] focus:ring-2 focus:ring-[#90c4a1]">
        {x.title}
      </button>)}
    </div>
    <p className="text-xs text-[#68796e]">
      You can investigate any numeric ERC, including profiles not in the official ethereum/ERCs registry. Full Solidity and EVM evidence
      is available only for reviewed implementations. Unpublished proposals and missing results are not judged incompatible.
    </p>
    <div aria-label="Official ERC specification examples" className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs text-[#607369]">Try other ERCs:</span>
      {documentaryExamples.map(x => <button type="button" key={x.a + x.b} onClick={() => inspect(x.a, x.b)}
        className="rounded-full border border-[#d6d7e4] bg-[#f7f7fc] px-3 py-2 text-xs font-medium text-[#4c4e78] hover:bg-[#eaeaf8]">
        {x.title}
      </button>)}
    </div>
    {dirty && <p role="status" className="rounded-xl border border-[#decda8] bg-[#fff9ec] p-3 text-xs text-[#766023]">
      Selection changed. Press <strong>Inspect pair</strong> to update the report; the report below still describes {pair.a} × {pair.b}.
    </p>}

    <article data-testid="oecl-pair-report" aria-label="Composition investigation results"
      className="space-y-5 border-t border-[#dde6de] pt-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#287051]">02 / What the evidence says</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em] md:text-3xl">{pair.a} <span className="text-[#90a199]">×</span> {pair.b}</h3>
        </div>
        {loading ? pill("Checking pinned evidence") : failure ? pill("Verification failed") :
          graph ? pill("INCONCLUSIVE · NOT_ADMITTED") :
          hasPinnedScientificCycle ? pill("REVIEWED LOCAL EVM · INCONCLUSIVE") : pill("NOT EVALUATED")}
      </header>

      {loading && <p role="status" className="rounded-xl bg-[#f3f7f3] p-5 text-sm text-[#506858]">Loading verified source evidence...</p>}
      {failure && <p role="alert" className="rounded-xl border border-[#dfb7b4] bg-[#fff5f3] p-5 text-sm text-[#933f32]">
        Evidence verification failed: {failure}. No conclusion has been inferred.
      </p>}
      {!loading && !failure && !graph && <div data-testid="oecl-no-evidence"
        className="rounded-2xl border border-[#e2ddc9] bg-[#fffcf3] p-6">
        <h4 className="text-lg font-semibold text-[#694d27]">
          {hasPinnedScientificCycle ? "Reviewed scientific cycle available — interactive AST graph not yet materialized" :
            "No pinned Solidity/EVM experiment for this pair"}
        </h4>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#695f47]">
          {hasPinnedScientificCycle ?
            "Compiler AST hypotheses and independently reviewed local-EVM experiments are available in the pinned scientific cycle below. A full interactive graph for these sources is not published in this view. The tested fixtures do not establish general compatibility." :
            "OECL has not tested this composition in its published EVM suite. This is neither a compatibility approval nor proof of incompatibility. Documentary discovery below identifies source-level questions."}
        </p>
      </div>}

      {hasPinnedScientificCycle && <PinnedScientificCyclePanel
        key={pairKey} sourceA={pair.a} sourceB={pair.b} />}
      {hasNewLocalEvm && <Erc4626LocalEvmPanel />}

      {!pinned && (pair.a === "ERC-20-BURNABLE" || pair.b === "ERC-20-BURNABLE") &&
        <p role="status" className="rounded-xl border border-[#e4d6b9] bg-[#fffaf0] p-4 text-sm text-[#6f5634]">
          ERC-20 Burnable is an OpenZeppelin implementation extension, not a separate numbered ERC.
          For a documentary comparison select ERC-20; for source/EVM evidence choose the reviewed
          ERC-8060 × ERC-20-BURNABLE example. No result is inferred for this untested pair.
        </p>}
      {!pinned && pair.a !== "ERC-20-BURNABLE" && pair.b !== "ERC-20-BURNABLE" &&
        <DocumentaryPairExplorer key={pairKey} protocolA={pair.a} protocolB={pair.b} />}

      {!loading && !failure && graph && <>
        <div data-testid="oecl-outcome" className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#d5e1d7] bg-[#f1f8f2] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#357054]">Potential relationship</p>
            <p className="mt-3 text-[15px] font-semibold leading-6 text-[#183d2b]">
              {relation ?? "No supported structural relationship discovered"}
            </p>
            <p className="mt-2 text-xs leading-5 text-[#4f715c]">
              {hypothesis ? "Derived from compiler-resolved paths, not a proof of executable composition." :
                "No relation was admitted under the current source-discovery rules."}
            </p>
          </div>
          <div className="rounded-2xl border border-[#d8e0e4] bg-[#f3f7f9] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#52727f]">What was measured</p>
            <p className="mt-3 text-[15px] font-semibold leading-6 text-[#193943]">
              {dossier ? "One local transaction reduced an ETH redemption obligation and fungible supply." :
                independentEvm ? "Ten independent local EVM receipts are available for this pinned pair." :
                "Source AST only — no pair-specific EVM execution in this example."}
            </p>
            <p className="mt-2 text-xs leading-5 text-[#5e7580]">
              {dossier ? "0.1 ETH redeemed; supply decreased from 100 to 99 units in the test." :
                independentEvm ? "Inspect successful and reverted transactions in the Evidence tab." :
                "A call graph cannot establish transaction reachability or safe atomic behavior."}
            </p>
          </div>
          <div className="rounded-2xl border border-[#e5d9c4] bg-[#fff8ee] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9a703c]">What remains unproven</p>
            <p className="mt-3 text-[15px] font-semibold leading-6 text-[#5a4428]">
              {pathStatus === "NOT_PROVEN_EXECUTABLE" ? "The source paths are not proven executable." :
                hypothesis ? "Authorization, custody and execution constraints need independent tests." :
                "No supported composition candidate has been admitted."}
            </p>
            <p className="mt-2 text-xs leading-5 text-[#8b7658]">
              {dossier ? dossier.adversarial.untested.length + " adversarial threat classes remain untested. " : ""}
              Global verdict: INCONCLUSIVE. Candidate: NOT_ADMITTED.
            </p>
          </div>
        </div>

        {hypothesis && <div className="rounded-xl border border-[#dfe8e0] p-4 text-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#56735f]">Source evidence behind the hypothesis</p>
          <div className="grid gap-3 md:grid-cols-2">
            {hypothesis.evidence.map((e,i) => <div key={i} className="rounded-lg bg-[#f5f8f5] p-3">
              <p className="font-semibold text-[#234f36]">{e.participant}</p>
              <p className="mt-1 break-words text-xs text-[#596d60]">
                Entry point: <strong>{e.publicEntrypoint || "not established"}</strong>
                {e.state ? " · State: " + e.state : ""}
              </p>
            </div>)}
          </div>
        </div>}

        <nav aria-label="Scientific report sections" className="flex flex-wrap gap-2 border-b border-[#dce5de] pb-3">
          {tabs.map(item => <button type="button" key={item.id} onClick={() => setTab(item.id)}
            aria-pressed={tab === item.id}
            className={"rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:ring-2 focus:ring-[#78ac89] " +
              (tab === item.id ? "bg-[#1c533a] text-white" : "bg-[#eef4ef] text-[#3c624c] hover:bg-[#dfece1]")}>
            {item.label}
          </button>)}
        </nav>

        {tab === "overview" && <section aria-label="Scientific finding summary" className="space-y-4">
          <h4 className="text-lg font-semibold">Interpretation of this pair</h4>
          <p className="max-w-4xl text-sm leading-7 text-[#53675b]">
            {hypothesis ?
              "OECL has identified a source-grounded structural relationship. That is a testable hypothesis, not a certified integration. The evidence above distinguishes observed local behavior from untested paths, permissions and implementations." :
              "The pinned AST analysis did not identify a supported relationship under the current rules. Absence of a discovered relation is not proof of incompatibility."}
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-[#dce6dd] p-4">
              <p className="text-xs text-[#687a6c]">Compiler-resolved source units</p>
              <p className="mt-1 text-2xl font-semibold">{graph.counts.sourceUnits}</p>
            </div>
            <div className="rounded-xl border border-[#dce6dd] p-4">
              <p className="text-xs text-[#687a6c]">Callable functions</p>
              <p className="mt-1 text-2xl font-semibold">{graph.counts.callableFunctions}</p>
            </div>
            <div className="rounded-xl border border-[#dce6dd] p-4">
              <p className="text-xs text-[#687a6c]">Source-only hypotheses</p>
              <p className="mt-1 text-2xl font-semibold">{graph.hypotheses.length}</p>
            </div>
          </div>
          <p className="text-xs leading-5 text-[#697a6e]">
            Counts describe this finite compiled corpus, not all Ethereum protocols. Source results alone cannot establish general compatibility.
          </p>
        </section>}

        {tab === "capabilities" && <ScientificAstGraphExplorer key={pinned?.a + "|" + pinned?.b} view={graph}/>}

        {tab === "evidence" && <section aria-label="Scientific execution evidence" className="space-y-4">
          {dossierPair && dossier && <ScientificDossierResults protocolA={pair.a} protocolB={pair.b}/>}
          {independentEvm && <IndependentEvmEvidencePanel/>}
          {!dossierPair && !independentEvm && <div className="rounded-xl border border-[#deded4] bg-[#fafaf6] p-5">
            <h4 className="font-semibold">No independent pair-specific EVM evidence in this verified example</h4>
            <p className="mt-2 text-sm leading-6 text-[#697267]">
              Its evidence is compiler-resolved source structure and a conservative path-feasibility screen.
              No transaction has been asserted and no candidate admitted.
            </p>
          </div>}
          <p className="text-xs text-[#62766a]">Source-view CI provenance: <a href={graph.provenance.url} target="_blank" rel="noopener noreferrer" className="break-all font-medium text-[#256346] underline">inspect pinned source experiment</a>.</p>
        </section>}

        {tab === "limits" && <section aria-label="Unresolved scientific risks" className="space-y-5">
          <div className="rounded-xl border border-[#e4d7c0] bg-[#fff9ef] p-5">
            <h4 className="font-semibold text-[#63492e]">Scientific admission is still blocked</h4>
            <p className="mt-2 text-sm leading-6 text-[#785c39]">
              The path-feasibility model is partial, never a reachability proof. Native and EVM evidence must be bound to genuinely discovered candidates and independently reviewed before any broader claim.
            </p>
          </div>
          {hypothesis && <div>
            <h4 className="mb-3 font-semibold">Constraints on the source-derived hypothesis</h4>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-[#58695d]">
              {hypothesis.constraints.map(x => <li key={x}>{x}</li>)}
            </ul>
          </div>}
          {dossier && <div>
            <h4 className="mb-3 font-semibold">Untested threat classes ({dossier.adversarial.untested.length})</h4>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-[#58695d]">
              {dossier.adversarial.untested.map(x => <li key={x.id}><strong>{x.id}</strong>: {x.reason}</li>)}
            </ul>
          </div>}
          <details className="rounded-xl border border-[#dbe3db] p-4">
            <summary className="cursor-pointer text-sm font-semibold">All source-analysis limitations ({graph.limitations.length})</summary>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-xs leading-5 text-[#637368]">
              {graph.limitations.map((x,i) => <li key={i}>{x}</li>)}
            </ul>
          </details>
        </section>}
      </>}

      {!loading && !failure && !graph && pinned && <p role="alert" className="text-sm text-[#805b35]">Expected source evidence was unavailable. Scientific evaluation remains inconclusive.</p>}

      <FreshPairSourceAnalysis key={pairKey} sourceA={pair.a} sourceB={pair.b} />
    </article>
  </section>;
}
