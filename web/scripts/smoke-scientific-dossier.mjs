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
  console.log("OECL_WEB_HTTP_SMOKE: PASS — pinned, reversed, invalid, unknown, JSON export, disabled jobs");  console.log("OECL_WEB_HTTP_SMOKE: PASS — pinned, reversed, invalid, unknown, JSON export");
} finally {
  if (server.pid) {
    try { process.kill(-server.pid, "SIGTERM"); } catch { /* Already exited. */ }
  }
}
