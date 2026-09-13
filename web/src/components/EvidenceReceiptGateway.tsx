"use client";

import {
  useEffect,
  useState,
} from "react";


type Admission =
  | "ADMISSIBLE"
  | "REJECTED"
  | "INCOMPLETE";


type Verdict =
  | "VERIFIED"
  | "MISMATCH"
  | "INCOMPLETE";


type Receipt = {
  observer: {
    network: string;
    chainId: string;
    indexedBlock: {
      number: number | null;
      hash: string | null;
    };
  };

  checks: {
    observerEvidence: string;
    witnessEvidence: string;
    chainId: string;
    blockHash: string;
    registryRuntime: string;
    ownerOf: string;
  };

  verdict: Verdict;
  admission: Admission;
  reasons: string[];
};


type Bundle = {
  schemaVersion: string;
  protocolId: string;
  standardizedObservation: string;

  coverage:
    | "NONE"
    | "PARTIAL"
    | "COMPLETE";

  networksTargeted: number;
  totalReceipts: number;

  admissibleCount: number;
  rejectedCount: number;
  incompleteCount: number;

  evidenceState:
    | "ALL_ADMISSIBLE"
    | "HAS_REJECTIONS"
    | "INCOMPLETE";

  compatibilityConclusion:
    "NOT_ESTABLISHED";

  receipts: Receipt[];
};


function networkLabel(
  network: string
) {

  if (network === "ethereum") return "Ethereum";
  if (network === "base") return "Base";
  if (network === "bsc") return "BNB Chain";
  if (network === "polygon") return "Polygon";
  if (network === "monad") return "Monad";

  return network;
}


function statusDot(
  admission: Admission
) {

  if (admission === "ADMISSIBLE") {
    return "bg-[#174c38]";
  }

  if (admission === "REJECTED") {
    return "bg-[#9b3128]";
  }

  return "bg-[#a8873c]";
}


function statusText(
  admission: Admission
) {

  if (admission === "ADMISSIBLE") {
    return "text-[#174c38]";
  }

  if (admission === "REJECTED") {
    return "text-[#9b3128]";
  }

  return "text-[#806921]";
}


