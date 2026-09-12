"use client";

import {
  useEffect,
  useState,
} from "react";


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
  status:
    | "VERIFIED"
    | "PARTIAL"
    | "ERROR"
    | "NOT_CONFIGURED";

  protocolId: string;
  identityRegistry: string;
  verifiedNetworks: number;
  totalNetworks: number;
  networks: VerifiedNetwork[];
};


function shortAddress(
  value: string | null,
) {

  if (!value) {
    return "-";
  }

  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 10)}...${value.slice(-8)}`;
}


function shortHash(
  value: string | null,
) {

  if (!value) {
    return "-";
  }

  if (value.length <= 26) {
    return value;
  }

  return `${value.slice(0, 14)}...${value.slice(-10)}`;
}


function verificationLabel(
  checked: boolean,
  positiveLabel: string,
  negativeLabel: string,
  unavailable: boolean,
) {

  if (unavailable) {
    return "NOT CHECKED";
  }

  return checked
    ? positiveLabel
    : negativeLabel;
}


export function EthereumVerifiedEvidence() {

  const [
    data,
    setData,
  ] =
    useState<VerificationResponse | null>(
      null,
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
      null,
    );


  async function refresh() {

    setLoading(true);
    setError(null);

    try {

      const response =
        await fetch(
          "/api/live/ethereum/agent0/verify",
          {
            cache: "no-store",
          },
        );

      const body =
        (await response.json()) as VerificationResponse;

      if (
        !response.ok &&
        body.status !== "NOT_CONFIGURED"
      ) {
        throw new Error(
          "Chain verification request failed.",
        );
      }

      setData(body);

    } catch (cause) {

      setError(
        cause instanceof Error
          ? cause.message
          : "Chain verification request failed.",
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
        "/api/live/ethereum/agent0/verify",
        {
          cache: "no-store",
        },
      )
        .then(
          async response => {

            const body =
              (await response.json()) as VerificationResponse;

            if (
              !response.ok &&
              body.status !== "NOT_CONFIGURED"
            ) {
              throw new Error(
                "Chain verification request failed.",
              );
            }

            if (!cancelled) {
              setData(body);
            }
          },
        )
        .catch(
          cause => {

            if (!cancelled) {
              setError(
                cause instanceof Error
                  ? cause.message
                  : "Chain verification request failed.",
              );
            }
          },
        )
        .finally(
          () => {

            if (!cancelled) {
              setLoading(false);
            }
          },
        );

      return () => {
        cancelled = true;
      };
    },
    [],
  );


  const allVerified =
    data !== null &&
    data.totalNetworks > 0 &&
    data.status === "VERIFIED" &&
    data.verifiedNetworks === data.totalNetworks;


  const decision =
    loading
      ? "VERIFYING LIVE EVIDENCE"
      : allVerified
        ? "ADMISSIBLE AS VERIFIED PROTOCOL-STATE EVIDENCE"
        : data?.status === "PARTIAL"
          ? "PARTIAL VERIFICATION — EVIDENCE INCOMPLETE"
          : data?.status === "NOT_CONFIGURED"
            ? "VERIFICATION NOT CONFIGURED"
            : "VERIFIED EVIDENCE NOT AVAILABLE";


  return (
    <section className="mt-6 rounded-[28px] border border-[#bfd7cc] bg-white p-6 md:p-8">


      <div className="flex flex-wrap items-start justify-between gap-5">

        <div>

          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#1e5d46]">
            Evidence decision
          </p>

          <h2 className="mt-2 max-w-4xl text-2xl font-medium">
            The chain decides whether The Graph observation matches reality
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-[#68706c]">
            OECL queries each blockchain independently at the exact block
            indexed by The Graph. The resulting facts determine whether the
            observation can be treated as verified live protocol-state
            evidence.
          </p>

        </div>


        <button
          type="button"
          onClick={
            () =>
              void refresh()
          }
          disabled={loading}
          className="rounded-xl border border-[#bfc9c3] bg-white px-4 py-2 text-sm disabled:opacity-50"
        >
          {loading
            ? "Verifying..."
            : "Verify live state"}
        </button>

      </div>


      <div
        className={
          `mt-6 rounded-[22px] border p-6 ${
            allVerified
              ? "border-[#9fc6b5] bg-[#edf7f2]"
              : "border-[#e1ddd0] bg-[#fbfaf6]"
          }`
        }
      >

        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#68706c]">
          Current decision
        </div>

        <div
          className={
            `mt-2 text-xl font-semibold ${
              allVerified
                ? "text-[#173f32]"
                : "text-[#65572b]"
            }`
          }
        >
          {decision}
        </div>


        <div className="mt-5 grid gap-3 md:grid-cols-4">

          <div className="rounded-xl border border-[#d7dfda] bg-white p-4">

            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#68706c]">
              Networks
            </div>

            <div className="mt-2 text-lg font-medium">
              {data
                ? `${data.verifiedNetworks}/${data.totalNetworks} verified`
                : loading
                  ? "checking..."
                  : "unavailable"}
            </div>

          </div>


          <div className="rounded-xl border border-[#d7dfda] bg-white p-4">

            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#68706c]">
              Observation integrity
            </div>

            <div className="mt-2 text-lg font-medium">
              {allVerified
                ? "VERIFIED"
                : loading
                  ? "CHECKING"
                  : data?.status ?? "UNAVAILABLE"}
            </div>

          </div>


          <div className="rounded-xl border border-[#d7dfda] bg-white p-4">

            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#68706c]">
              Verified input
            </div>

            <div className="mt-2 text-lg font-medium">
              {allVerified
                ? "AVAILABLE"
                : "NOT COMPLETE"}
            </div>

          </div>


          <div className="rounded-xl border border-[#d7dfda] bg-white p-4">

            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#68706c]">
              Compatibility
            </div>

            <div className="mt-2 text-lg font-medium">
              NOT ESTABLISHED
            </div>

          </div>

        </div>


        <div className="mt-5 grid gap-3 md:grid-cols-2">

          <div className="rounded-xl border border-[#d7dfda] bg-white p-4">

            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#1e5d46]">
              What this means
            </div>

            <p className="mt-2 text-sm leading-6 text-[#68706c]">
              {allVerified
                ? "The Graph observation agrees with independent chain state at the exact indexed blocks. OECL can preserve it as verified protocol-state evidence for later scientific analysis."
                : "OECL preserves uncertainty until the required chain checks complete successfully."}
            </p>

          </div>


          <div className="rounded-xl border border-[#d7dfda] bg-white p-4">

            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#7a682d]">
              What this does not mean
            </div>

            <p className="mt-2 text-sm leading-6 text-[#68706c]">
              Verified protocol presence does not establish compatibility,
              interaction or composition with another ERC.
            </p>

          </div>

        </div>


        <div className="mt-3 rounded-xl border border-[#a9cbbb] bg-white p-4">

          <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#1e5d46]">
            Impact on OECL
          </div>

          <p className="mt-2 max-w-5xl text-sm leading-6 text-[#68706c]">
            {allVerified
              ? "This live ERC-8004 observation is now admissible as verified protocol-state evidence for subsequent OECL research. It does not rewrite or modify the frozen V2.1 scientific snapshot shown below."
              : "This observation cannot advance as verified evidence until the required independent chain checks succeed. The V2.1 scientific snapshot below remains unchanged."}
          </p>

        </div>

      </div>


      {error && (

        <div className="mt-5 rounded-2xl border border-red-200 bg-[#fff8f8] p-4 text-sm text-red-700">
          {error}
        </div>

      )}


      <details className="mt-6 rounded-[22px] border border-[#dfe4e1] bg-[#f7f9f7]">

        <summary className="cursor-pointer px-5 py-4 text-sm font-medium">
          View technical verification proof
        </summary>


        <div className="border-t border-[#dfe4e1] p-5">

          <div className="grid gap-2 md:grid-cols-4">

            <div className="rounded-xl border border-[#dfe4e1] bg-white px-4 py-3">

              <div className="font-mono text-[10px] text-[#68706c]">
                01
              </div>

              <div className="mt-1 text-xs font-medium">
                The Graph observation
              </div>

            </div>


            <div className="rounded-xl border border-[#dfe4e1] bg-white px-4 py-3">

              <div className="font-mono text-[10px] text-[#68706c]">
                02
              </div>

              <div className="mt-1 text-xs font-medium">
                Exact indexed block
              </div>

            </div>


            <div className="rounded-xl border border-[#dfe4e1] bg-white px-4 py-3">

              <div className="font-mono text-[10px] text-[#68706c]">
                03
              </div>

              <div className="mt-1 text-xs font-medium">
                Independent chain RPC
              </div>

            </div>


            <div className="rounded-xl border border-[#bfd7cc] bg-[#edf7f2] px-4 py-3">

              <div className="font-mono text-[10px] text-[#1e5d46]">
                04
              </div>

              <div className="mt-1 text-xs font-semibold text-[#173f32]">
                Deterministic comparison
              </div>

            </div>

          </div>


          {data && data.networks.length > 0 && (

            <div className="mt-6 grid gap-4 md:grid-cols-3">

              {data.networks.map(
                network => (

                  <article
                    key={`${network.network}-${network.chainId}`}
                    className="rounded-[22px] border border-[#dfe4e1] bg-white p-5"
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
                          {verificationLabel(
                            network.chainMatch,
                            "MATCH",
                            "NO MATCH",
                            Boolean(network.error),
                          )}
                        </strong>

                      </div>


                      <div className="flex justify-between gap-3">

                        <span className="text-[#68706c]">
                          Block hash
                        </span>

                        <strong>
                          {verificationLabel(
                            network.blockHashMatch,
                            "MATCH",
                            "NO MATCH",
                            Boolean(network.error),
                          )}
                        </strong>

                      </div>


                      <div className="flex justify-between gap-3 text-[11px]">

                        <span className="text-[#68706c]">
                          Graph hash
                        </span>

                        <span className="font-mono">
                          {shortHash(network.graphBlockHash)}
                        </span>

                      </div>


                      <div className="flex justify-between gap-3 text-[11px]">

                        <span className="text-[#68706c]">
                          RPC hash
                        </span>

                        <span className="font-mono">
                          {shortHash(network.rpcBlockHash)}
                        </span>

                      </div>


                      <div className="flex justify-between gap-3">

                        <span className="text-[#68706c]">
                          Registry runtime
                        </span>

                        <strong>
                          {verificationLabel(
                            network.runtimeCodePresent,
                            "PRESENT",
                            "ABSENT",
                            Boolean(network.error),
                          )}
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
                          {verificationLabel(
                            network.ownerMatch,
                            "MATCH",
                            "NO MATCH",
                            Boolean(network.error),
                          )}
                        </strong>

                      </div>

                    </div>


                    <div className="mt-5 border-t border-[#dfe4e1] pt-4">

                      <div className="text-xs text-[#68706c]">
                        The Graph owner
                      </div>

                      <div className="mt-1 font-mono text-xs">
                        {shortAddress(
                          network.sampleAgent?.owner ?? null,
                        )}
                      </div>


                      <div className="mt-3 text-xs text-[#68706c]">
                        Chain ownerOf
                      </div>

                      <div className="mt-1 font-mono text-xs">
                        {shortAddress(
                          network.chainOwner,
                        )}
                      </div>

                    </div>


                    {network.error && (

                      <div className="mt-4 text-xs text-[#8a6b20]">
                        {network.error}
                      </div>

                    )}

                  </article>

                ),
              )}

            </div>

          )}


          <div className="mt-6 rounded-2xl border border-[#dfe4e1] bg-white p-5">

            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#1e5d46]">
              Verification rule
            </div>

            <p className="mt-2 max-w-5xl text-sm leading-6 text-[#68706c]">
              VERIFIED means The Graph indexed observation and an independent
              chain JSON-RPC query agree at the same block on network identity,
              block hash, ERC-8004 registry presence and sampled agent
              ownership.
            </p>

          </div>


          <div className="mt-5 font-mono text-[11px] text-[#68706c]">
            IdentityRegistry: {data?.identityRegistry ?? "-"}
          </div>

        </div>

      </details>

    </section>
  );
}