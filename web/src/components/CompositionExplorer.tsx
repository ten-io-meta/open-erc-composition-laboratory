"use client";

import { useEffect, useState } from "react";
import { compositionCases } from "@/data/compositionCases";

type LiveAgent0State = {
  status: "LIVE" | "ERROR" | "NOT_CONFIGURED";
  network?: string;
  chainId?: string;
  fetchedAt?: string | null;
  indexedBlock?: { number: number; hash?: string };
  agentCount?: number;
  hasIndexingErrors?: boolean | null;
};

export function CompositionExplorer() {
  const [selected, setSelected] = useState(0);
  const current = compositionCases[selected];
  const supported = current.decision === "SUPPORTED";
  const [live, setLive] = useState<LiveAgent0State | null>(null);

  useEffect(() => {
    fetch("/api/live/the-graph/agent0", { cache: "no-store" })
      .then((response) => response.json())
      .then(setLive)
      .catch(() => setLive({ status: "ERROR" }));
  }, []);

  return (
    <section className="mx-auto mt-11 max-w-[1500px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#1e5d46]">Composition Explorer</p>
          <h2 className="mt-2 text-2xl font-medium tracking-tight">Inspect real scientific controls</h2>
        </div>
        <div className="flex flex-wrap rounded-full border border-[#dfe4e1] bg-white p-1">
          {compositionCases.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setSelected(index)}
              className={`rounded-full px-4 py-2 text-sm transition ${selected === index ? "bg-[#101312] text-white" : "text-[#68706c] hover:text-[#101312]"}`}
            >
              {item.protocols.join(" x ")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid overflow-hidden rounded-[30px] border border-[#dfe4e1] bg-white/80 shadow-[0_24px_80px_rgba(16,19,18,0.07)] lg:grid-cols-[1.35fr_.65fr]">
        <div className="min-h-[500px] p-7 md:p-10">
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-xs text-[#68706c]">{current.id}</span>
            <span className="rounded-full border border-[#dfe4e1] px-3 py-1 font-mono text-[11px]">{current.relation}</span>
          </div>

          <div className="mt-14 flex flex-col items-center">
            <div className="flex w-full max-w-xl items-center justify-between gap-6">
              {current.protocols.map((protocol) => (
                <div key={protocol} className="flex-1 rounded-2xl border border-[#cfd7d2] bg-white px-5 py-5 text-center">
                  <div className="font-mono text-xs text-[#68706c]">PROTOCOL</div>
                  <div className="mt-2 text-xl font-semibold">{protocol}</div>
                </div>
              ))}
            </div>
            <div className="h-8 w-px bg-[#cfd7d2]" />
            <div className="rounded-2xl border border-[#cfd7d2] bg-[#f7f9f7] px-7 py-4 text-center">
              <div className="font-mono text-[11px] text-[#68706c]">{current.foundation ? "SHARED FOUNDATION" : "DISCOVERY RELATION"}</div>
              <div className="mt-1 font-medium">{current.foundation ?? current.relation}</div>
            </div>
            <div className="h-8 w-px bg-[#cfd7d2]" />
            <div className="rounded-full border border-[#dfe4e1] bg-white px-5 py-2 font-mono text-xs">
              {current.discoveryState}
            </div>
            <div className="h-8 w-px bg-[#cfd7d2]" />
            <div className={`rounded-full px-6 py-3 text-sm font-semibold ${supported ? "bg-[#173f32] text-white" : "bg-[#ece7d9] text-[#65572b]"}`}>
              {current.decision}
            </div>
          </div>
        </div>
        <aside className="border-t border-[#dfe4e1] bg-[#f7f9f7]/80 p-7 lg:border-l lg:border-t-0 md:p-9">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#68706c]">Candidate Dossier</p>
          <h3 className="mt-4 text-2xl font-medium">{current.protocols.join(" x ")}</h3>
          <p className="mt-4 text-sm leading-6 text-[#68706c]">{current.summary}</p>

          {selected === 0 && (
            <div className="mt-6 rounded-2xl border border-[#cfe0d8] bg-[#f2f8f5] p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold text-[#1e5d46]">LIVE · THE GRAPH</span>
                <span className="text-xs">{live?.status ?? "LOADING"}</span>
              </div>
              <div className="mt-3 text-sm text-[#4f5d56]">
                Base · chain {live?.chainId ?? "—"} · block {live?.indexedBlock?.number?.toLocaleString() ?? "—"}
              </div>
              <div className="mt-2 text-xs text-[#68706c]">
                Records returned: {live?.agentCount ?? "—"} · Indexing errors: {live?.hasIndexingErrors === false ? "false" : live?.hasIndexingErrors ?? "—"}
              </div>
            </div>
          )}

          <div className="mt-8 grid grid-cols-2 gap-3">
            {current.metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-[#dfe4e1] bg-white p-4">
                <div className="text-2xl font-medium tracking-tight">{metric.value}</div>
                <div className="mt-1 text-xs leading-5 text-[#68706c]">{metric.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-[#dfe4e1] pt-6">
            <div className="text-xs uppercase tracking-[0.16em] text-[#68706c]">Scientific state</div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span>{current.discoveryState}</span>
              <span className="text-[#a5aca8]">-&gt;</span>
              <strong>{current.decision}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}





