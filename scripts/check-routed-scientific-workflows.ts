import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Regression routing integrity: a parameterized check must have an exact
 * executable invocation in its pinned workflow, not merely be skipped by the
 * parameterless core runner. This is a wiring check, NOT an execution receipt.
 */
const runner = readFileSync("scripts/run-scientific-regression-suite.ts", "utf8");
const match = runner.match(/const integrationRoutedChecks\\s*=\\s*new Set\\(\\[([\\s\\S]*?)\\]\\);/);
assert.ok(match, "Missing scientific integration routing manifest");
const names = [...match[1].matchAll(/"([^"]+\\.ts)"/g)].map(x => x[1]);
assert.equal(names.length, 10, "Review unexpected routed scientific test count");
assert.equal(new Set(names).size, names.length, "Duplicate routed scientific test");
const workflows = [
  ".github/workflows/joint-pinned-references.yml",
  ".github/workflows/joint-native-recipe.yml"
].map(path => ({path, text: readFileSync(path, "utf8")}));
for (const name of names) {
  const escaped = name.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&");
  const invocation = new RegExp("^\\s*(?:run:\\s*)?npx\\s+tsx\\s+scripts/" + escaped + "\\s+\\S+");
  const matches = workflows.flatMap(({path,text}) => text.split(/\\r?\\n/).filter(line => invocation.test(line)).map(line => ({path,line})));
  assert.equal(matches.length, 1, name + " must have exactly one pinned workflow invocation with arguments");
  console.log("ROUTED_SCOPED_WORKFLOW_PASS: " + name + " -> " + matches[0].path);
}
console.log("PASS: all 10 routed scientific checks have unique pinned CLI invocations (NOT executed in this wiring check)");
