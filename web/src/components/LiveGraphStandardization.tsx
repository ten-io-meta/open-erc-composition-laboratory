"use client";

import { useEffect, useState } from "react";

type NetworkObservation = {
  network: string;
  chainId: string;
  status: "LIVE" | "ERROR";
  provider: string;
  providerMode: string;
  productId: string;
  schemaId: string | null;
  fetchedAt: string | null;
  indexedBlock: {
    number: number;
    hash?: string;
  } | null;
  deployment: string | null;
  agentCount: number;
  hasIndexingErrors: boolean | null;
  errors: string[];
};

type MultichainResponse = {
  status: "LIVE" | "PARTIAL" | "ERROR" | "NOT_CONFIGURED";
  protocolId: string;
  standardizedQuery: boolean;
  schemaId?: string;
  networksRequested: number;
  networksLive: number;
  networks: NetworkObservation[];
};

function networkLabel(network: string) {
  if (network === "ethereum") return "Ethereum";
  if (network === "base") return "Base";
  if (network === "polygon") return "Polygon";

  return network;
}

export function LiveGraphStandardization() {
  const [data, setData] = useState<MultichainResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/live/the-graph/agent0/multichain",
        { cache: "no-store" }
      );

      const body = (await response.json()) as MultichainResponse;

      if (!response.ok && body.status !== "NOT_CONFIGURED") {
        throw new Error("Live multi-chain observation failed.");
      }

      setData(body);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Live multi-chain observation failed."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    fetch(
      "/api/live/the-graph/agent0/multichain",
      { cache: "no-store" }
    )
      .then(async (response) => {
        const body = (await response.json()) as MultichainResponse;

        if (!response.ok && body.status !== "NOT_CONFIGURED") {
          throw new Error("Live multi-chain observation failed.");
        }

        if (!cancelled) {
          setData(body);
        }
      })
      .catch((cause) => {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Live multi-chain observation failed."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mt-8 rounded-[28px] border border-[#cfe0d8] bg-[#f5f9f7] p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#1e5d46]">
            Live Ethereum Observation
          </p>

          <h2 className="mt-2 text-2xl font-medium">
            Standardized ERC-8004 data powered by The Graph
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#68706c]">
            One GraphQL model and one query are reused across multiple live networks.
            OECL keeps these observations separate from compatibility and scientific support.
          </p>
        </div>

        <div className="text-right">
          <div className="font-mono text-xs text-[#68706c]">
            {data?.schemaId ?? "AGENT0-ERC8004"}
          </div>

          <div className="mt-1 text-sm font-medium text-[#1e5d46]">
            {loading
              ? "OBSERVING..."
              : data
                ? `${data.networksLive}/${data.networksRequested} NETWORKS LIVE`
                : "UNAVAILABLE"}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-white p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {data?.status === "NOT_CONFIGURED" && (
        <div className="mt-5 rounded-2xl border border-[#dfe4e1] bg-white p-4 text-sm text-[#68706c]">
          The Graph live provider is not configured.
        </div>
      )}

      {data && data.networks.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {data.networks.map((observation) => (
            <article
              key={`${observation.network}-${observation.chainId}`}
              className="rounded-[22px] border border-[#dfe4e1] bg-white p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-medium">
                    {networkLabel(observation.network)}
                  </div>

                  <div className="mt-1 font-mono text-xs text-[#68706c]">
                    CHAIN {observation.chainId}
                  </div>
                </div>

                <div className="font-mono text-xs text-[#1e5d46]">
                  {observation.status}
                </div>
              </div>

              <dl className="mt-5 grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#68706c]">Indexed block</dt>
                  <dd className="font-mono">
                    {observation.indexedBlock?.number?.toLocaleString() ?? "—"}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#68706c]">Agents sampled</dt>
                  <dd className="font-mono">{observation.agentCount}</dd>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#68706c]">Indexing errors</dt>
                  <dd className="font-mono">
                    {observation.hasIndexingErrors === false
                      ? "NONE"
                      : observation.hasIndexingErrors === true
                        ? "YES"
                        : "—"}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 border-t border-[#edf0ee] pt-4">
                <div className="text-xs text-[#68706c]">Subgraph deployment</div>
                <div className="mt-1 break-all font-mono text-[11px] leading-5 text-[#8a918d]">
                  {observation.deployment ?? "NOT OBSERVED"}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#dfe4e1] pt-5">
        <p className="max-w-4xl text-xs leading-5 text-[#68706c]">
          The Graph supplies live indexed observations with deployment and block provenance.
          Observation alone does not establish cross-protocol compatibility, composition, or SUPPORT.
        </p>

        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="rounded-xl border border-[#bfc9c3] bg-white px-4 py-2 text-sm disabled:opacity-50"
        >
          {loading ? "Observing..." : "Refresh live state"}
        </button>
      </div>
    </section>
  );
}
