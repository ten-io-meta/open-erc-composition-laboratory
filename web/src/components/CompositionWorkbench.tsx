"use client";

import {
  useState,
} from "react";

import {
  ScientificPairResults,
} from "@/components/ScientificPairResults";
import { ScientificDossierResults } from "@/components/ScientificDossierResults";
import { PinnedAnalysisJobLauncher } from "@/components/PinnedAnalysisJobLauncher";
import { GenericSourceLabLauncher } from "@/components/GenericSourceLabLauncher";


function normalize(
  value: string,
) {

  const normalized =
    value
      .trim()
      .toUpperCase();

  const match =
    normalized.match(
      /^ERC-?([1-9][0-9]*)$/,
    );

  return match
    ? `ERC-${match[1]}`
    : normalized;
}


export function CompositionWorkbench() {

  const [
    primary,
    setPrimary,
  ] =
    useState("ERC-8060");

  const [
    secondary,
    setSecondary,
  ] =
    useState("ERC-8098");

  const [
    submitted,
    setSubmitted,
  ] =
    useState(false);


  const primaryReady =
    /^ERC-[1-9][0-9]*$/.test(
      normalize(primary),
    );

  const secondaryReady =
    /^ERC-[1-9][0-9]*$/.test(
      normalize(secondary),
    );

  const canInspect =
    primaryReady &&
    secondaryReady &&
    normalize(primary) !== normalize(secondary);

  const normalizedA = normalize(primary);
  const normalizedB = normalize(secondary);
  const isPinnedDossier =
    (normalizedA === "ERC-8060" && normalizedB === "ERC-8098") ||
    (normalizedA === "ERC-8098" && normalizedB === "ERC-8060");


  return (
    <section id="composition-workbench" className="mt-8 scroll-mt-8 rounded-[28px] border border-[#cfd7d2] bg-white p-6 md:p-8">

      <div>

        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#1e5d46]">
          Inspect scientific evidence and materialized pair evaluations
        </p>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-[#68706c]">
          Inspect the pinned ERC-8060 × ERC-8098 scientific dossier, with
          source provenance, real local-EVM evidence and explicit uncertainty.
          Other pairs retain the existing materialized scientific snapshot.
          This form does not execute new analysis or infer compatibility.
        </p>

      </div>


      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">

        <div>
          <label htmlFor="oecl-protocol-a" className="mb-2 block text-xs font-semibold text-[#66756d]">
            ERC protocol A
          </label>
          <input
            id="oecl-protocol-a"
            type="text"
            aria-describedby="oecl-pair-guidance"
            value={primary}
            onChange={event => {
              setPrimary(event.target.value.toUpperCase());
              setSubmitted(false);
            }}
            placeholder="ERC-8301"
            className="w-full rounded-2xl border border-[#cfd7d2] px-5 py-3 outline-none focus:border-[#1e5d46]"
          />
        </div>
        <div>
          <label htmlFor="oecl-protocol-b" className="mb-2 block text-xs font-semibold text-[#66756d]">
            ERC protocol B
          </label>
          <input
            id="oecl-protocol-b"
            type="text"
            aria-describedby="oecl-pair-guidance"
            value={secondary}
            onChange={event => {
              setSecondary(event.target.value.toUpperCase());
              setSubmitted(false);
            }}
            placeholder="ERC-8354"
            className="w-full rounded-2xl border border-[#cfd7d2] px-5 py-3 outline-none focus:border-[#1e5d46]"
          />
        </div>
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          disabled={!canInspect}
          className="rounded-2xl bg-[#1e5d46] px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Inspect available evidence
        </button>
      </div>
      <p id="oecl-pair-guidance" role="status" className="mt-2 text-xs text-[#68706c]">
        {canInspect
          ? "This only retrieves existing evidence. New analyses require the separate authorized research runner."
          : "Enter two different valid ERC identifiers (for example ERC-8060 and ERC-8098)."}
      </p>


      <PinnedAnalysisJobLauncher isSelected={isPinnedDossier} />

      <GenericSourceLabLauncher />

      {submitted && (

        <div className="mt-7 border-t border-[#e2e7e4] pt-6">

          {isPinnedDossier ? (
            <ScientificDossierResults
              protocolA={normalizedA}
              protocolB={normalizedB}
            />
          ) : (
            <ScientificPairResults
              protocolA={normalizedA}
              protocolB={normalizedB}
            />
          )}

        </div>

      )}

    </section>
  );
}