"use client";

import { useEffect, useState } from "react";
import { ScientificAstGraphExplorer, type AstGraphView } from "./ScientificAstGraphExplorer";

type Source = { id: string; label: string; kind: string };
type Config = {
  enabled: boolean; status: string; sources: Source[];
  researchAccessRequired: boolean; runsEvm: boolean;
};
type Job = {
  status: string; state?: string; requestId?: string; runUrl?: string | null;
  message?: string; scientificVerdict?: string | null;
};
type EvidenceState = { job: Job; view: AstGraphView | null; error: string | null };
const done = new Set(["EXECUTION_FAILED", "SOURCE_ARTIFACT_AVAILABLE"]);
const analysisHeaders = (key: string) => ({ "x-oecl-access-key": key });

/** Single source-pair selection; no second conflicting set of selectors. */
export function FreshPairSourceAnalysis({ sourceA, sourceB }: {
  sourceA: string; sourceB: string;
}) {
  const [config, setConfig] = useState<Config | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [accessKey, setAccessKey] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<EvidenceState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    async function load() {
      try {
        const r = await fetch("/api/scientific/source-jobs", {
          signal: ctrl.signal, cache: "no-store",
        });
        const body: Config = await r.json();
        if (!r.ok || !Array.isArray(body.sources) ||
            body.runsEvm !== false || typeof body.enabled !== "boolean")
          throw Error("Verified source-worker configuration is unavailable.");
        if (!ctrl.signal.aborted) { setConfig(body); setConfigError(null); }
      } catch (error) {
        if (!ctrl.signal.aborted) setConfigError(
          error instanceof Error ? error.message : "Worker availability unknown.");
      }
    }
    void load();
    return () => ctrl.abort();
  }, [retry]);

  // This component is keyed by the primary pair, so job state cannot leak from
  // a different selection. The key is held in memory only, never URL/storage.
  useEffect(() => {
    if (!jobId || accessKey.length < 32) return;
    const ctrl = new AbortController();
    let timer: ReturnType<typeof setTimeout> | null = null;
    async function poll() {
      try {
        const r = await fetch("/api/scientific/source-jobs/" + encodeURIComponent(jobId!), {
          cache: "no-store", signal: ctrl.signal, headers: analysisHeaders(accessKey),
        });
        const body: Job = await r.json();
        if (!r.ok || body.status !== "SOURCE_JOB_STATE" || body.requestId !== jobId)
          throw Error(body.status || "Independent worker status cannot be verified.");
        if (ctrl.signal.aborted) return;
        setEvidence(old => ({ job: body, view: old?.view ?? null, error: null }));
        if (!done.has(body.state || "")) timer = setTimeout(poll, 5500);
      } catch (error) {
        if (ctrl.signal.aborted) return;
        setEvidence(old => ({
          job: old?.job ?? { status: "SOURCE_JOB_STATUS_UNAVAILABLE", requestId: jobId },
          view: null,
          error: error instanceof Error ? error.message : "Cannot verify job status.",
        }));
        // Avoid a tight retry loop on GitHub/token errors.
      }
    }
    timer = setTimeout(poll, 700);
    return () => { ctrl.abort(); if (timer) clearTimeout(timer); };
  }, [jobId, accessKey]);

  useEffect(() => {
    if (!jobId || evidence?.job.state !== "SOURCE_ARTIFACT_AVAILABLE" || !config?.enabled)
      return;
    const ctrl = new AbortController();
    const url = "/api/scientific/source-jobs/" + encodeURIComponent(jobId) +
      "/view?sourceA=" + encodeURIComponent(sourceA) + "&sourceB=" + encodeURIComponent(sourceB);
    async function verifyEvidence() {
      try {
        const r = await fetch(url, {
          cache: "no-store", signal: ctrl.signal, headers: analysisHeaders(accessKey),
        });
        const body = await r.json();
        const v = body.view as AstGraphView | undefined;
        if (!r.ok || body.status !== "VERIFIED_SOURCE_GRAPH" || !v ||
            v.selected?.[0]?.id !== sourceA || v.selected?.[1]?.id !== sourceB ||
            v.sourceOnly !== true || v.evmExecuted !== false ||
            v.scientificVerdict !== "INCONCLUSIVE" || v.candidateAdmission !== "NOT_ADMITTED")
          throw Error(body.status || "Source artifact failed strict provenance validation.");
        if (!ctrl.signal.aborted)
          setEvidence(old => old ? { ...old, view: v, error: null } : null);
      } catch (error) {
        if (!ctrl.signal.aborted)
          setEvidence(old => old ? { ...old, view: null,
            error: error instanceof Error ? error.message : "Evidence unverified." } : null);
      }
    }
    void verifyEvidence();
    return () => ctrl.abort();
  }, [jobId, evidence?.job.state, sourceA, sourceB, accessKey, config?.enabled]);

  const a = config?.sources.find(s => s.id === sourceA);
  const b = config?.sources.find(s => s.id === sourceB);
  const supported = Boolean(a && b && sourceA !== sourceB);
  async function start() {
    if (!config?.enabled || !supported || jobId || submitting || accessKey.length < 32) return;
    setSubmitting(true);
    setEvidence(null);
    try {
      const r = await fetch("/api/scientific/source-jobs", {
        method: "POST", cache: "no-store",
        headers: { ...analysisHeaders(accessKey), "content-type": "application/json" },
        body: JSON.stringify({ sourceA, sourceB }),
      });
      const body: Job = await r.json();
      if (!r.ok || body.status !== "SOURCE_DISPATCH_ACCEPTED" ||
          typeof body.requestId !== "string")
        throw Error(body.status || "Isolated AST job dispatch was refused.");
      setJobId(body.requestId);
      setEvidence({ job: body, view: null, error: null });
    } catch (error) {
      setEvidence({ job: { status: "DISPATCH_FAILED" }, view: null,
        error: error instanceof Error ? error.message : "Dispatch failed." });
    } finally { setSubmitting(false); }
  }

  return <section aria-label="Fresh Solidity source analysis" data-testid="oecl-fresh-ast"
    className="space-y-4 rounded-2xl border border-[#d1ddd7] bg-[#f7faf8] p-5">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#27614b]">
        Fresh, reproducible Solidity analysis
      </p>
      <h4 className="mt-2 text-lg font-semibold">Analyze this selected pair with a compiler AST</h4>
      <p className="mt-2 text-sm leading-6 text-[#5c7465]">
        Rebuild the source graph, constraints and hypotheses from immutable Solidity implementations
        on an isolated GitHub Actions runner. This is not a compatibility certification or EVM test.
      </p>
    </div>
    {!config && !configError && <p role="status" className="text-sm text-[#587261]">
      Checking available implementation sources and research access…
    </p>}
    {configError && <p role="alert" className="text-sm text-[#8b4636]">
      Cannot confirm research service: {configError}
      <button type="button" onClick={() => { setConfigError(null); setRetry(n => n + 1); }}
        className="ml-2 font-semibold underline">Retry</button>
    </p>}
    {config && <>
      <div className="grid gap-3 md:grid-cols-2">
        {[{ label: sourceA, source: a }, { label: sourceB, source: b }].map(({ label, source }) =>
          <div className="rounded-xl border border-[#d7e5db] bg-white p-4" key={label}>
            <p className="font-mono text-sm font-semibold">{label}</p>
            <p className="mt-1 text-xs leading-5 text-[#5f7465]">
              {source ? source.label : "No reviewed, immutable Solidity implementation registered yet."}
            </p>
            <p className="mt-2 text-[11px] font-semibold text-[#387453]">
              {source ? "PINNED SOURCE AVAILABLE" : "SOURCE REVIEW REQUIRED"}
            </p>
          </div>)}
      </div>
      {!supported && <div className="rounded-xl border border-[#e5dbbd] bg-[#fffbf0] p-4">
        <p className="text-sm font-semibold text-[#725732]">Source ingestion required before an AST run</p>
        <p className="mt-2 text-xs leading-5 text-[#79694d]">
          A published ERC number identifies a specification, not a concrete contract.
          OECL must register a reviewed implementation at an immutable source revision,
          resolve its imports and compiler, and test constraints. No source or EVM job was started.
        </p>
      </div>}
      {supported && !config.enabled && <p role="status"
        className="rounded-xl border border-[#d7e3da] bg-white p-4 text-sm text-[#647368]">
        These implementation sources are eligible for a fresh compiler run, but the
        isolated research dispatcher is currently <strong>not activated</strong> for visitors.
        No job has been started and no new EVM result exists.
      </p>}
      {supported && config.enabled && <>
        <p className="text-xs text-[#657968]">
          Research-only authorization required. Credentials are not saved in local storage or the URL.
          Workflow runs on the default branch and has a fixed quota; do not paste a GitHub token here.
        </p>
        <label htmlFor="oecl-fresh-access" className="block text-xs font-semibold">
          Authorized laboratory access key
        </label>
        <input id="oecl-fresh-access" type="password" value={accessKey}
          onChange={e => setAccessKey(e.target.value)}
          disabled={Boolean(jobId)} autoComplete="off" spellCheck={false}
          className="w-full max-w-xl rounded-xl border border-[#cadacb] bg-white p-3 text-sm"
          placeholder="Research access key (not a GitHub token)"/>
        <button type="button" onClick={start}
          disabled={submitting || Boolean(jobId) || accessKey.length < 32}
          className="rounded-xl bg-[#20583e] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
          {submitting ? "Requesting isolated AST run…" : "Run fresh Solidity AST for this pair"}
        </button>
      </>}
    </>}
    {evidence && <div aria-label="Fresh analysis job state"
      className="space-y-3 rounded-xl border border-[#d2e1d7] bg-white p-4">
      <p className="text-sm font-semibold">
        {evidence.job.state || evidence.job.status}
      </p>
      <p className="text-xs text-[#5c7665]">{evidence.job.message}</p>
      {evidence.error && <p role="alert" className="text-xs text-[#9d4739]">
        {evidence.error} This is not a scientific verdict.
      </p>}
      {evidence.job.runUrl && <a href={evidence.job.runUrl} target="_blank"
        rel="noopener noreferrer" className="text-xs text-[#246e4b] underline">
        Inspect the GitHub Actions execution and archived evidence
      </a>}
      {evidence.view && <>
        <p className="rounded-lg bg-[#fff8ed] p-3 text-xs text-[#805b34]">
          New source-only hypotheses: {evidence.view.hypotheses.length}. Verdict remains INCONCLUSIVE.
          No EVM run, scientific admission or general composability claim is implied.
        </p>
        <ScientificAstGraphExplorer view={evidence.view}/>
      </>}
    </div>}
  </section>;
}
