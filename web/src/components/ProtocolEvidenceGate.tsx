"use client";

import { useEffect, useState } from "react";

type EvidenceNetwork = {
  network: string;
  networkLabel: string;
  chainId: string;

  primary: {
    protocolId: string;
    status: string;
    evidenceBasis: string | null;
  };

  candidate: {
    protocolId: string;
    sourceClaim: {
      status: string;
      statement: string | null;
      provenance: string | null;
      locatorStatus: string;
    };
    protocolStatus: string;
    candidateAddress: string | null;
    observedBlock: number | null;
    observedBlockHash: string | null;
    chainMatch: boolean | null;
    runtimeCodePresent: boolean | null;
    identityStatus: string;
    identityTests: Array<{
      criterionId: string;
      kind: string;
      interfaceId: string;
      provenance: string | null;
      status: string;
      observedValue: boolean | null;
      error: string | null;
    }>;
    error: string | null;
    evidenceBasis: string | null;
  };

  pairEligibility:
    | "ELIGIBLE_FOR_INTERACTION_SEARCH"
    | "NOT_ELIGIBLE_FOR_INTERACTION_SEARCH";
};

type EvidenceResponse = {
  status: string;
  rule: string;
  primaryProtocolId: string;
  candidateProtocolId: string;
  eligibleNetworks: number;
  totalNetworks: number;
  networks: EvidenceNetwork[];
};

function shortAddress(value: string | null) {
  if (!value) return "-";

  return value.length > 18
    ? `${value.slice(0, 10)}...${value.slice(-8)}`
    : value;
}

function displayStatus(value: string) {
  return value.replaceAll("_", " ");
}

