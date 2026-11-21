const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { assess } = require("./check-source-admission.cjs");

const [external8060Root, oeclRoot, evidencePath] = process.argv.slice(2);
if (!external8060Root || !oeclRoot || !evidencePath) throw new Error("Missing checkout/evidence inputs");

const original = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "oecl-admission-"));
const tempEvidence = path.join(tempRoot, "altered.json");
const evaluate = (value) => {
  fs.writeFileSync(tempEvidence, JSON.stringify(value));
  return assess({ external8060Root, oeclRoot, evidencePath: tempEvidence });
};
try {
  const valid = evaluate(original);
  assert.equal(valid.compositionCandidateAdmission, "BLOCKED_INDEPENDENT_ERC8098_SOURCE_MISSING");
  assert.equal(valid.allowedScientificPolarity, "INCONCLUSIVE");
  assert.equal(valid.openZeppelin.classification, "INDEPENDENT_LIBRARY_DEPENDENCY_ONLY");
  const badRevision = { ...original, erc8060PinnedRevision: "0".repeat(40) };
  assert.throws(() => evaluate(badRevision), { name: "AssertionError" });
  const badSecondSource = { ...original, erc8098Status: "INDEPENDENT_REFERENCE" };
  assert.throws(() => evaluate(badSecondSource));
  const badFixture = { ...original, erc8098FixtureSha256: "0".repeat(64) };
  assert.throws(() => evaluate(badFixture), { name: "AssertionError" });
  console.log("PASS: OECL source admission is fail-closed (4 cases)");
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
