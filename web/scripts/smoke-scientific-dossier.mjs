import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const port = 31967;
const server = spawn("npm", ["run", "start", "--", "--port", String(port)], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(port) },
  stdio: "ignore",
  detached: true,
});
const base = "http://127.0.0.1:" + port;
const endpoint = base + "/api/scientific/dossier";
const expected = "9cfb5bbd4bf0b98a424827a13057507d5ef3f3ea3e30e256eb9cc8cdf2ef13a6";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    if (server.exitCode !== null) break;
    try {
      const res = await fetch(base + "/");
      if (res.status === 200) { ready = true; break; }
    } catch { /* Server startup. */ }
    await sleep(500);
  }
  assert.ok(ready, "Production Next.js server did not become ready.");

  const url = endpoint + "?protocolA=ERC-8060&protocolB=ERC-8098";
  const good = await fetch(url);
  assert.equal(good.status, 200);
  assert.equal(good.headers.get("x-oecl-snapshot-sha256"), expected);
  assert.match(good.headers.get("cache-control") ?? "", /no-store/);
  const body = await good.json();
  assert.equal(body.status, "PINNED_SCIENTIFIC_DOSSIER");
  assert.equal(body.snapshotSha256, expected);
  assert.equal(body.dossier.verdict, "INCONCLUSIVE");
  assert.equal(body.dossier.candidateAdmission, "NOT_ADMITTED");
  assert.equal(body.dossier.scientificQuestions.total, 10);
  assert.equal(body.dossier.scientificQuestions.sourceCoverageComplete, false);
  assert.equal(body.dossier.adversarial.untested.length, 9);

  const reversed = await fetch(endpoint + "?protocolA=8098&protocolB=8060");
  assert.equal(reversed.status, 200);
  const invalid = await fetch(endpoint + "?protocolA=ERC-8060&protocolB=ERC-8060");
  assert.equal(invalid.status, 400);
  const unknown = await fetch(endpoint + "?protocolA=ERC-8004&protocolB=ERC-8060");
  assert.equal(unknown.status, 404);
  const unknownBody = await unknown.json();
  assert.equal(unknownBody.status, "NO_VERIFIED_DOSSIER");
  assert.equal(unknownBody.scientificConclusion, "NOT_EVALUATED");

  const file = await fetch(url + "&download=1");
  assert.equal(file.status, 200);
  assert.match(file.headers.get("content-disposition") ?? "", /attachment/);
  const downloaded = await file.json();
  assert.deepEqual(downloaded, body.dossier);

  // The on-demand service is intentionally fail-closed without credentials.
  const availability = await fetch(base + "/api/scientific/jobs");
  assert.equal(availability.status, 200);
  const config = await availability.json();
  assert.equal(config.arbitraryRepositoryAnalysisAvailable, false);
  assert.equal(config.requiresResearchAccessKey, true);
  assert.equal(config.enabled, false);
  const refused = await fetch(base + "/api/scientific/jobs", { method: "POST" });
  assert.equal(refused.status, 503);
  const refusedBody = await refused.json();
  assert.equal(refusedBody.status, "NOT_CONFIGURED");
  const unknownStatus = await fetch(base + "/api/scientific/jobs/123e4567-e89b-42d3-a456-426614174000");
  assert.equal(unknownStatus.status, 503);
  const localEvm=await fetch(base+"/api/scientific/erc4626-evm");
  assert.equal(localEvm.status,200);
  const erc4626=await localEvm.json();
  assert.equal(erc4626.status,"VERIFIED_PINNED_LOCAL_EVM");
  assert.equal(erc4626.runId,45212718140);
  assert.equal(erc4626.experiment.scientificVerdict,"INCONCLUSIVE");
  assert.equal(erc4626.experiment.candidateAdmission,"NOT_ADMITTED");
  assert.equal(erc4626.experiment.localChainId,31337);
  assert.equal(erc4626.experiment.minedReceipts.length,7);
  assert.equal(erc4626.experiment.readOnlyNegativeControls.length,3);
  assert.ok(erc4626.experiment.minedReceipts.every(r=>r.status===1&&/^0x[0-9a-f]{64}$/.test(r.txHash)));
  assert.ok(erc4626.experiment.readOnlyNegativeControls.every(r=>r.transactionMined===false));
  const receiptDownload=await fetch(base+"/api/scientific/erc4626-evm?download=1");
  assert.equal(receiptDownload.status,200);
  assert.match(receiptDownload.headers.get("content-disposition")||"",/attachment; filename=/);
  const downloaded4626=await receiptDownload.json();
  assert.equal(downloaded4626.runId,45212718140);
  console.log("OECL_ERC4626_NEW_LOCAL_EVM_PUBLIC_RECEIPTS_PASS");

  // The new public dossier is a compact, independently reviewed scientific
  // cycle, NOT a compatibility approval or a live EVM replay.
  const cycleUrl=base+"/api/scientific/cycles?sourceA=ERC-4626&sourceB=ERC-20";
  const cycleRes=await fetch(cycleUrl);
  assert.equal(cycleRes.status,200);
  assert.match(cycleRes.headers.get("cache-control")||"",/no-store/);
  const cycle=await cycleRes.json();
  assert.equal(cycle.status,"REVIEWED_SCOPED_SCIENTIFIC_CYCLE");
  assert.equal(cycle.cycle.hypothesisKind,"SHARED_STANDARD_INHERITANCE");
  assert.equal(cycle.cycle.tests.length,3);
  assert.equal(cycle.cycle.tests[2].evidenceType,"UNMINED_READ_ONLY_ABI_PROBE");
  assert.equal(cycle.cycle.tests[2].rawReturn,"0x");
  assert.equal(cycle.cycle.tests[2].callReverted,false);
  assert.equal(cycle.cycle.tests[2].decodableAsDeposit,false);
  assert.equal(cycle.cycle.provenance.sourceRunId,45465965307);
  assert.equal(cycle.scientificVerdict,"INCONCLUSIVE");
  assert.equal(cycle.compatibilityVerdict,"NOT_EVALUATED");
  assert.equal(cycle.candidateAdmission,"NOT_ADMITTED");
  const reversedCycle=await fetch(base+"/api/scientific/cycles?sourceA=ERC-20&sourceB=ERC-4626");
  assert.equal(reversedCycle.status,200);
  assert.equal((await reversedCycle.json()).snapshotSha256,cycle.snapshotSha256);
  const cycle2=await fetch(base+"/api/scientific/cycles?sourceA=ERC-8098&sourceB=ERC-4626");
  assert.equal(cycle2.status,200);
  const cycle2Json=await cycle2.json();
  assert.equal(cycle2Json.cycle.hypothesisKind,"POTENTIAL_COUPLED_STATE_DECREASE");
  assert.equal(cycle2Json.cycle.preregisteredTestCount,4);
  assert.equal(cycle2Json.cycle.tests.length,2);
  assert.equal(cycle2Json.cycle.tests.every(t=>/^0x[a-f0-9]{64}$/i.test(t.zeroTx)),true);
  assert.equal(cycle2Json.compatibilityVerdict,"NOT_EVALUATED");
  const cycleExport=await fetch(cycleUrl+"&download=1");
  assert.equal(cycleExport.status,200);
  assert.match(cycleExport.headers.get("content-disposition")||"",/attachment/);
  assert.deepEqual(await cycleExport.json(),cycle);
  const unknownCycle=await fetch(base+"/api/scientific/cycles?sourceA=ERC-721&sourceB=ERC-20");
  assert.equal(unknownCycle.status,404);
  assert.equal((await unknownCycle.json()).evmExecuted,false);
  const invalidCycle=await fetch(base+"/api/scientific/cycles?sourceA=ERC-20&sourceB=ERC-20");
  assert.equal(invalidCycle.status,400);
  console.log("OECL_SCIENTIFIC_CYCLE_API_PASS:2 reviewed hypothesis-falsifier-EVM-conclusion paths");
  const sourceConfig = await fetch(base + "/api/scientific/source-jobs");
  assert.equal(sourceConfig.status, 200);
  const sourceSettings = await sourceConfig.json();
  assert.equal(sourceSettings.enabled, false);
  assert.equal(sourceSettings.acceptsArbitraryRepositories, false);
  assert.equal(sourceSettings.runsEvm, false);
  assert.equal(sourceSettings.sources.length, 10);
  for (const id of ["ERC-165", "ERC-2612", "ERC-2981", "ERC-4626"])
    assert.ok(sourceSettings.sources.some(source => source.id === id));
  const sourceRejected = await fetch(base + "/api/scientific/source-jobs", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sourceA: "ERC-8060", sourceB: "ERC-20-BURNABLE" }),
  });
  assert.equal(sourceRejected.status, 503);
  const sourceStatus = await fetch(base + "/api/scientific/source-jobs/123e4567-e89b-42d3-a456-426614174000");
  assert.equal(sourceStatus.status, 503);
  const verifiedPairs = [
    ["ERC-8060", "ERC-8098", 1],
    ["ERC-8060", "ERC-20-BURNABLE", 1],
    ["ERC-8098", "ERC-20", 1],
    ["ERC-1155", "ERC-20", 0],
  ];
  for (const [a,b,count] of verifiedPairs) {
    const r = await fetch(base + "/api/scientific/source-views?sourceA=" +
      encodeURIComponent(a) + "&sourceB=" + encodeURIComponent(b));
    assert.equal(r.status, 200, "Verified AST view unavailable for "+a+" × "+b);
    assert.equal(r.headers.get("x-oecl-snapshot-sha256"),
      "93c27209e59493996106305f1652f106e51db8aa24ae7e3ae2d99c8fbd02f978");
    const body = await r.json();
    assert.equal(body.status, "VERIFIED_SOURCE_GRAPH");
    assert.equal(body.view.scientificVerdict, "INCONCLUSIVE");
    assert.equal(body.view.candidateAdmission, "NOT_ADMITTED");
    assert.equal(body.view.hypotheses.length, count);
    assert.ok(body.view.nodes.length > 0);
    assert.equal(body.view.selected[0].id, a);
    assert.equal(body.view.selected[1].id, b);
  }
  const notMaterialized = await fetch(base +
    "/api/scientific/source-views?sourceA=ERC-20&sourceB=ERC-721");
  assert.equal(notMaterialized.status, 404);
  const badExample = await fetch(base +
    "/api/scientific/source-views?sourceA=ERC-9999&sourceB=ERC-20");
  assert.equal(badExample.status, 400);
  const disabledLiveGraph = await fetch(base +
    "/api/scientific/source-jobs/123e4567-e89b-42d3-a456-426614174000/view?sourceA=ERC-8060&sourceB=ERC-8098");
  assert.equal(disabledLiveGraph.status, 503);
  const newEvm = await fetch(base +
    "/api/scientific/independent-evm?sourceA=ERC-8060&sourceB=ERC-20-BURNABLE");
  assert.equal(newEvm.status,200);
  assert.equal(newEvm.headers.get("x-oecl-snapshot-sha256"),
    "e0ca78bf9fa95925f62a5f100b60c9ed551c26a67c7e5553986e10b006428e66");
  const independent = await newEvm.json();
  assert.equal(independent.status,"VERIFIED_INDEPENDENT_EVM_EVIDENCE");
  assert.equal(independent.report.scientificVerdict,"INCONCLUSIVE");
  assert.equal(independent.report.candidateAdmission,"NOT_ADMITTED");
  assert.equal(independent.report.nativeEvaluation.localPropertyPolarity,"SUPPORT");
  assert.equal(independent.report.nativeEvaluation.nativeCandidateAdmissionPerformed,false);
  assert.equal(independent.report.cases.length,10);
  const independentJson = await fetch(base +
    "/api/scientific/independent-evm?sourceA=ERC-8060&sourceB=ERC-20-BURNABLE&download=1");
  assert.equal(independentJson.status,200);
  assert.match(independentJson.headers.get("content-disposition")??"",/attachment/);
  assert.deepEqual(await independentJson.json(),independent.report);
  const unknownEvm = await fetch(base +
    "/api/scientific/independent-evm?sourceA=ERC-8060&sourceB=ERC-8098");
  assert.equal(unknownEvm.status,404);
  console.log("OECL_WEB_HTTP_SMOKE: PASS — pinned AST examples, independent EVM + native receipt, disabled worker, read-only JSON exports");
} finally {
  if (server.pid) {
    try { process.kill(-server.pid, "SIGTERM"); } catch { /* Already exited. */ }
  }
}
