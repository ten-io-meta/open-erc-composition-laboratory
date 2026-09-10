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

type InspectionResponse = {
  status: "LIVE" | "ERROR" | "NOT_CONFIGURED" | "INVALID_REQUEST";
  subgraphId?: string;
  providerMode?: string;
  inspectionStatus?: string;
  schema?: {
    status: string;
    hash: string;
    characters: number;
  };
  activity?: {
    status: string;
    dataPoints: number;
    totalQueries: number;
  };
  nextAction?: string;
  errors?: string[];
};

export function ProtocolDiscovery() {
  const [protocol, setProtocol] = useState("ERC-8004");
  const [result, setResult] = useState<DiscoveryResponse | null>(null);
  const [inspection, setInspection] = useState<InspectionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [inspecting, setInspecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runDiscovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setInspection(null);

    try {
      const response = await fetch(
        `/api/live/the-graph/discover?protocol=${encodeURIComponent(protocol.trim())}`,
        { cache: "no-store" }
      );

      setResult((await response.json()) as DiscoveryResponse);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Discovery request failed.");
    } finally {
      setLoading(false);
    }
  }

  async function inspectHit(hit: DiscoveryHit) {
    if (!hit.ipfsHash) return;

    setInspecting(hit.subgraphId);
    setInspection(null);

    try {
      const params = new URLSearchParams({
        subgraphId: hit.subgraphId,
        ipfsHash: hit.ipfsHash,
      });

      const response = await fetch(
        `/api/live/the-graph/inspect?${params.toString()}`,
        { cache: "no-store" }
      );

      setInspection((await response.json()) as InspectionResponse);
    } catch {
      setInspection({ status: "ERROR" });
    } finally {
      setInspecting(null);
    }
  }

  const hits = result?.searches.flatMap((search) => search.hits) ?? [];

  return (
    <section className="mx-auto mt-12 max-w-[1500px]">
      <div className="rounded-[28px] border border-[#dfe4e1] bg-white p-7 md:p-9">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#1e5d46]">
          Live Protocol Discovery
        </p>

        <h2 className="mt-2 text-2xl font-medium">
          Search The Graph from OECL
        </h2>

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
            <div className="flex items-center justify-between gap-3">
              <strong>{result.protocolId}</strong>
              <span className="font-mono text-xs text-[#1e5d46]">
                {result.status} · THE GRAPH
              </span>
            </div>

            {hits.length === 0 ? (
              <p className="mt-4 text-sm text-[#68706c]">
                0 subgraphs discovered. No attribution or compatibility conclusion was made.
              </p>
            ) : (
              <div className="mt-4 grid gap-3">
                {hits.map((hit) => (
                  <div
                    key={hit.subgraphId}
                    className="rounded-2xl border border-[#dfe4e1] bg-[#f7f9f7] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="font-medium">
                          {hit.displayName ?? "Unnamed subgraph"}
                        </div>

                        <div className="mt-1 font-mono text-xs text-[#68706c]">
                          SUBGRAPH · OBSERVED · rank {hit.providerRank ?? "—"}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={!hit.ipfsHash || inspecting === hit.subgraphId}
                        onClick={() => inspectHit(hit)}
                        className="rounded-xl border border-[#bfc9c3] bg-white px-4 py-2 text-sm disabled:opacity-50"
                      >
                        {inspecting === hit.subgraphId ? "Inspecting..." : "Inspect"}
                      </button>
                    </div>

                    <div className="mt-2 break-all text-xs text-[#8a918d]">
                      {hit.subgraphId}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {inspection && (
              <div className="mt-5 rounded-2xl border border-[#cfe0d8] bg-[#f2f8f5] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <strong>Subgraph Inspection</strong>
                  <span className="font-mono text-xs text-[#1e5d46]">
                    {inspection.status} · {inspection.inspectionStatus ?? "—"}
                  </span>
                </div>

                {inspection.status === "LIVE" ? (
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <div className="text-[#68706c]">Schema</div>
                      <div>{inspection.schema?.characters ?? 0} characters</div>
                    </div>

                    <div>
                      <div className="text-[#68706c]">30-day queries</div>
                      <div>{inspection.activity?.totalQueries ?? 0}</div>
                    </div>

                    <div>
                      <div className="text-[#68706c]">Next action</div>
                      <div>{inspection.nextAction ?? "—"}</div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[#68706c]">
                    Inspection could not be completed.
                  </p>
                )}

                <p className="mt-4 text-xs leading-5 text-[#68706c]">
                  INSPECTED means metadata was acquired for this exact deployment.
                  It does not establish protocol attribution, compatibility, or composition.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