export function EvidenceReceiptGateway() {

  const [
    data,
    setData,
  ] =
    useState<Bundle | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );


  async function load() {

    setLoading(true);
    setError(null);

    try {

      const response =
        await fetch(
          "/api/live/evidence/erc8004",
          {
            cache: "no-store",
          }
        );

      const body =
        (await response.json()) as Bundle;

      if (!response.ok) {
        throw new Error(
          "Evidence receipt request failed."
        );
      }

      setData(body);

    } catch (cause) {

      setError(
        cause instanceof Error
          ? cause.message
          : "Evidence receipt request failed."
      );

    } finally {

      setLoading(false);

    }
  }


  useEffect(
    () => {

      let cancelled =
        false;

      fetch(
        "/api/live/evidence/erc8004",
        {
          cache: "no-store",
        }
      )
        .then(
          async response => {

            const body =
              (await response.json()) as Bundle;

            if (!response.ok) {
              throw new Error(
                "Evidence receipt request failed."
              );
            }

            if (!cancelled) {
              setData(body);
            }
          }
        )
        .catch(
          cause => {

            if (!cancelled) {
              setError(
                cause instanceof Error
                  ? cause.message
                  : "Evidence receipt request failed."
              );
            }
          }
        )
        .finally(
          () => {

            if (!cancelled) {
              setLoading(false);
            }
          }
        );

      return () => {
        cancelled = true;
      };

    },
    []
  );


  return (
    <section className="mt-16 overflow-hidden rounded-[32px] border border-[#d7dad5] bg-[#fcfcfa]">

      <div className="border-b border-[#dfe1dc] px-6 py-7 md:px-9">

        <div className="flex flex-wrap items-start justify-between gap-7">

          <div className="max-w-3xl">

            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#174c38]">
              Verified Evidence Gateway
            </div>

            <h2 className="mt-3 text-3xl font-medium tracking-[-0.035em] md:text-[40px] md:leading-[1.05]">
              One observation.
              <br />
              Five independent receipts.
            </h2>

            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#70746f]">
              OECL reuses one standardized ERC-8004 observation across five
              mainnet targets, checks each result against independent chain
              state, and emits one machine-readable EvidenceReceipt per network.
            </p>

          </div>


          <div className="min-w-[230px] border-l border-[#dfe1dc] pl-6">

            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#8a8e88]">
              Receipt schema
            </div>

            <div className="mt-2 break-all font-mono text-[11px] leading-5 text-[#303430]">
              OECL_EVIDENCE_RECEIPT_V1
            </div>

            <div className="mt-5 font-mono text-[9px] uppercase tracking-[0.18em] text-[#8a8e88]">
              Admission policy
            </div>

            <div className="mt-2 font-mono text-[11px] leading-5 text-[#303430]">
              OECL_EVIDENCE_ADMISSION_V1
            </div>

          </div>

        </div>

      </div>


      <div className="grid border-b border-[#dfe1dc] sm:grid-cols-2 lg:grid-cols-5">

        <div className="border-b border-[#dfe1dc] px-6 py-6 md:border-b-0 md:border-r md:px-9">

          <div className="font-mono text-[9px] uppercase tracking-[0.17em] text-[#8a8e88]">
            Standardized query
          </div>

          <div className="mt-2 text-[34px] font-medium tracking-[-0.04em]">
            1
          </div>

        </div>


        <div className="border-b border-[#dfe1dc] px-6 py-6 lg:border-b-0 lg:border-r lg:px-9">

          <div className="font-mono text-[9px] uppercase tracking-[0.17em] text-[#8a8e88]">
            Network targets
          </div>

          <div className="mt-2 text-[34px] font-medium tracking-[-0.04em]">
            {data?.networksTargeted ?? "5"}
          </div>

        </div>


        <div className="border-b border-[#dfe1dc] px-6 py-6 lg:border-b-0 lg:border-r lg:px-9">

          <div className="font-mono text-[9px] uppercase tracking-[0.17em] text-[#8a8e88]">
            Evidence receipts
          </div>

          <div className="mt-2 text-[34px] font-medium tracking-[-0.04em]">
            {data?.totalReceipts ?? "—"}
          </div>

        </div>


        <div className="border-b border-[#dfe1dc] px-6 py-6 md:border-b-0 md:border-r md:px-9">

          <div className="font-mono text-[9px] uppercase tracking-[0.17em] text-[#8a8e88]">
            Admissible receipts
          </div>

          <div className="mt-2 text-[34px] font-medium tracking-[-0.04em] text-[#174c38]">
            {data?.admissibleCount ?? "—"}
          </div>

        </div>


        <div className="px-6 py-6 md:px-9">

          <div className="font-mono text-[9px] uppercase tracking-[0.17em] text-[#8a8e88]">
            Coverage
          </div>

          <div className="mt-3 font-mono text-[13px] font-semibold tracking-[0.08em]">
            {loading
              ? "OBSERVING"
              : data?.coverage ?? "UNAVAILABLE"}
          </div>

          {data && (
            <div className="mt-2 font-mono text-[9px] leading-4 text-[#8a8e88]">
              {data.admissibleCount} admissible ·{" "}
              {data.rejectedCount} rejected ·{" "}
              {data.incompleteCount} incomplete
            </div>
          )}

        </div>

      </div>


      {error && (

        <div className="border-b border-[#dfe1dc] px-6 py-4 text-sm text-[#9b3128] md:px-9">
          {error}
        </div>

      )}


      <div className="px-6 py-3 md:px-9">

        <div className="hidden grid-cols-[1.3fr_.6fr_1fr_1fr_1fr_1fr] border-b border-[#e4e6e2] py-3 font-mono text-[9px] uppercase tracking-[0.14em] text-[#949891] md:grid">

          <div>Network</div>
          <div>Chain</div>
          <div>Observer</div>
          <div>Witness</div>
          <div>Verdict</div>
          <div>Admission</div>

        </div>


        {data?.receipts.map(
          receipt => (

            <div
              key={`${receipt.observer.network}-${receipt.observer.chainId}`}
              className="grid gap-3 border-b border-[#e7e9e5] py-5 last:border-b-0 md:grid-cols-[1.3fr_.6fr_1fr_1fr_1fr_1fr] md:items-center"
            >

              <div>

                <div className="text-[15px] font-medium">
                  {networkLabel(
                    receipt.observer.network
                  )}
                </div>

                <div className="mt-1 font-mono text-[10px] text-[#949891] md:hidden">
                  Chain {receipt.observer.chainId}
                </div>

              </div>


              <div className="hidden font-mono text-[11px] text-[#686d67] md:block">
                {receipt.observer.chainId}
              </div>


              <div className="font-mono text-[10px] text-[#686d67]">
                {receipt.checks.observerEvidence}
              </div>


              <div className="font-mono text-[10px] text-[#686d67]">
                {receipt.checks.witnessEvidence}
              </div>


              <div className="font-mono text-[10px] text-[#303430]">
                {receipt.verdict}
              </div>


              <div
                className={`flex items-center gap-2 font-mono text-[10px] font-semibold ${statusText(
                  receipt.admission
                )}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${statusDot(
                    receipt.admission
                  )}`}
                />

                {receipt.admission}
              </div>


              {receipt.reasons.length > 0 && (

                <div className="font-mono text-[9px] leading-4 text-[#8a7650] md:col-span-6">
                  {receipt.reasons
                    .map(reason =>
                      reason === "OBSERVER_EVIDENCE_UNAVAILABLE"
                        ? "Observer evidence unavailable"
                        : reason
                    )
                    .join(" · ")}
                </div>

              )}

            </div>

          )
        )}

      </div>


      <div className="grid border-t border-[#dfe1dc] md:grid-cols-2">

        <div className="border-b border-[#dfe1dc] px-6 py-6 md:border-b-0 md:border-r md:px-9">

          <div className="font-mono text-[9px] uppercase tracking-[0.17em] text-[#174c38]">
            Deterministic policy
          </div>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#70746f]">
            Agreement becomes ADMISSIBLE. A contradiction becomes REJECTED.
            Missing observer or witness evidence remains INCOMPLETE.
          </p>

        </div>


        <div className="px-6 py-6 md:px-9">

          <div className="font-mono text-[9px] uppercase tracking-[0.17em] text-[#174c38]">
            Designed to be consumed by
          </div>

          <p className="mt-3 text-sm leading-6 text-[#303430]">
            Agents · research systems · composition engines · audit tooling
          </p>

        </div>

      </div>


      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#dfe1dc] bg-[#f6f6f2] px-6 py-4 md:px-9">

        <div className="font-mono text-[10px] text-[#777b75]">
          /api/live/evidence/erc8004
        </div>

        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="border-b border-[#222622] pb-0.5 text-xs font-medium transition-opacity hover:opacity-60 disabled:opacity-40"
        >
          {loading
            ? "Refreshing evidence"
            : "Refresh live evidence"}
        </button>

      </div>

    </section>
  );
}