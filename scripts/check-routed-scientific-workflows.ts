import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

/**
 * Regression routing integrity: each integration-only scientific test must
 * retain a unique parameterized invocation in a pinned workflow. This checks
 * CI wiring, NOT proof of runtime execution or scientific admission.
 *
 * The original ten pinned probes are mandatory. Later additions are also
 * checked; their exact number is not frozen, so stacked research branches
 * can add new EVM experiments without weakening earlier coverage.
 */
const runner = readFileSync("scripts/run-scientific-regression-suite.ts", "utf8");
const block = runner.match(/const integrationRoutedChecks\s*=\s*new Set\(\[([\s\S]*?)\]\);/);
assert.ok(block, "Missing scientific integration routing manifest");
const names = [...block[1].matchAll(/"(check-[a-z0-9-]+\.ts)"/g)].map(x => x[1]);
assert.equal(new Set(names).size, names.length, "Duplicate routed scientific test");

const required = [
  "check-ast-evm-native-bridge.ts",
  "check-native-ast-behavioral-coverage.ts",
  "check-native-ast-behavioral-specification.ts",
  "check-pinned-behavioral-native-witness.ts",
  "check-pinned-burn-semantic-distinction.ts",
  "check-pinned-candidate-admission.ts",
  "check-pinned-interaction-hypothesis.ts",
  "check-pinned-joint-native-source-admission.ts",
  "check-pinned-native-joint-recipe.ts",
  "check-pinned-real-scientific-discovery.ts"
];
for (const name of required)
  assert.ok(names.includes(name), "Mandatory pinned scientific check lost its routing: " + name);

const paths = [
  ".github/workflows/joint-pinned-references.yml",
  ".github/workflows/joint-native-recipe.yml",
  ".github/workflows/oecl-independent-burnable-evm.yml",
  // Same-run AST/EVM artifacts for source-generated scientific prediction replay.
  ".github/workflows/oecl-generic-source-lab.yml"
];
const workflows = paths.filter(existsSync)
  .map(path => ({path, text: readFileSync(path, "utf8")}));
for (const name of names) {
  assert.ok(existsSync("scripts/" + name),
    "Routed scientific test source is missing: " + name);
  const escaped = name.replaceAll(".", "\\.");
  const invocation = new RegExp("^\\s*(?:run:\\s*)?npx\\s+tsx\\s+scripts/" + escaped + "\\s+\\S+");
  const matches = workflows.flatMap(({path, text}) =>
    text.split(/\r?\n/).filter(line => invocation.test(line))
      .map(line => ({path,line}))
  );
  assert.equal(matches.length, 1,
    name + " must have exactly one pinned workflow invocation with arguments");
  console.log("ROUTED_SCOPED_WORKFLOW_PASS: " + name + " -> " + matches[0].path);
}
console.log("PASS: all " + names.length +
  " integration probes have unique pinned CLI wiring (not executed by this check)");
