"use client";

import {
  useEffect,
  useState,
} from "react";


type PairEvaluation = {
  available: boolean;
  compatibility: string;
  harmony: string | null;
  compositionValue: string | null;
};


type Candidate = {
  candidateId: string;
  sourceParticipantId: string;
  targetParticipantId: string;
  kind: string;
  mechanism: string;
  foundationProtocolId: string | null;
  relation: string | null;
  evidenceCount: number;
  discoveryStatus: string;
  candidateStatus: string;
  pairEvaluation: PairEvaluation;
};


type SnapshotResponse = {
  status: string;
  candidateCount: number;
  candidates: Candidate[];
  note: string;
};


function pairSeparator(
  candidate: Candidate,
) {

  if (
    candidate.kind === "DOCUMENTARY_COMPOSITION" ||
    candidate.relation !== null
  ) {
    return "→";
  }

  return "×";
}


function basisLabel(
  candidate: Candidate,
) {

  if (
    candidate.relation !== null
  ) {
    return candidate.relation;
  }

  if (
    candidate.foundationProtocolId !== null
  ) {
    return `Shared ${candidate.foundationProtocolId}`;
  }

  return candidate.mechanism;
}


function evaluationLabel(
  candidate: Candidate,
) {

  if (
    !candidate.pairEvaluation.available
  ) {
    return "NOT MATERIALIZED";
  }

  return candidate.pairEvaluation.compatibility;
}


export function ScientificCorpusOverview() {

  const [
    result,
    setResult,
  ] =
    useState<SnapshotResponse | null>(
      null,
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );


  useEffect(
    () => {

      let cancelled =
        false;

      fetch(
        "/api/scientific/discovery",
      )
        .then(
          async response => {

            const body =
              await response.json();

            if (!response.ok) {
              throw new Error(
                body.message ??
                "Scientific snapshot request failed.",
              );
            }

            return body as SnapshotResponse;
          },
        )
        .then(
          body => {

            if (!cancelled) {
              setResult(body);
            }
          },
        )
        .catch(
          reason => {

            if (!cancelled) {
              setError(
                reason instanceof Error
                  ? reason.message
                  : "Scientific snapshot request failed.",
              );
            }
          },
        );

      return () => {
        cancelled = true;
      };
    },
    [],
  );


  if (error !== null) {
    return (
      <div className="mt-7 text-sm text-[#8a6b20]">
        {error}
      </div>
    );
  }


  if (result === null) {
    return (
      <div className="mt-7 font-mono text-xs text-[#68706c]">
        LOADING MATERIALIZED SCIENTIFIC SNAPSHOT...
      </div>
    );
  }


  return (
    <section className="mt-7">

      <div className="flex flex-wrap items-end justify-between gap-4">

        <div>
          <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#1e5d46]">
            Complete materialized candidate set
          </div>

          <div className="mt-1 text-sm text-[#68706c]">
            {result.candidateCount} candidates in the current OECL snapshot
          </div>
        </div>

        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#68706c]">
          NOT EXHAUSTIVE · NOT RANKED
        </div>

      </div>


      <div className="mt-4 rounded-2xl border border-[#e1ddd0] bg-[#fbfaf6] p-4">

        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#7a682d]">
          Coverage boundary
        </div>

        <p className="mt-2 max-w-5xl text-sm leading-6 text-[#68706c]">
          Every row below is a candidate already materialized in this OECL
          scientific snapshot. The snapshot is deterministic but not
          exhaustive. OECL does not rank listed candidates as more compatible
          than unlisted standards.
        </p>

      </div>


      <div className="mt-5 overflow-hidden rounded-2xl border border-[#dfe4e1] bg-white">

        <div className="hidden grid-cols-[1.35fr_1.6fr_0.65fr_0.9fr_1fr] gap-4 border-b border-[#e2e7e4] bg-[#f7f9f7] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.11em] text-[#68706c] md:grid">

          <div>Candidate</div>
          <div>Basis</div>
          <div>Evidence</div>
          <div>Candidate state</div>
          <div>Pair evaluation</div>

        </div>


        <div className="divide-y divide-[#e2e7e4]">

          {result.candidates.map(
            candidate => (

              <article
                key={candidate.candidateId}
                className="grid gap-4 px-5 py-4 md:grid-cols-[1.35fr_1.6fr_0.65fr_0.9fr_1fr] md:items-center"
              >

                <div>

                  <div className="font-medium">
                    {candidate.sourceParticipantId}
                    {" "}
                    {pairSeparator(candidate)}
                    {" "}
                    {candidate.targetParticipantId}
                  </div>

                  <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[#68706c]">
                    {candidate.kind}
                  </div>

                </div>


                <div>

                  <div className="md:hidden font-mono text-[9px] uppercase tracking-[0.1em] text-[#68706c]">
                    Basis
                  </div>

                  <div className="mt-1 text-sm md:mt-0">
                    {basisLabel(candidate)}
                  </div>

                </div>


                <div>

                  <div className="md:hidden font-mono text-[9px] uppercase tracking-[0.1em] text-[#68706c]">
                    Corpus evidence
                  </div>

                  <div className="mt-1 text-sm font-medium md:mt-0">
                    {candidate.evidenceCount}
                  </div>

                </div>


                <div>

                  <div className="md:hidden font-mono text-[9px] uppercase tracking-[0.1em] text-[#68706c]">
                    Candidate state
                  </div>

                  <span className="mt-1 inline-block rounded-full border border-[#d7ddda] bg-[#f7f9f7] px-2.5 py-1 text-[10px] font-semibold md:mt-0">
                    MATERIALIZED
                  </span>

                </div>


                <div>

                  <div className="md:hidden font-mono text-[9px] uppercase tracking-[0.1em] text-[#68706c]">
                    Pair evaluation
                  </div>

                  <span
                    className={
                      `mt-1 inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold md:mt-0 ${
                        candidate.pairEvaluation.available
                          ? "bg-[#ece7d9] text-[#65572b]"
                          : "bg-[#f1f3f2] text-[#68706c]"
                      }`
                    }
                  >
                    {evaluationLabel(candidate)}
                  </span>

                </div>

              </article>
            ),
          )}

        </div>

      </div>


      <div className="mt-4 grid gap-3 md:grid-cols-2">

        <div className="rounded-2xl border border-[#dfe4e1] bg-[#f7f9f7] p-4">

          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#68706c]">
            Candidate materialized
          </div>

          <p className="mt-2 text-sm leading-6 text-[#68706c]">
            OECL has enough corpus evidence to preserve this relationship as a
            research target. This is not a compatibility verdict.
          </p>

        </div>


        <div className="rounded-2xl border border-[#dfe4e1] bg-[#f7f9f7] p-4">

          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#68706c]">
            Pair evaluation
          </div>

          <p className="mt-2 text-sm leading-6 text-[#68706c]">
            A separate materialized evaluation exists only where OECL has
            actually run the pair-scoped scientific pipeline. Missing means
            not evaluated, not incompatible.
          </p>

        </div>

      </div>

    </section>
  );
}