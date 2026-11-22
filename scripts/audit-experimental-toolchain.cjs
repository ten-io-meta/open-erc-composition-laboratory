// Diagnostic only. The scientific source and its lockfile remain immutable.
// Usage: node scripts/audit-experimental-toolchain.cjs reports/all.json reports/prod.json
const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");

function loadAudit(file) {
  let report;
  try {
    report = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error("AUDIT_REPORT_UNREADABLE: " + path.basename(file) + ": " + error.message);
  }
  if (!report || typeof report !== "object" ||
      !report.metadata || !report.metadata.vulnerabilities ||
      !report.vulnerabilities || typeof report.vulnerabilities !== "object") {
    throw new Error("AUDIT_REPORT_INCOMPLETE: " + path.basename(file));
  }
  return report;
}
function count(report) {
  const v = report.metadata.vulnerabilities;
  return ["info", "low", "moderate", "high", "critical", "total"]
    .map(k => k + "=" + (Number(v[k]) || 0)).join(" ");
}
function packageRows(report) {
  return Object.entries(report.vulnerabilities).map(([name, v]) => {
    const via = (v.via || []).map(x => typeof x === "string" ? x
      : x.name + (x.url ? " " + x.url : "")).join("; ");
    const fix = v.fixAvailable === false ? "NO_KNOWN_FIX"
      : v.fixAvailable === true ? "FIX_POSSIBLE"
      : v.fixAvailable && typeof v.fixAvailable === "object"
        ? "REQUIRES_CHANGE:" + v.fixAvailable.name + "@" + v.fixAvailable.version
        : "FIX_UNKNOWN";
    return { name, severity: v.severity, direct: !!v.isDirect, range: v.range || "",
      affectedNodes: (v.nodes || []).length, fix, via };
  }).sort((a, b) => {
    const priorities = { critical: 4, high: 3, moderate: 2, low: 1, info: 0 };
    return (priorities[b.severity] || 0) - (priorities[a.severity] || 0) ||
      a.name.localeCompare(b.name);
  });
}
const [allFile, prodFile, lockFile] = process.argv.slice(2);
if (!allFile || !prodFile || !lockFile) throw Error("EXPECTED_ALL_PROD_LOCK_FILES");
const all = loadAudit(allFile);
const prod = loadAudit(prodFile);
const lock = fs.readFileSync(lockFile);
const fingerprint = crypto.createHash("sha256").update(lock).digest("hex");
const rows = packageRows(all);
const summary = [
  "# OECL pinned experimental dependency audit",
  "",
  "Pinned research source: ten-io-meta/erc8060-native-eth-value@c7eed906835ab39fbc8439eb0493e5a5371b23a2",
  "",
  "Lockfile SHA-256: " + fingerprint,
  "",
  "Full toolchain (including dev): " + count(all),
  "",
  "Production-only dependency filter: " + count(prod),
  "",
  "This check does not execute third-party package lifecycle scripts or modify the pinned source, lockfile, or scientific results.",
  "",
  "| Name | Severity | Direct? | Affected nodes | Fix | Via |",
  "|---|---|---|---:|---|---|",
  ...rows.map(r => "| " + [r.name, r.severity, r.direct ? "yes" : "no",
      r.affectedNodes, r.fix, r.via.replace(/\|/g, "/").slice(0, 200)].join(" | ") + " |")
].join("\n");
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY)
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n");
fs.writeFileSync(path.join(path.dirname(allFile), "audit-summary.json"),
  JSON.stringify({ sourceRevision: "c7eed906835ab39fbc8439eb0493e5a5371b23a2",
    lockSha256: fingerprint, allCounts: all.metadata.vulnerabilities,
    productionFilteredCounts: prod.metadata.vulnerabilities,
    packages: rows }, null, 2) + "\n");
