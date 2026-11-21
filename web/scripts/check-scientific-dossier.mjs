import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const file = fileURLToPath(new URL("../src/data/erc8060Erc8098ScientificDossier.json", import.meta.url));
const d = JSON.parse(readFileSync(file, "utf8"));
const canonical = x => JSON.stringify(x);
const sha256 = x => createHash("sha256").update(x).digest("hex");
const expectedDigest = "9cfb5bbd4bf0b98a424827a13057507d5ef3f3ea3e30e256eb9cc8cdf2ef13a6";

function accept(x) {
  const pairs = x.participants ?? [];
  const questions = x.scientificQuestions ?? {};
  const a = x.adversarial ?? {};
  return sha256(canonical(x)) === expectedDigest &&
    x.schemaVersion === "OECL_USER_SCIENTIFIC_DOSSIER_V1" &&
    x.verdict === "INCONCLUSIVE" &&
    x.candidateAdmission === "NOT_ADMITTED" &&
    x.scope === "PINNED_LOCAL_HARDHAT_EVM" &&
    x.universalCompatibilityEstablished === false &&
    x.discovery?.status === "UNEVALUATED_SOURCE_HYPOTHESIS" &&
    x.discovery?.origin === "COMPILER_RESOLVED_SOLIDITY_AST_ONLY" &&
    x.experiment?.propertyStatus === "OBSERVED_IN_PINNED_LOCAL_EVM" &&
    x.experiment?.chainId === 31337 &&
    x.experiment?.localConstraintResult === "SUPPORT" &&
    x.experiment?.bothBurnsInSameTransaction === true &&
    pairs.length === 2 &&
    pairs[0].revision === "c7eed906835ab39fbc8439eb0493e5a5371b23a2" &&
    pairs[1].revision === "68a05289bd68d89db8453c49500e0a1ae6cd11ec" &&
    questions.total === 10 &&
    questions.scopedObserved === 10 &&
    questions.allQuestionsResolved === false &&
    questions.sourceCoverageComplete === false &&
    questions.observations.length === 10 &&
    new Set(questions.observations.map(q => q.questionId)).size === 10 &&
    questions.observations.every(q => q.status === "SCOPED_OBSERVED" && q.missing.length > 0) &&
    a.status === "PARTIAL_COVERAGE" &&
    a.observedCaseIds.length === 11 &&
    a.untested.length === 9;
}
assert.equal(accept(d), true, "Pinned scientific dossier failed independent read-only validation.");

const tampering = [
  ["promote_global_support", x => { x.verdict = "SUPPORTS"; }],
  ["admit_unverified_candidate", x => { x.candidateAdmission = "ADMITTED"; }],
  ["hide_unverified_source_coverage", x => { x.scientificQuestions.sourceCoverageComplete = true; }],
  ["hide_untested_threats", x => { x.adversarial.untested = []; }],
  ["forge_transaction", x => { x.experiment.transactionHash = "0x" + "0".repeat(64); }],
  ["change_source_revision", x => { x.participants[1].revision = "0".repeat(40); }],
  ["fake_property_scope", x => { x.experiment.propertyStatus = "UNIVERSALLY_PROVEN"; }],
  ["fake_question_result", x => { x.scientificQuestions.observations[0].status = "FULLY_PROVEN"; }],
  ["modify_evidence_digest", x => { x.artifacts.evm.sha256 = "0".repeat(64); }],
];
for (const [name, mutate] of tampering) {
  const altered = structuredClone(d);
  mutate(altered);
  assert.equal(accept(altered), false, "Tampered dossier admitted: " + name);
}
assert.ok(d.scientificQuestions.observations.every(q =>
  q.evidenceRefs.every(ref => /^SHA256:[a-f0-9]{64}$/.test(ref))));
console.log("OECL_WEB_PINNED_DOSSIER: PASS · 9 negative controls · verdict INCONCLUSIVE");
