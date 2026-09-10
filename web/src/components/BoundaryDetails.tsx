"use client";

import { useState } from "react";
import boundaryData from "@/data/realControl8004Erc8060Boundaries.json";

type BoundaryItem = {
  participantId: string;
  relevance: "RELEVANT" | "OUT_OF_SCOPE";
  reason: string;
  evidenceIds: string[];
  boundary: {
    boundaryId: string;
    kind: string;
    subject: string;
    evidenceIds: string[];
  };
};

const boundaries = boundaryData as BoundaryItem[];

function ruleMessage(subject: string) {
  const matches = [...subject.matchAll(/"([^"]+)"/g)];

  return matches.length > 0
    ? matches[matches.length - 1][1]
    : subject;
}

function factId(item: BoundaryItem) {
  const match = item.boundary.boundaryId.match(
    /(FACT-\d+)/,
  );

  return match?.[1] ?? "SOURCE FACT";
}

function runtimeContext(item: BoundaryItem) {
  const evidence = item.evidenceIds.join("|");

  const match = evidence.match(
    /REAL-CONTROL-(.+?)-SCIENTIFIC-COMPOSITION-CONSTRAINT/,
  );

  if (!match) return null;

  let value = match[1];

  value = value.replace(/^ERC8004-/, "");
  value = value.replace(/^ERC8060-/, "");

  return value;
}

function sourceContainer(item: BoundaryItem) {
  const evidence = item.evidenceIds.join("|");

  const matches = [
    ...evidence.matchAll(
      /\|\d+:([A-Za-z][A-Za-z0-9_]*(?:Upgradeable|Registry|Contract))/g,
    ),
  ];

  if (matches.length === 0) return null;

  return matches[matches.length - 1][1];
}

function contextLabel(item: BoundaryItem) {
  if (item.relevance === "RELEVANT") {
    return runtimeContext(item) ?? factId(item);
  }

  const container = sourceContainer(item);

  return container
    ? `${container} · ${factId(item)}`
    : factId(item);
}

function BoundaryRow({ item }: { item: BoundaryItem }) {
  return (
    <details className="group border-b border-[#e4e8e5] last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center gap-3 py-3">
        <span className="min-w-[72px] rounded-full bg-[#eef2ef] px-2.5 py-1 text-center font-mono text-[10px]">
          {item.participantId}
        </span>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">
            {ruleMessage(item.boundary.subject)}
          </div>

          <div className="mt-0.5 truncate font-mono text-[10px] text-[#7d8580]">
            {contextLabel(item)}
          </div>
        </div>

        <span className="text-sm text-[#68706c] transition-transform group-open:rotate-90">
          ›
        </span>
      </summary>

      <div className="pb-4 md:pl-[84px]">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#eef2ef] px-2.5 py-1 font-mono text-[10px]">
            {item.boundary.kind}
          </span>

          <span className="rounded-full bg-[#eef2ef] px-2.5 py-1 font-mono text-[10px]">
            {factId(item)}
          </span>
        </div>

        <code className="block overflow-x-auto rounded-xl bg-[#f3f5f4] p-3 text-xs leading-5 text-[#252a27]">
          {item.boundary.subject}
        </code>

        <p className="mt-3 text-xs leading-5 text-[#68706c]">
          {item.relevance === "RELEVANT"
            ? "Checked because OECL has explicit runtime reachability evidence for this exact boundary in this candidate."
            : "Outside this result because OECL has explicit execution-surface exclusion evidence for this exact boundary."}
        </p>

        <details className="mt-2">
          <summary className="cursor-pointer font-mono text-[10px] text-[#1e5d46]">
            Source evidence
          </summary>

          <div className="mt-2 break-all font-mono text-[10px] leading-5 text-[#68706c]">
            <div>{item.reason}</div>

            {item.boundary.evidenceIds.map((id) => (
              <div key={id}>{id}</div>
            ))}
          </div>
        </details>
      </div>
    </details>
  );
}

export function BoundaryDetails() {
  const [view, setView] =
    useState<"RELEVANT" | "OUT_OF_SCOPE">("RELEVANT");

  const [showAll, setShowAll] = useState(false);

  const relevant = boundaries.filter(
    (item) => item.relevance === "RELEVANT",
  );

  const outside = boundaries.filter(
    (item) => item.relevance === "OUT_OF_SCOPE",
  );

  const selected =
    view === "RELEVANT" ? relevant : outside;

  const participants = [
    ...new Set(selected.map((item) => item.participantId)),
  ];

  return (
    <section className="mt-5 rounded-2xl border border-[#d9dfdb] bg-white">
      <div className="border-b border-[#e4e8e5] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">
              Composition limits
            </div>

            <div className="mt-1 text-xs text-[#68706c]">
              37 known · 17 checked · 20 outside this path
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setView("RELEVANT");
                setShowAll(false);
              }}
              className={`rounded-full px-3 py-1.5 text-xs ${
                view === "RELEVANT"
                  ? "bg-[#173f32] text-white"
                  : "bg-[#eef2ef] text-[#4d5550]"
              }`}
            >
              Checked · 17
            </button>

            <button
              onClick={() => {
                setView("OUT_OF_SCOPE");
                setShowAll(false);
              }}
              className={`rounded-full px-3 py-1.5 text-xs ${
                view === "OUT_OF_SCOPE"
                  ? "bg-[#173f32] text-white"
                  : "bg-[#eef2ef] text-[#4d5550]"
              }`}
            >
              Outside · 20
            </button>
          </div>
        </div>

        <p className="mt-3 max-w-3xl text-xs leading-5 text-[#68706c]">
          {view === "RELEVANT"
            ? "Protocol rules actually reached by the evaluated composition runtime."
            : "Known protocol rules explicitly excluded from this composition path. This SUPPORTED result makes no claim about testing them."}
        </p>
      </div>

      <div className="px-4">
        {participants.map((participant) => {
          const participantItems = selected.filter(
            (item) => item.participantId === participant,
          );

          const visible = showAll
            ? participantItems
            : participantItems.slice(0, 3);

          return (
            <div key={participant} className="py-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold text-[#1e5d46]">
                  {participant}
                </span>

                <span className="text-[11px] text-[#8a918d]">
                  {participantItems.length} rules
                </span>
              </div>

              {visible.map((item) => (
                <BoundaryRow
                  key={item.boundary.boundaryId}
                  item={item}
                />
              ))}
            </div>
          );
        })}
      </div>

      <div className="border-t border-[#e4e8e5] p-3 text-center">
        <button
          onClick={() => setShowAll(!showAll)}
          className="rounded-full bg-[#eef2ef] px-4 py-2 text-xs font-medium"
        >
          {showAll
            ? "Show less"
            : `Show all ${selected.length} rules`}
        </button>
      </div>
    </section>
  );
}
