"use client";

import { useEffect, useState } from "react";

type DiscoveryCandidate = {
  candidateId: string;
  protocols: string[];
  sourceParticipantId: string;
  targetParticipantId: string;
  counterpartId: string;
  kind:
    | "STRUCTURAL_FOUNDATION"
    | "DOCUMENTARY_COMPOSITION";
  mechanism: string;
  directionality: string | null;
  foundationProtocolId: string | null;
  relation: string | null;
  evidenceCount: number;
  evidenceIds: string[];
  provenance: unknown[];
  discoveryStatus: string;
  evaluatedResult: string | null;
};

type DiscoveryResponse = {
  status: string;
  scientificScope: string;
  protocolId: string;
  candidateCount: number;
  candidates: DiscoveryCandidate[];
  errors: string[];
  generatedAt: string;
  note: string;
};

function pairLabel(candidate: DiscoveryCandidate) {
  if (
    candidate.kind === "DOCUMENTARY_COMPOSITION" &&
    candidate.sourceParticipantId !==
      candidate.targetParticipantId
  ) {
    return `${candidate.sourceParticipantId} -> ${candidate.targetParticipantId}`;
  }

  return candidate.protocols.join(" x ");
}

export function ScientificDiscoveryResults({
  protocolId,
}: {
  protocolId: string;
}) {
  const [result, setResult] =
    useState<DiscoveryResponse | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function discover() {
      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const response = await fetch(
          `/api/scientific/discovery?protocol=${encodeURIComponent(
            protocolId,
          )}`,
          {
            cache: "no-store",
          },
        );

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(
            payload.message ??
              "Scientific discovery request failed.",
          );
        }

        if (!Array.isArray(payload.candidates)) {
          throw new Error(
            "Scientific discovery returned an invalid projection.",
          );
        }

        if (!cancelled) {
          setResult(payload as DiscoveryResponse);
        }
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Scientific discovery request failed.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    discover();

    return () => {
      cancelled = true;
    };
  }, [protocolId]);

  if (loading) {
    return (
      <div className="font-mono text-xs text-[#1e5d46]">
        OECL SCIENTIFIC DISCOVERY
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="font-mono text-xs text-[#8a3d32]">
          DISCOVERY ERROR
        </div>

        <p className="mt-2 text-sm text-[#68706c]">
          {error}
        </p>
      </div>
    );
  }

  if (result === null) {
    return null;
  }

  if (result.candidates.length === 0) {
    return (
      <div>
        <div className="font-mono text-xs text-[#8a6b20]">
          NO DISCOVERED CANDIDATE
        </div>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68706c]">
          {result.note}
        </p>

        <div className="mt-3 font-mono text-[10px] text-[#7d8580]">
          CURRENT MATERIALIZED SCIENTIFIC CORPUS
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="font-mono text-xs text-[#1e5d46]">
            DISCOVERED COMPOSITION CANDIDATES
          </div>

          <div className="mt-1 text-sm text-[#68706c]">
            {result.candidateCount} candidate
            {result.candidateCount === 1 ? "" : "s"} involving{" "}
            <strong>{result.protocolId}</strong>
          </div>
        </div>

        <div className="font-mono text-[10px] text-[#7d8580]">
          DISCOVERY != COMPATIBILITY
        </div>
      </div>

      <div className="divide-y divide-[#e2e7e4] overflow-hidden rounded-2xl border border-[#dfe4e1] bg-white">
        {result.candidates.map((candidate) => (
          <article
            key={candidate.candidateId}
            className="px-4 py-4 md:px-5"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-medium">
                    {candidate.counterpartId}
                  </span>

                  <span className="rounded-full border border-[#d7ddda] bg-[#f7f9f7] px-2.5 py-1 font-mono text-[10px] text-[#55605a]">
                    {candidate.kind}
                  </span>

                  <span className="rounded-full bg-[#ece7d9] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#65572b]">
                    {candidate.discoveryStatus}
                  </span>
                </div>

                <div className="mt-1 font-mono text-[11px] text-[#7d8580]">
                  {pairLabel(candidate)}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-[#d7ddda] bg-[#f7f9f7] px-3 py-1.5">
                  Mechanism:{" "}
                  <strong>{candidate.mechanism}</strong>
                </span>

                {candidate.foundationProtocolId !== null && (
                  <span className="rounded-full border border-[#d7ddda] bg-[#f7f9f7] px-3 py-1.5">
                    Foundation:{" "}
                    <strong>
                      {candidate.foundationProtocolId}
                    </strong>
                  </span>
                )}

                {candidate.relation !== null && (
                  <span className="rounded-full border border-[#d7ddda] bg-[#f7f9f7] px-3 py-1.5">
                    Relation:{" "}
                    <strong>{candidate.relation}</strong>
                  </span>
                )}

                <span className="rounded-full border border-[#d7ddda] bg-[#f7f9f7] px-3 py-1.5">
                  Evidence:{" "}
                  <strong>{candidate.evidenceCount}</strong>
                </span>
              </div>
            </div>

            <details className="mt-3">
              <summary className="cursor-pointer select-none font-mono text-[10px] uppercase tracking-[0.12em] text-[#1e5d46]">
                Open candidate details
              </summary>

              <div className="mt-3 rounded-xl bg-[#f7f9f7] p-4">
                <div className="grid gap-3 text-xs md:grid-cols-2">
                  <div>
                    <div className="font-mono text-[10px] uppercase text-[#7d8580]">
                      Candidate kind
                    </div>
                    <div className="mt-1">
                      {candidate.kind}
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-[10px] uppercase text-[#7d8580]">
                      Mechanism
                    </div>
                    <div className="mt-1">
                      {candidate.mechanism}
                    </div>
                  </div>

                  {candidate.foundationProtocolId !== null && (
                    <div>
                      <div className="font-mono text-[10px] uppercase text-[#7d8580]">
                        Foundation
                      </div>
                      <div className="mt-1">
                        {candidate.foundationProtocolId}
                      </div>
                    </div>
                  )}

                  {candidate.relation !== null && (
                    <div>
                      <div className="font-mono text-[10px] uppercase text-[#7d8580]">
                        Relation
                      </div>
                      <div className="mt-1">
                        {candidate.relation}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="font-mono text-[10px] uppercase text-[#7d8580]">
                      Discovery status
                    </div>
                    <div className="mt-1">
                      {candidate.discoveryStatus}
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-[10px] uppercase text-[#7d8580]">
                      Evaluated result
                    </div>
                    <div className="mt-1">
                      {candidate.evaluatedResult ??
                        "Not evaluated in this discovery projection"}
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-[10px] uppercase text-[#7d8580]">
                      Evidence
                    </div>
                    <div className="mt-1">
                      {candidate.evidenceCount} candidate-specific evidence item
                      {candidate.evidenceCount === 1 ? "" : "s"}
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-[10px] uppercase text-[#7d8580]">
                      Directionality
                    </div>
                    <div className="mt-1">
                      {candidate.directionality ?? "UNSPECIFIED"}
                    </div>
                  </div>
                </div>

                <details className="mt-4 border-t border-[#dfe4e1] pt-3">
                  <summary className="cursor-pointer font-mono text-[10px] text-[#68706c]">
                    Scientific identity
                  </summary>

                  <div className="mt-2 break-all font-mono text-[10px] leading-5 text-[#68706c]">
                    candidateId: {candidate.candidateId}
                  </div>
                </details>
              </div>
            </details>
          </article>
        ))}
      </div>

      <p className="mt-4 max-w-3xl text-xs leading-5 text-[#68706c]">
        {result.note}
      </p>
    </div>
  );
}
