"use client";

import { useEffect, useState } from "react";
import type { ScientificDossier } from "@/server/oeclScientificDossier";

type Response = {
  status: "PINNED_SCIENTIFIC_DOSSIER";
  snapshotSha256: string;
  evidenceRunUrl: string;
  dossier: ScientificDossier;
};

function formatEtherFromWei(wei: string): string {
  const value = BigInt(wei);
  const base = 10n ** 18n;
  const whole = value / base;
  const decimals = (value % base).toString().padStart(18, "0").replace(/0+$/, "");
  return whole.toString() + (decimals ? "." + decimals : "");
}

/** Presentation only: all verdicts and measurements come from the pinned report. */
export function ScientificDossierResults({
  protocolA,
  protocolB,
}: {
  protocolA: string;
  protocolB: string;
}) {
  const [data, setData] = useState<Response | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError(null);
    const url = "/api/scientific/dossier?protocolA=" +
      encodeURIComponent(protocolA) + "&protocolB=" + encodeURIComponent(protocolB);
    fetch(url, { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.message ?? "Scientific evidence unavailable.");
        if (body.status !== "PINNED_SCIENTIFIC_DOSSIER" || !body.dossier) {
          throw new Error("The scientific dossier was not returned.");
        }
        return body as Response;
      })
      .then(setData)
      .catch(cause => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : "Scientific evidence unavailable.");
        }
      });
    return () => controller.abort();
  }, [protocolA, protocolB]);

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-[#ead0ca] bg-[#fff8f6] p-5 text-sm text-[#9b3128]">
        EVIDENCE NOT AVAILABLE: {error}. No scientific verdict is inferred.
      </div>
    );
  }

  if (!data) {
    return <p role="status" className="text-sm text-[#68706c]">Loading the pinned scientific evidence dossier...</p>;
  }

  const d = data.dossier;
  const download = "/api/scientific/dossier?protocolA=" +
    encodeURIComponent(protocolA) + "&protocolB=" +
    encodeURIComponent(protocolB) + "&download=1";
  const tx = d.experiment.transactionHash;

  return (
    <article className="space-y-7" aria-label="Pinned scientific evidence report">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#1e5d46]">
            Evidence-based scientific dossier · pinned local EVM
          </p>
          <h3 className="mt-2 text-2xl font-medium tracking-[-0.03em]">ERC-8060 × ERC-8098</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#68706c]">
            Source-derived hypothesis matched to bounded EVM observations.
            A matching experiment is not an admitted composition or a security certification.
          </p>
        </div>
        <div className="rounded-full border border-[#d8d2bb] bg-[#f8f5e8] px-4 py-2 font-mono text-xs text-[#806921]">
          {d.verdict}
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#dfe4e1] p-4">
          <p className="text-xs text-[#68706c]">ETH redeemed in local test</p>
          <p className="mt-2 text-2xl font-medium">{formatEtherFromWei(d.experiment.ethRedeemedWei)} ETH</p>
        </div>
        <div className="rounded-xl border border-[#dfe4e1] p-4">
          <p className="text-xs text-[#68706c]">Source-derived questions</p>
          <p className="mt-2 text-2xl font-medium">{d.scientificQuestions.scopedObserved}/{d.scientificQuestions.total}</p>
          <p className="mt-1 text-[11px] text-[#68706c]">Observed in bounded tests only</p>
        </div>
        <div className="rounded-xl border border-[#dfe4e1] p-4">
          <p className="text-xs text-[#68706c]">Adversarial cases observed</p>
          <p className="mt-2 text-2xl font-medium">{d.adversarial.observedCaseIds.length}</p>
        </div>
        <div className="rounded-xl border border-[#dfe4e1] p-4">
          <p className="text-xs text-[#68706c]">Threat classes not tested</p>
          <p className="mt-2 text-2xl font-medium">{d.adversarial.untested.length}</p>
        </div>
      </div>

      <section className="rounded-2xl border border-[#dfe4e1] bg-[#f7f9f7] p-5">
        <h4 className="text-base font-semibold">Discovered source-only hypothesis</h4>
        <p className="mt-2 break-words font-mono text-xs text-[#68706c]">{d.discovery.relation}</p>
        <p className="mt-3 text-sm leading-6 text-[#3c4943]">
          Two independently constrained resource reductions may be coordinated
          atomically. ERC-8060 reduces ETH redemption obligations; ERC-8098
          reduces fungible token supply. These are different units and rights.
        </p>
        <p className="mt-3 text-xs text-[#806921]">
          Hypothesis: {d.discovery.status} · Candidate: {d.candidateAdmission}
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-[#68706c]">
          {d.discovery.unknowns.map(item => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className="rounded-2xl border border-[#dfe4e1] p-5">
        <h4 className="text-base font-semibold">Measured execution</h4>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-[#68706c]">EVM</dt>
            <dd className="font-medium">Hardhat local · chain ID {d.experiment.chainId}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#68706c]">Emergent property status</dt>
            <dd className="break-words font-mono text-xs">{d.experiment.propertyStatus}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#68706c]">NFT redemption obligations</dt>
            <dd className="font-medium">{formatEtherFromWei(d.experiment.nftObligationDecreaseWei)} ETH decrease</dd>
          </div>
          <div>
            <dt className="text-xs text-[#68706c]">ERC-20 total supply (base units)</dt>
            <dd className="break-all font-mono text-xs">
              {d.experiment.supplyBeforeBaseUnits} → {d.experiment.supplyAfterBaseUnits}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-[#68706c]">
          Both burns were observed in one local transaction. Local constraints:{" "}
          {d.experiment.localConstraintResult}; global scientific verdict: {d.verdict}.
        </p>
        <p className="mt-2 break-all font-mono text-[11px] text-[#68706c]">
          Local transaction: {tx}
        </p>
        <p className="mt-1 text-[11px] text-[#68706c]">
          This hash belongs to an ephemeral local chain, not to a public block explorer.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {d.participants.map(participant => (
          <div key={participant.repository} className="rounded-2xl border border-[#dfe4e1] p-5">
            <p className="font-mono text-[10px] uppercase tracking-wide text-[#68706c]">
              {participant.assetClass} participant
            </p>
            <h4 className="mt-2 text-sm font-semibold">{participant.repository}</h4>
            <a
              className="mt-2 block break-all font-mono text-xs text-[#1e5d46] underline underline-offset-2"
              href={"https://github.com/" + participant.repository + "/tree/" + participant.revision}
              target="_blank" rel="noopener noreferrer"
            >
              Pinned source revision: {participant.revision}
            </a>
            <p className="mt-3 break-all text-[11px] text-[#68706c]">
              Source SHA-256: {participant.sourceSha256}
            </p>
          </div>
        ))}
      </section>

      <details className="rounded-2xl border border-[#dfe4e1] p-5">
        <summary className="cursor-pointer font-semibold">
          Examine {d.scientificQuestions.total} scientific questions and evidence
        </summary>
        <p className="mt-3 text-xs text-[#806921]">
          All questions have scoped observations, but full source coverage and
          all-path validation are explicitly NOT established.
        </p>
        <div className="mt-4 space-y-3">
          {d.scientificQuestions.observations.map(q => (
            <div key={q.questionId} className="rounded-lg bg-[#f7f9f7] p-3">
              <p className="text-sm font-medium">{q.participantSide} · {q.category}</p>
              <p className="mt-1 font-mono text-[11px] text-[#68706c]">{q.status}</p>
              <ul className="mt-2 list-disc pl-5 text-xs text-[#68706c]">
                {q.missing.map(m => <li key={m}>{m}</li>)}
              </ul>
              <p className="mt-2 break-all font-mono text-[10px] text-[#68706c]">
                Evidence: {q.evidenceRefs.join(", ")}
              </p>
            </div>
          ))}
        </div>
      </details>

      <details className="rounded-2xl border border-[#dfe4e1] p-5">
        <summary className="cursor-pointer font-semibold">
          {d.adversarial.untested.length} untested threat classes · partial coverage
        </summary>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-xs text-[#68706c]">
          {d.adversarial.untested.map(item => (
            <li key={item.id}><strong>{item.id}</strong>: {item.reason}</li>
          ))}
        </ul>
      </details>

      <details className="rounded-2xl border border-[#dfe4e1] p-5">
        <summary className="cursor-pointer font-semibold">Reproducibility and unresolved limitations</summary>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-xs text-[#68706c]">
          {d.limitations.map(item => <li key={item}>{item}</li>)}
        </ul>
        <p className="mt-4 font-mono text-[11px] text-[#68706c]">
          Pinned dossier (SHA-256 of canonical JSON): {data.snapshotSha256}
        </p>
        <p className="mt-2 text-xs text-[#68706c]">
          This digest checks the pinned report snapshot, while the original
          GitHub Actions artifacts retain the source and execution evidence.
          Neither replaces independent public-chain replay.
        </p>
      </details>

      <div className="flex flex-wrap gap-3">
        <a href={download} className="rounded-xl bg-[#1e5d46] px-5 py-3 text-sm font-medium text-white">
          Download scientific dossier (JSON)
        </a>
        <a href={data.evidenceRunUrl} target="_blank" rel="noopener noreferrer"
          className="rounded-xl border border-[#cfd7d2] px-5 py-3 text-sm font-medium text-[#1e5d46]">
          Inspect original evidence artifacts
        </a>
      </div>
      <p className="text-xs leading-5 text-[#68706c]">
        Read-only pinned scientific snapshot, not a live execution service.
        No independent candidate admission, universal composability or
        security guarantee is claimed.
      </p>
    </article>
  );
}
