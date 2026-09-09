"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type DiscoveryHit = {
  subgraphId: string;
  displayName?: string | null;
  ipfsHash?: string | null;
  providerRank?: number | null;
};

type DiscoverySearch = {
  searchTerm: string;
  returned: number;
  total: number;
  status: string;
  hits: DiscoveryHit[];
};

type DiscoveryResponse = {
  status: "LIVE" | "ERROR" | "NOT_CONFIGURED" | "INVALID_PROTOCOL";
  protocolId: string;
  searches: DiscoverySearch[];
  errors?: string[];
};

export function ProtocolDiscovery() {
  const [protocol, setProtocol] = useState("ERC-8004");
  const [result, setResult] = useState<DiscoveryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runDiscovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/live/the-graph/discover?protocol=${encodeURIComponent(protocol.trim())}`, { cache: "no-store" });
      const data = (await response.json()) as DiscoveryResponse;
      setResult(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Discovery request failed.");
    } finally {
      setLoading(false);
    }
  }

  const hits = result?.searches.flatMap((search) => search.hits) ?? [];

  return (
    <section className="mx-auto mt-12 max-w-[1500px]">
      <div className="rounded-[28px] border border-[#dfe4e1] bg-white p-7 md:p-9">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#1e5d46]">Live Protocol Discovery</p>
        <h2 className="mt-2 text-2xl font-medium">Search The Graph from OECL</h2>

        <form onSubmit={runDiscovery} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            value={protocol}
            onChange={(event) => setProtocol(event.target.value.toUpperCase())}
            placeholder="ERC-8004"
            className="min-w-0 flex-1 rounded-2xl border border-[#cfd7d2] px-5 py-3 outline-none focus:border-[#1e5d46]"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-[#101312] px-6 py-3 text-white disabled:opacity-50"
          >
            {loading ? "Searching..." : "Discover"}
          </button>
        </form>

        {error && <p className="mt-5 text-sm text-red-700">{error}</p>}

        {result && (
          <div className="mt-7 border-t border-[#e2e7e4] pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <strong>{result.protocolId}</strong>
              <span className="font-mono text-xs text-[#1e5d46]">{result.status} · THE GRAPH</span>
            </div>

            {hits.length === 0 ? (
              <p className="mt-4 text-sm text-[#68706c]">0 subgraphs discovered. No attribution or compatibility conclusion was made.</p>
            ) : (
              <div className="mt-4 grid gap-3">
                {hits.map((hit) => (
                  <div key={hit.subgraphId} className="rounded-2xl border border-[#dfe4e1] bg-[#f7f9f7] p-4">
                    <div className="font-medium">{hit.displayName ?? "Unnamed subgraph"}</div>
                    <div className="mt-1 font-mono text-xs text-[#68706c]">SUBGRAPH · OBSERVED · rank {hit.providerRank ?? "—"}</div>
                    <div className="mt-2 break-all text-xs text-[#8a918d]">{hit.subgraphId}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
