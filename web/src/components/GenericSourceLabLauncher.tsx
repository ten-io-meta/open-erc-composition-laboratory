"use client";

import { useEffect, useState } from "react";

type SourceEntry = { id: string; label: string; kind: string };
type Availability = {
  status: string; enabled: boolean; sources: SourceEntry[];
  message: string; acceptsArbitraryRepositories: boolean; runsEvm: boolean;
};
type SourceJob = {
  status: string; requestId?: string; state?: string;
  runUrl?: string | null; scientificVerdict?: string | null; message?: string;
};
const terminalStates = new Set(["SOURCE_ARTIFACT_AVAILABLE", "EXECUTION_FAILED"]);

export function GenericSourceLabLauncher() {
  const [config,setConfig] = useState<Availability | null>(null);
  const [sourceA,setSourceA] = useState("ERC-8060");
  const [sourceB,setSourceB] = useState("ERC-20-BURNABLE");
  const [accessKey,setAccessKey] = useState("");
  const [requestId,setRequestId] = useState<string | null>(null);
  const [job,setJob] = useState<SourceJob | null>(null);
  const [error,setError] = useState<string | null>(null);
  const [submitting,setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/scientific/source-jobs", { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw Error("Source catalog unavailable.");
        return response.json() as Promise<Availability>;
      })
      .then(setConfig)
      .catch(() => {
        if (!controller.signal.aborted) setError("Could not load the scientific source registry.");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!requestId || accessKey.length < 32) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function refresh() {
      try {
        const response = await fetch("/api/scientific/source-jobs/" + encodeURIComponent(requestId!), {
          headers: { "x-oecl-access-key": accessKey }, cache: "no-store",
        });
        const data = await response.json() as SourceJob;
        if (stopped) return;
        if (!response.ok) setError(data.status);
        else { setJob(data); setError(null); }
        if (!terminalStates.has(data.state ?? "")) timer = setTimeout(refresh,5000);
      } catch {
        if (!stopped) {
          setError("Could not verify the source-worker job.");
          timer = setTimeout(refresh,5000);
        }
      }
    }
    timer = setTimeout(refresh,1200);
    return () => { stopped=true; if (timer) clearTimeout(timer); };
  }, [requestId,accessKey]);

  const eligible = (config?.sources.some(s=>s.id===sourceA) ?? false) &&
    (config?.sources.some(s=>s.id===sourceB) ?? false) && sourceA!==sourceB;

  async function submit() {
    if (!config?.enabled || !eligible || accessKey.length < 32 ||
        Boolean(requestId) || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/scientific/source-jobs", {
        method: "POST",
        headers: {
          "content-type": "application/json", "x-oecl-access-key": accessKey,
        },
        body: JSON.stringify({ sourceA, sourceB }),
        cache: "no-store",
      });
      const data = await response.json() as SourceJob;
      if (!response.ok || data.status !== "SOURCE_DISPATCH_ACCEPTED" || !data.requestId)
        throw new Error(data.status || "The isolated worker refused the request.");
      setJob(data);
      setRequestId(data.requestId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The source worker is unavailable.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-7 rounded-[24px] border border-[#d0dad2] bg-[#f7f9f7] p-6"
      aria-label="Select new Solidity sources for scientific AST analysis">
      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#174c38]">
        Source laboratory · generic AST-first discovery
      </div>
      <h3 className="mt-2 text-xl font-medium">Explore other ERC source combinations</h3>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#68706c]">
        Select two reviewed Solidity source profiles. The external worker fetches
        immutable source bytes, resolves locked dependencies and builds a
        compiler-derived graph of contract functions, calls and state writes.
        It proposes structural hypotheses without executing third-party contracts.
      </p>
      {config && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[{id:"source-a",value:sourceA,set:setSourceA,label:"First Solidity source"},
            {id:"source-b",value:sourceB,set:setSourceB,label:"Second Solidity source"}].map(input=>(
              <div key={input.id}>
                <label htmlFor={input.id} className="mb-2 block text-xs font-medium text-[#68706c]">
                  {input.label}
                </label>
                <select id={input.id} value={input.value}
                  disabled={Boolean(requestId)}
                  onChange={e=>input.set(e.target.value)}
                  className="w-full rounded-xl border border-[#cfd7d2] bg-white px-4 py-3 text-sm">
                  {config.sources.map(source=><option key={source.id} value={source.id}>
                    {source.label}
                  </option>)}
                </select>
              </div>
            ))}
        </div>
      )}
      <p className="mt-3 text-xs leading-5 text-[#68706c]">
        This beta registry includes ERC-20, ERC-721, ERC-1155, ERC-8060, ERC-8098
        and the ERC-20 Burnable extension. The extension is not a distinct ERC.
        Unsupported pairs are not considered incompatible.
      </p>
      {!config ? (
        <p role="status" className="mt-4 text-sm text-[#68706c]">Loading registered sources...</p>
      ) : !config.enabled ? (
        <p className="mt-4 rounded-xl border border-[#dfded2] bg-white p-4 text-sm text-[#68706c]">
          The source worker is currently disabled on this deployment.
          The registry is visible for inspection, but no new analysis has been started.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          <label htmlFor="oecl-generic-source-key" className="block text-sm font-medium">
            Research beta access key
          </label>
          <input id="oecl-generic-source-key" type="password" autoComplete="off"
            spellCheck={false} value={accessKey}
            onChange={event=>setAccessKey(event.target.value)}
            placeholder="Researcher access key"
            className="w-full rounded-xl border border-[#cfd7d2] bg-white px-4 py-3 text-sm"/>
          <button type="button" onClick={submit}
            disabled={!eligible || accessKey.length<32 || submitting || Boolean(requestId)}
            className="rounded-xl bg-[#174c38] px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40">
            {submitting?"Dispatching source-only analysis...":"Analyze selected Solidity sources"}
          </button>
          {!eligible && <p className="text-xs text-[#806921]">Select two different registered sources.</p>}
          <p className="text-xs text-[#68706c]">
            Access keys remain in memory. No arbitrary repository URL, build script or EVM
            execution is accepted by this request.
          </p>
        </div>
      )}
      {error && <p role="alert" className="mt-4 text-sm text-[#9b3128]">{error}</p>}
      {job && (
        <div role="status" className="mt-5 rounded-xl border border-[#dfe4e1] bg-white p-4">
          <p className="font-mono text-xs font-semibold">{job.state ?? job.status}</p>
          <p className="mt-2 text-xs leading-5 text-[#68706c]">{job.message ?? "Verifying job state."}</p>
          <p className="mt-2 break-all font-mono text-[10px] text-[#68706c]">
            Job: {requestId}
          </p>
          {job.runUrl && (
            <a href={job.runUrl} target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-medium text-[#174c38] underline underline-offset-4">
              Open real AST graph and hypotheses in GitHub Actions
            </a>
          )}
          {job.state==="SOURCE_ARTIFACT_AVAILABLE" && (
            <p className="mt-3 text-xs text-[#68706c]">
              The output is a source-only report, not an EVM test and not a scientifically
              admitted composition. Its contents are not yet independently imported into the web.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
