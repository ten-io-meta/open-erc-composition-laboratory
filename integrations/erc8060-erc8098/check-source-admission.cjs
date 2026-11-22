// OECL source admission gate. Operational fixture evidence != ERC-8098 reference.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");

const PINNED_8060 = "c7eed906835ab39fbc8439eb0493e5a5371b23a2";
const EXPECTED_OZ_INTEGRITY = "sha512-xSmezSupL+y9VkHZJGDoCBpmnB2ogM13ccaYDWqJTfS3dbuHkgjuwDFUmaFauBCboQMGB/S5UqUl2y54X99BmA==";

function assess({ external8060Root, oeclRoot, evidencePath }) {
  const actual8060 = execFileSync("git", ["-C", external8060Root, "rev-parse", "HEAD"], {
    encoding: "utf8"
  }).trim();
  assert.equal(actual8060, PINNED_8060, "ERC-8060 source revision mismatch");

  const lock = JSON.parse(fs.readFileSync(path.join(external8060Root, "package-lock.json"), "utf8"));
  const oz = lock.packages?.["node_modules/@openzeppelin/contracts"];
  assert.equal(oz?.version, "4.9.6", "OpenZeppelin version mismatch");
  assert.equal(oz?.integrity, EXPECTED_OZ_INTEGRITY, "OpenZeppelin package integrity mismatch");

  const experimentalPath = path.join(oeclRoot,
    "integrations/erc8060-erc8098/solidity/ERC8098Experimental.sol");
  const sourceBytes = fs.readFileSync(experimentalPath);
  const source = sourceBytes.toString("utf8");
  assert.match(source, /import\s+"@openzeppelin\/contracts\/token\/ERC20\/ERC20.sol"/);
  assert.match(source, /import\s+"@openzeppelin\/contracts\/token\/ERC20\/extensions\/ERC20Burnable.sol"/);

  const experiment = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
  assert.equal(experiment.erc8060PinnedRevision, actual8060);
  assert.equal(experiment.erc8098Status, "EXPERIMENTAL_FIXTURE_NOT_EXTERNAL_REFERENCE");
  const experimentalHash = crypto.createHash("sha256").update(sourceBytes).digest("hex");
  assert.equal(experiment.erc8098FixtureSha256, experimentalHash, "Experimental fixture differs from observed source");

  const result = {
    schemaVersion: "OECL_SOURCE_ADMISSION_V1",
    erc8060: {
      classification: "PINNED_REFERENCE_IMPLEMENTATION",
      repository: "ten-io-meta/erc8060-native-eth-value",
      revision: actual8060
    },
    openZeppelin: {
      classification: "INDEPENDENT_LIBRARY_DEPENDENCY_ONLY",
      name: "@openzeppelin/contracts",
      version: oz.version,
      integrity: oz.integrity,
      note: "An independently maintained ERC-20 library is not an independently authored ERC-8098 implementation."
    },
    secondParticipant: {
      classification: "OECL_LOCAL_EXPERIMENTAL_WRAPPER",
      sha256: experimentalHash,
      sourceOfIndependentERC8098Reference: null
    },
    compositionCandidateAdmission: "BLOCKED_INDEPENDENT_ERC8098_SOURCE_MISSING",
    allowedScientificPolarity: "INCONCLUSIVE",
    missingPrerequisites: [
      "INDEPENDENT_ERC8098_IMPLEMENTATION_AT_PINNED_REVISION",
      "REVIEW_OF_COMPLETE_ERC8098_GUARANTEES",
      "DISCOVERED_CANDIDATE_AND_SOURCE_ATTRIBUTED_CONSTRAINTS"
    ]
  };
  return result;
}

if (require.main === module) {
  const [external8060Root, oeclRoot, evidencePath] = process.argv.slice(2);
  if (!external8060Root || !oeclRoot || !evidencePath) {
    throw new Error("Usage: node check-source-admission.cjs <8060-checkout> <oecl-checkout> <evidence-file>");
  }
  const result = assess({ external8060Root, oeclRoot, evidencePath });
  const destination = evidencePath.replace(/\.json$/, ".admission.json");
  fs.writeFileSync(destination, JSON.stringify(result, null, 2) + "\n");
  console.log("OECL_SOURCE_ADMISSION:" + JSON.stringify(result));
}
module.exports = { assess };
