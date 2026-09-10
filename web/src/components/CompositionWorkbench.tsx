"use client";

import { useMemo, useState } from "react";
import { compositionCases } from "@/data/compositionCases";
import { BoundaryDetails } from "@/components/BoundaryDetails";

function normalize(value: string) {
  return value.trim().toUpperCase();
}

export function CompositionWorkbench() {
  const [mode, setMode] = useState<"find" | "pair">("find");
  const [primary, setPrimary] = useState("ERC-8004");
  const [secondary, setSecondary] = useState("ERC-8060");
  const [submitted, setSubmitted] = useState(false);

  const results = useMemo(() => {
    if (!submitted) return [];

    const a = normalize(primary);

    if (mode === "find") {
      return compositionCases.filter((item) =>
        item.protocols.includes(a)
      );
    }

    const b = normalize(secondary);

    return compositionCases.filter(
      (item) =>
        item.protocols.includes(a) &&
        item.protocols.includes(b)
    );
  }, [mode, primary, secondary, submitted]);

  return (
    <section className="mt-9 rounded-[28px] border border-[#cfd7d2] bg-white p-6 md:p-8">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setMode("find"); setSubmitted(false); }}
          className={`rounded-full px-4 py-2 text-sm ${mode === "find" ? "bg-[#101312] text-white" : "bg-[#f1f3f2]"}`}
        >
          Find compositions
        </button>

        <button
          onClick={() => { setMode("pair"); setSubmitted(false); }}
          className={`rounded-full px-4 py-2 text-sm ${mode === "pair" ? "bg-[#101312] text-white" : "bg-[#f1f3f2]"}`}
        >
          Check a pair
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        <input
          value={primary}
          onChange={(e) => { setPrimary(e.target.value.toUpperCase()); setSubmitted(false); }}
          placeholder="ERC-8004"
          className="flex-1 rounded-2xl border border-[#cfd7d2] px-5 py-3 outline-none focus:border-[#1e5d46]"
        />

        {mode === "pair" && (
          <input
            value={secondary}
            onChange={(e) => { setSecondary(e.target.value.toUpperCase()); setSubmitted(false); }}
            placeholder="ERC-8060"
            className="flex-1 rounded-2xl border border-[#cfd7d2] px-5 py-3 outline-none focus:border-[#1e5d46]"
          />
        )}

        <button
          onClick={() => setSubmitted(true)}
          className="rounded-2xl bg-[#1e5d46] px-6 py-3 text-white"
        >
          Investigate
        </button>
      </div>

      {submitted && (
        <div className="mt-7 border-t border-[#e2e7e4] pt-6">
          {results.length === 0 ? (
            <div>
              <div className="font-mono text-xs text-[#8a6b20]">NO VALIDATED RESULT</div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68706c]">
                The current validated OECL snapshot contains no scientific result for this query.
                This is not an incompatibility verdict.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {results.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#dfe4e1] bg-[#f7f9f7] p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-medium">
                        {item.protocols.join(" × ")}
                      </div>
                      <div className="mt-1 font-mono text-xs text-[#68706c]">
                        {item.relation}
                      </div>
                    </div>

                    <div className={`rounded-full px-4 py-2 text-xs font-semibold ${
                      item.decision === "SUPPORTED"
                        ? "bg-[#173f32] text-white"
                        : "bg-[#ece7d9] text-[#65572b]"
                    }`}>
                      {item.decision}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#1e5d46]">
                      Why this candidate exists
                    </div>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-[#68706c]">
                      {item.summary}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.metrics
                      .filter(
                        (metric) =>
                          metric.label !== "Relevant boundaries" &&
                          metric.label !== "Out of scope",
                      )
                      .map((metric) => (
                      <span
                        key={metric.label}
                        className="rounded-full border border-[#d7ddda] bg-white px-3 py-1.5 text-xs"
                      >
                        {metric.label}: <strong>{metric.value}</strong>
                      </span>
                    ))}
                  </div>

                  {item.id === "REAL-CONTROL-POSITIVE-8004-8060" && (
                    <BoundaryDetails />
                  )}
                  <div className="mt-4 font-mono text-[11px] text-[#1e5d46]">
                    VALIDATED · OECL V2.1
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
