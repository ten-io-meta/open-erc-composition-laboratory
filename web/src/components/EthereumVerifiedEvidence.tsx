"use client";

import { useEffect, useState } from "react";

type VerifiedNetwork = {
  network: string;
  networkLabel: string;
  chainId: string;
  identityRegistry: string;
  indexedBlock: number | null;
  graphBlockHash: string | null;
  rpcBlockHash: string | null;
  deployment: string | null;
  status: "VERIFIED" | "NOT_VERIFIED" | "ERROR";
  chainMatch: boolean;
  blockHashMatch: boolean;
  runtimeCodePresent: boolean;
  ownerMatch: boolean;
  chainOwner: string | null;
  sampleAgent: {
    id: string | null;
    agentId: string | null;
    owner: string | null;
  } | null;
  error: string | null;
};

type VerificationResponse = {
  status: "VERIFIED" | "PARTIAL" | "ERROR" | "NOT_CONFIGURED";
  protocolId: string;
  identityRegistry: string;
  verifiedNetworks: number;
  totalNetworks: number;
  networks: VerifiedNetwork[];
};

function shortAddress(value: string | null) {
  if (!value) return "-";
  if (value.length <= 18) return value;

  return `${value.slice(0, 10)}...${value.slice(-8)}`;
}

export function EthereumVerifiedEvidence() {
  const [data, setData] =
    useState<VerificationResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/live/ethereum/agent0/verify",
        { cache: "no-store" }
      );

      const body =
        (await response.json()) as VerificationResponse;

      if (
        !response.ok &&
        body.status !== "NOT_CONFIGURED"
      ) {
        throw new Error(
          "Ethereum verification request failed."
        );
      }

      setData(body);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Ethereum verification request failed."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    fetch(
      "/api/live/ethereum/agent0/verify",
      { cache: "no-store" }
    )
      .then(async (response) => {
        const body =
          (await response.json()) as VerificationResponse;

        if (
          !response.ok &&
          body.status !== "NOT_CONFIGURED"
        ) {
          throw new Error(
            "Ethereum verification request failed."
          );
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
              : "Ethereum verification request failed."
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
    <section className="mt-6 rounded-[28px] border border-[#bfd7cc] bg-white p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#1e5d46]">
            Ethereum Verified Evidence
          </p>

          <h2 className="mt-2 text-2xl font-medium">
            The Graph observation cross-checked against chain state
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#68706c]">
            OECL independently queries Ethereum JSON-RPC at the exact block
            indexed by The Graph, then verifies network identity, block hash,
            ERC-8004 registry code and sampled agent ownership.
          </p>
        </div>

        <div className="text-right">
          <div className="font-mono text-xs text-[#68706c]">
            GRAPH &lt;-&gt; ETHEREUM RPC
          </div>

          <div className="mt-1 text-sm font-semibold text-[#1e5d46]">
            {loading
              ? "VERIFYING..."
              : data
                ? `${data.verifiedNetworks}/${data.totalNetworks} NETWORKS VERIFIED`
                : "UNAVAILABLE"}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-[#fff8f8] p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {data && data.networks.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {data.networks.map((network) => (
            <article
              key={`${network.network}-${network.chainId}`}
              className="rounded-[22px] border border-[#dfe4e1] bg-[#f7f9f7] p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-medium">
                    {network.networkLabel}
                  </div>

                  <div className="mt-1 font-mono text-xs text-[#68706c]">
                    CHAIN {network.chainId}
                  </div>
                </div>

                <div
                  className={
                    network.status === "VERIFIED"
                      ? "rounded-full bg-[#173f32] px-3 py-1.5 font-mono text-[10px] font-semibold text-white"
                      : "rounded-full bg-[#ece7d9] px-3 py-1.5 font-mono text-[10px] font-semibold text-[#65572b]"
                  }
                >
                  {network.status}
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-[#68706c]">
                    Indexed block
                  </span>
                  <span className="font-mono">
                    {network.indexedBlock?.toLocaleString() ?? "-"}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-[#68706c]">
                    Chain ID
                  </span>
                  <strong>
                    {network.chainMatch ? "MATCH" : "NO MATCH"}
                  </strong>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-[#68706c]">
                    Block hash
                  </span>
                  <strong>
                    {network.blockHashMatch ? "MATCH" : "NO MATCH"}
                  </strong>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-[#68706c]">
                    Registry runtime
                  </span>
                  <strong>
                    {network.runtimeCodePresent ? "PRESENT" : "ABSENT"}
                  </strong>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-[#68706c]">
                    Agent
                  </span>
                  <strong>
                    #{network.sampleAgent?.agentId ?? "-"}
                  </strong>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-[#68706c]">
                    ownerOf(agentId)
                  </span>
                  <strong>
                    {network.ownerMatch ? "MATCH" : "NO MATCH"}
                  </strong>
                </div>
              </div>

              <div className="mt-5 border-t border-[#dfe4e1] pt-4">
                <div className="text-xs text-[#68706c]">
                  The Graph owner
                </div>

                <div className="mt-1 font-mono text-xs">
                  {shortAddress(
                    network.sampleAgent?.owner ?? null
                  )}
                </div>

                <div className="mt-3 text-xs text-[#68706c]">
                  Ethereum ownerOf
                </div>

                <div className="mt-1 font-mono text-xs">
                  {shortAddress(network.chainOwner)}
                </div>
              </div>

              {network.error && (
                <div className="mt-4 text-xs text-[#8a6b20]">
                  {network.error}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-[#dfe4e1] bg-[#f7f9f7] p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#1e5d46]">
          Verification meaning
        </div>

        <p className="mt-2 max-w-5xl text-sm leading-6 text-[#68706c]">
          VERIFIED means The Graph indexed observation and an independent
          Ethereum JSON-RPC query agree at the same block on network identity,
          block hash, ERC-8004 registry presence and sampled agent ownership.
          It does not by itself establish cross-protocol compatibility.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="font-mono text-[11px] text-[#68706c]">
          IdentityRegistry: {data?.identityRegistry ?? "-"}
        </div>

        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="rounded-xl border border-[#bfc9c3] bg-white px-4 py-2 text-sm disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify again"}
        </button>
      </div>
    </section>
  );
}