export function ProtocolEvidenceGate() {
  const [data, setData] =
    useState<EvidenceResponse | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/live/evidence/eligibility",
        { cache: "no-store" }
      );

      const body =
        (await response.json()) as EvidenceResponse;

      if (!response.ok) {
        throw new Error(
          "Protocol evidence gate request failed."
        );
      }

      setData(body);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Protocol evidence gate request failed."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    fetch(
      "/api/live/evidence/eligibility",
      { cache: "no-store" }
    )
      .then(async (response) => {
        const body =
          (await response.json()) as EvidenceResponse;

        if (!response.ok) {
          throw new Error(
            "Protocol evidence gate request failed."
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
              : "Protocol evidence gate request failed."
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
    <section className="mt-6 rounded-[28px] border border-[#d7d5c7] bg-white p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#665f32]">
            Protocol Evidence Gate
          </p>

          <h2 className="mt-2 text-2xl font-medium">
            Evidence before composition
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#68706c]">
            Knowledge may identify where OECL should look.
            Only independently observable chain evidence can
            make a protocol pair eligible for interaction analysis.
          </p>
        </div>

        <div className="text-right">
          <div className="font-mono text-xs text-[#68706c]">
            {data
              ? `${data.primaryProtocolId} × ${data.candidateProtocolId}`
              : "PAIR EVIDENCE"}
          </div>

          <div className="mt-1 text-sm font-semibold text-[#665f32]">
            {loading
              ? "CHECKING..."
              : data
                ? `${data.eligibleNetworks}/${data.totalNetworks} CHAINS ELIGIBLE`
                : "UNAVAILABLE"}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-[#fff8f8] p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {data && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {data.networks.map((network) => {
            const eligible =
              network.pairEligibility ===
              "ELIGIBLE_FOR_INTERACTION_SEARCH";

            return (
              <article
                key={network.network}
                className="rounded-[22px] border border-[#dfe4e1] bg-[#f7f9f7] p-5"
              >
                <div className="flex items-center justify-between gap-3">
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
                      eligible
                        ? "rounded-full bg-[#173f32] px-3 py-1.5 font-mono text-[10px] font-semibold text-white"
                        : "rounded-full bg-[#ece7d9] px-3 py-1.5 font-mono text-[10px] font-semibold text-[#65572b]"
                    }
                  >
                    {eligible ? "ELIGIBLE" : "NOT ELIGIBLE"}
                  </div>
                </div>

                <div className="mt-5 border-t border-[#dfe4e1] pt-4">
                  <div className="font-mono text-xs text-[#68706c]">
                    {network.primary.protocolId}
                  </div>

                  <div className="mt-1 text-sm font-semibold">
                    {displayStatus(
                      network.primary.status
                    )}
                  </div>
                </div>

                <div className="mt-4 border-t border-[#dfe4e1] pt-4">
                  <div className="font-mono text-xs text-[#68706c]">
                    {network.candidate.protocolId}
                  </div>

                  <div className="mt-3 text-xs text-[#68706c]">
                    Source claim
                  </div>

                  <div className="mt-1 text-sm font-semibold">
                    {displayStatus(
                      network.candidate.sourceClaim.status
                    )}
                  </div>

                  {network.candidate.sourceClaim.statement && (
                    <div className="mt-2 rounded-xl border border-[#ded9c6] bg-[#fffdf5] p-3">
                      <div className="text-xs leading-5 text-[#5f604f]">
                        {network.candidate.sourceClaim.statement}
                      </div>

                      {network.candidate.sourceClaim.provenance && (
                        <div className="mt-2 font-mono text-[10px] text-[#68706c]">
                          source: {network.candidate.sourceClaim.provenance}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-2 font-mono text-[10px] text-[#68706c]">
                    {displayStatus(
                      network.candidate.sourceClaim.locatorStatus
                    )}
                  </div>

                  <div className="mt-4 text-xs text-[#68706c]">
                    On-chain candidate evidence
                  </div>

                  <div className="mt-1 text-sm font-semibold">
                    {displayStatus(
                      network.candidate.protocolStatus
                    )}
                  </div>

                  <div className="mt-3 text-xs text-[#68706c]">
                    Identity criterion
                  </div>

                  <div className="mt-1 text-sm font-semibold">
                    {displayStatus(
                      network.candidate.identityStatus
                    )}
                  </div>

                  {network.candidate.identityTests.map(
                    (test) => (
                      <div
                        key={test.criterionId}
                        className="mt-2 rounded-xl border border-[#dfe4e1] bg-white p-3"
                      >
                        <div className="font-mono text-[10px] text-[#68706c]">
                          {test.kind} {test.interfaceId}
                        </div>

                        <div className="mt-1 text-xs font-semibold">
                          {displayStatus(test.status)}
                        </div>

                        {test.provenance && (
                          <div className="mt-1 font-mono text-[10px] text-[#68706c]">
                            source: {test.provenance}
                          </div>
                        )}
                      </div>
                    )
                  )}

                  {network.candidate.observedBlock !== null && (
                    <div className="mt-2 font-mono text-[10px] text-[#68706c]">
                      observed block: {network.candidate.observedBlock.toLocaleString()}
                    </div>
                  )}

                  {network.candidate.candidateAddress && (
                    <div className="mt-2 font-mono text-[11px] text-[#68706c]">
                      {shortAddress(
                        network.candidate.candidateAddress
                      )}
                    </div>
                  )}

                  {network.candidate.error && (
                    <div className="mt-2 text-xs text-[#8a6b20]">
                      {network.candidate.error}
                    </div>
                  )}
                </div>

                <div className="mt-4 border-t border-[#dfe4e1] pt-4">
                  <div className="text-xs text-[#68706c]">
                    Next scientific operation
                  </div>

                  <div className="mt-1 text-sm font-medium">
                    {eligible
                      ? "Search for qualifying interaction"
                      : "Stop: insufficient protocol evidence"}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-[#dfe4e1] bg-[#f7f9f7] p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#665f32]">
          Scientific boundary
        </div>

        <p className="mt-2 text-sm leading-6 text-[#68706c]">
          A source claim is knowledge, not chain evidence. A claim may
          exist while its deployment locator remains unresolved.
          Runtime code at a candidate address is evidence of code,
          not proof of protocol identity. Identity criteria come from
          the evidence descriptor and are executed against Ethereum.
          ELIGIBLE requires those criteria to be satisfied and only
          permits OECL to search for a qualifying on-chain interaction;
          it does not establish compatibility or composition.
          NO EVIDENCE SOURCE does not mean that no deployment exists.
        </p>

        <p className="mt-3 font-mono text-[11px] text-[#68706c]">
          KNOWLEDGE DEFINES WHAT TO TEST — ETHEREUM DETERMINES WHETHER THE TEST PASSES
        </p>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="rounded-xl border border-[#bfc9c3] bg-white px-4 py-2 text-sm disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check evidence again"}
        </button>
      </div>
    </section>
  );
}
