"use client";

import { useEffect, useState } from "react";

type Availability = {
  enabled: boolean;
  status: string;
  message: string;
  scenario: string;
  requiresResearchAccessKey: boolean;
};
type Job = {
  requestId?: string;
  status: string;
  state?: string;
  runUrl?: string | null;
  runId?: number | null;
  scientificVerdict?: string | null;
  message?: string;
};

const terminal = new Set(["EVIDENCE_AVAILABLE", "EXECUTION_FAILED"]);

export function PinnedAnalysisJobLauncher({ isSelected }: { isSelected: boolean }) {
  const [config, setConfig] = useState<Availability | null>(null);
  const [accessKey, setAccessKey] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/scientific/jobs", { signal: controller.signal, cache: "no-store" })
      .then(async r => r.json() as Promise<Availability>)
      .then(response => { if (!controller.signal.aborted) setConfig(response); })
      .catch(() => {
        if (!controller.signal.aborted) {
          setConfig({
            enabled: false, status: "CONFIGURATION_UNAVAILABLE",
            message: "The independent analysis runner is not available.",
            scenario: "", requiresResearchAccessKey: true,
          });
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!jobId || accessKey.length < 32) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function inspect() {
      try {
        const response = await fetch("/api/scientific/jobs/" + encodeURIComponent(jobId!), {
          headers: { "x-oecl-access-key": accessKey },
          cache: "no-store",
        });
        const body = await response.json() as Job;
        if (stopped) return;
        if (!response.ok) {
          setError(body.status || "Analysis status is unavailable.");
        } else {
          setJob(body);
          setError(null);
        }
        if (!terminal.has(body.state ?? "") && !stopped) {
          timer = setTimeout(inspect, 5000);
        }
      } catch {
        if (!stopped) {
          setError("Could not verify the scientific job status.");
          timer = setTimeout(inspect, 5000);
        }
      }
    }
    timer = setTimeout(inspect, 1200);
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [jobId, accessKey]);

  async function start() {
    if (!config?.enabled || !isSelected || submitting || accessKey.length < 32) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/scientific/jobs", {
        method: "POST",
        headers: { "x-oecl-access-key": accessKey },
        cache: "no-store",
      });
      const body = await response.json() as Job;
      if (!response.ok || body.status !== "DISPATCH_ACCEPTED" || !body.requestId) {
        throw new Error(body.status || "Request was not accepted by the isolated runner.");
      }
      setJob(body);
      setJobId(body.requestId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Analysis submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-7 rounded-2xl border border-[#dfe4e1] bg-[#f7f9f7] p-5" aria-label="New pinned scientific experiment">
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#174c38]">
        New analysis · controlled research beta
      </p>
      <h3 className="mt-2 text-lg font-medium">Run a fresh pinned experiment</h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#68706c]">
        Reproduce the ERC-8060 × ERC-8098 AST and local-EVM study in GitHub Actions.
        Only the fixed, pre-reviewed source revisions are accepted. Other pairs and
        arbitrary Solidity execution are not enabled.
      </p>
      {!config ? (
        <p role="status" className="mt-4 text-sm text-[#68706c]">Checking isolated runner availability...</p>
      ) : !config.enabled ? (
        <p className="mt-4 rounded-xl border border-[#dfe4e1] bg-white px-4 py-3 text-sm text-[#68706c]">
          Runner unavailable on this deployment. The pinned scientific dossier above remains readable.
          No analysis has been submitted.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          <label htmlFor="oecl-research-access-key" className="block text-sm font-medium">
            Research beta access key
          </label>
          <input
            id="oecl-research-access-key"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={accessKey}
            onChange={event => setAccessKey(event.target.value)}
            placeholder="Researcher access key"
            className="w-full rounded-xl border border-[#cfd7d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#174c38]"
          />
          <p className="text-xs text-[#68706c]">
            The key is sent only to the OECL API over HTTPS and is not saved by this interface.
          </p>
          <button
            type="button"
            disabled={!isSelected || accessKey.length < 32 || submitting || Boolean(jobId)}
            onClick={start}
            className="rounded-xl bg-[#174c38] px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Requesting isolated execution..." : "Request fresh pinned analysis"}
          </button>
          {!isSelected && (
            <p className="text-xs text-[#806921]">
              Select ERC-8060 and ERC-8098 to run the currently supported pinned recipe.
            </p>
          )}
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-[#9b3128]">{error}</p>}
      {job && (
        <div role="status" className="mt-5 rounded-xl border border-[#dfe4e1] bg-white p-4">
          <p className="font-mono text-xs font-semibold">{job.state ?? job.status}</p>
          <p className="mt-1 text-xs text-[#68706c]">{job.message ?? "Verifying the workflow state."}</p>
          <p className="mt-3 break-all font-mono text-[11px] text-[#68706c]">
            Request ID: {jobId}
          </p>
          {job.runUrl && (
            <a href={job.runUrl} target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-medium text-[#174c38] underline underline-offset-4">
              View execution and original evidence on GitHub
            </a>
          )}
          {job.state === "EVIDENCE_AVAILABLE" && (
            <p className="mt-3 text-xs text-[#68706c]">
              Fresh evidence has been produced. Automated ingestion and
              independent comparison with the pinned public dossier are not enabled yet.
              This status is not a scientific SUPPORTS verdict.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
