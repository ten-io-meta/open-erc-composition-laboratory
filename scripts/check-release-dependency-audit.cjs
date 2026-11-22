#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const [file, scope, mode = "report"] = process.argv.slice(2);
if (!file || !scope || !["report", "gate"].includes(mode)) {
  console.error("Usage: check-release-dependency-audit.cjs audit.json scope report|gate");
  process.exit(2);
}
let audit;
try { audit = JSON.parse(fs.readFileSync(file, "utf8")); }
catch (e) { console.error("OECL_AUDIT_INVALID_JSON:", String(e)); process.exit(2); }
if (audit.error || !audit.metadata?.vulnerabilities ||
    !audit.vulnerabilities || typeof audit.vulnerabilities !== "object") {
  console.error("OECL_AUDIT_UNAVAILABLE:", JSON.stringify(audit.error || audit).slice(0, 900));
  process.exit(2);
}
const counts = audit.metadata.vulnerabilities;
const packages = Object.entries(audit.vulnerabilities).map(([name, value]) => ({
  name,
  severity: value.severity,
  direct: value.isDirect === true,
  range: value.range,
  via: (Array.isArray(value.via) ? value.via : [])
    .map(v => typeof v === "string" ? v : ({
      title: v.title, url: v.url, range: v.range, severity: v.severity
    })).slice(0, 8),
  fixAvailable: value.fixAvailable,
})).filter(v => ["critical", "high", "moderate", "low"].includes(v.severity));
const blockers = packages.filter(v => ["critical", "high"].includes(v.severity));
console.log("OECL_DEPENDENCY_AUDIT:" + JSON.stringify({
  scope, mode,
  counts: {
    critical: counts.critical || 0, high: counts.high || 0,
    moderate: counts.moderate || 0, low: counts.low || 0
  },
  affected: packages,
  releaseBlockerCount: blockers.length,
}));
if (mode === "gate" && blockers.length) {
  console.error("OECL_RELEASE_BLOCKED_HIGH_OR_CRITICAL_DEPENDENCY:", scope);
  process.exitCode = 1;
}
