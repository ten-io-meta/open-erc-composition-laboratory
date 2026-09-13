"use client";

import {
  useState,
} from "react";

import {
  ScientificPairResults,
} from "@/components/ScientificPairResults";


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
    useState("");

  const [
    secondary,
    setSecondary,
  ] =
    useState("");

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


  return (
    <section className="mt-8 rounded-[28px] border border-[#cfd7d2] bg-white p-6 md:p-8">

      <div>

        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#1e5d46]">
          Inspect materialized pair evaluation
        </p>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-[#68706c]">
          Enter two ERCs to inspect an evaluation already present in the
          current scientific snapshot. OECL will not create a new evaluation
          if that pair has not been materialized.
        </p>

      </div>


      <div className="mt-6 flex flex-col gap-3 md:flex-row">

        <input
          value={primary}
          onChange={
            event => {
              setPrimary(
                event.target.value.toUpperCase(),
              );

              setSubmitted(false);
            }
          }
          placeholder="ERC-8301"
          className="flex-1 rounded-2xl border border-[#cfd7d2] px-5 py-3 outline-none focus:border-[#1e5d46]"
        />

        <input
          value={secondary}
          onChange={
            event => {
              setSecondary(
                event.target.value.toUpperCase(),
              );

              setSubmitted(false);
            }
          }
          placeholder="ERC-8354"
          className="flex-1 rounded-2xl border border-[#cfd7d2] px-5 py-3 outline-none focus:border-[#1e5d46]"
        />

        <button
          onClick={
            () =>
              setSubmitted(true)
          }
          disabled={!canInspect}
          className="rounded-2xl bg-[#1e5d46] px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Inspect pair
        </button>

      </div>


      {submitted && (

        <div className="mt-7 border-t border-[#e2e7e4] pt-6">

          <ScientificPairResults
            protocolA={
              normalize(primary)
            }
            protocolB={
              normalize(secondary)
            }
          />

        </div>

      )}

    </section>
  );
}