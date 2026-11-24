"use client";

import { useState, type ReactNode } from "react";

/**
 * Additional data services are intentionally opt-in. Opening a section mounts
 * its consumer for the first time, avoiding unrelated Graph/RPC calls merely
 * because a visitor opened the composition workbench.
 */
export function ResearchDisclosure({
  title, description, children,
}: { title: string; description: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <section className="rounded-2xl border border-[#d7e2da] bg-white p-5 md:p-7">
    <button type="button" onClick={() => setOpen(x => !x)} aria-expanded={open}
      className="flex w-full items-center justify-between gap-4 text-left focus:outline-none focus:ring-2 focus:ring-[#79b28e]">
      <span className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-[#27523c]">{title}</span>
        <span className="text-xs font-normal text-[#829183]">{description}</span>
      </span>
      <span aria-hidden="true" className="text-xl font-light text-[#527a5e]">{open ? "−" : "+"}</span>
    </button>
    {open && <div className="mt-4 border-t border-[#dfe8e0] pt-4">{children}</div>}
  </section>;
}
