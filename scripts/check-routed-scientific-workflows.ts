import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Routing integrity only: a parameterized scientific check must have an
 * executable invocation in its pinned workflow. This does not execute the
 * checks, certify evidence, or override the suite's overall valid=false.
 */
const runner = readFileSync("scripts/run-scientific-regression-suite.ts", "utf8");
const block = runner.match(/const integrationRoutedChecks\s*=\s*new Set\(\[([\s\S]*?)\]\);/);
assert.ok(block, "Missing scientific integration routing manifest");
const names = [...block[1].matchAll(/"(check-[a-z0-9-]+\.ts)"/g)].map(x => x[1]);
assert.equal(names.length, 10, "Review unexpected routed scientific test count");
assert.equal(new Set(names).size, names.length, "Duplicate routed scientific test");
const workflows = [
  ".github/workflows/joint-pinned-references.yml",
  ".github/workflows/joint-native-recipe.yml"
].map(path => ({path, text: readFileSync(path, "utf8")}));
for (const name of names) {
  const escaped = name.replaceAll(".", "\\.");
  const invocation = new RegExp("^\\s*(?:run:\\s*)?npx\\s+tsx\\s+scripts/" + escaped + "\\s+\\S+");
  const found = workflows.flatMap(({path, text}) =>
    text.split(/\r?\n/).filter(line => invocation.test(line)).map(line => ({path, line}))
  );
  assert.equal(found.length, 1,
    name + " must have exactly one pinned workflow invocation with arguments");
  console.log("ROUTED_SCOPED_WORKFLOW_PASS: " + name + " -> " + found[0].path);
}
console.log("PASS: 10 routed probes have unique CLI wiring (not executed by this check)");
