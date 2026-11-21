import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { SolidityScientificSourceFactExtractor } from "../laboratory/scientific-source-fact/SolidityScientificSourceFactExtractor.js";
import { ScientificCompositionConstraintEvaluatorEngine } from "../laboratory/scientific-composition-constraint-evaluation/ScientificCompositionConstraintEvaluatorEngine.js";
import type { ScientificSourceObservation } from "../laboratory/scientific-source-observation/ScientificSourceObservation.js";
import type { ScientificCompositionConstraint } from "../laboratory/scientific-composition-evaluation-specification/ScientificCompositionConstraint.js";

const A = {
    side: "A" as const, id: "ERC-8060",
    repo: "ten-io-meta/erc8060-native-eth-value",
    revision: "c7eed906835ab39fbc8439eb0493e5a5371b23a2",
    file: "contracts/ERC8060Reference.sol",
    requireFragment: "Not token owner"
};
const B = {
    side: "B" as const, id: "ERC-8098",
    repo: "ten-io-meta/erc8098-reference",
    revision: "68a05289bd68d89db8453c49500e0a1ae6cd11ec",
    file: "contracts/ERC8098Reference.sol",
    requireFragment: "ERC8098: zero initial holder"
};
const candidateId = "UNADMITTED-JOINT-ERC8060-ERC8098";

async function sourceConstraints(root: string, specification: typeof A | typeof B) {
    const revision = execFileSync("git", ["-C", root, "rev-parse", "HEAD"], {encoding:"utf8"}).trim();
    assert.equal(revision, specification.revision, "Source checkout revision mismatch");
    const rawText = await readFile(join(root, specification.file), "utf8");
    const observation: ScientificSourceObservation = {
        observationId: "PINNED-SOURCE-" + specification.side,
        sourceId: "GITHUB-" + specification.repo.replaceAll("/", "-"),
        sourceType: "GITHUB",
        sourceRevision: revision,
        kind: "CONTRACT_SOURCE",
        locator: {
            sourceLocation: specification.repo + "@" + revision,
            filePath: specification.file,
            startLine: 1,
            endLine: rawText.split(/\r?\n/).length
        },
        rawText
    };
    const facts = new SolidityScientificSourceFactExtractor().extract(observation);
    const selected = facts.filter(f =>
        f.kind === "REQUIRE_STATEMENT" &&
        f.rawText.includes(specification.requireFragment) &&
        f.containerKind === "CONTRACT" &&
        f.containerSymbol === (specification.side === "A" ? "ERC8060Reference" : "ERC8098Reference")
    );
    assert.equal(selected.length, 1, "Unique real source guard not found");
    const fact = selected[0];
    const constraint: ScientificCompositionConstraint = {
        constraintId: "PINNED-CONSTRAINT-" + specification.side,
        candidateId,
        participantSide: specification.side,
        participantKind: "PROTOCOL",
        participantId: specification.id,
        sourceId: observation.sourceId,
        sourceRevision: revision,
        factId: fact.factId,
        basis: "SOLIDITY_REQUIRE_STATEMENT",
        containerKind: "CONTRACT",
        containerSymbol: fact.containerSymbol!,
        locator: fact.locator,
        rawText: fact.rawText
    };
    return { constraint, factsExtracted: facts.length, source: specification.repo + "@" + revision };
}

async function main() {
    const [root8060, root8098, evidenceFile] = process.argv.slice(2);
    assert.ok(root8060 && root8098 && evidenceFile, "Expected two checked-out sources and EVM JSON evidence");
    const evidence = JSON.parse(await readFile(evidenceFile, "utf8"));
    assert.equal(evidence.erc8060PinnedRevision, A.revision);
    assert.equal(evidence.erc8098PinnedRevision, B.revision);
    assert.equal(evidence.classification, "LOCAL_REAL_EVM_TWO_PINNED_REFERENCE_REPOSITORIES");
    assert.equal(evidence.observations.sameTransactionContainsBothBurns, true);
    const left = await sourceConstraints(root8060, A);
    const right = await sourceConstraints(root8098, B);
    // The existing scientific engine consumes only attributed observations.
    // Successful execution does NOT prove each require-statement guard was exercised
    // or establish completeness of protocol-level supply and solvency invariants.
    const evaluation = new ScientificCompositionConstraintEvaluatorEngine()
        .evaluate([left.constraint, right.constraint], []);
    assert.equal(evaluation.scientificPolarity, "INCONCLUSIVE");
    assert.equal(evaluation.statistics.unevaluated, 2);
    const report = {
        schemaVersion: "OECL_NATIVE_SOURCE_FACT_ADMISSION_V1",
        candidateId,
        discoveryStatus: "NOT_ADMITTED_BY_CROSS_PROTOCOL_DISCOVERY",
        runtimeSource: "REPRODUCIBLE_LOCAL_EVM_CI_NOT_YET_NATIVE_RECIPE",
        sourceEvidence: [left, right],
        sourceConstraintEvaluation: evaluation,
        guardScope: "two source-extracted require statements only; not a complete protocol or interaction invariant set",
        jointTransactionHash: evidence.transactions.jointRedemption,
        finalScientificResult: "INCONCLUSIVE",
        pending: [
            "REAL_DISCOVERED_CANDIDATE_IDENTITY",
            "NATIVE_RECIPE_EXECUTION_WITH_SOURCE_PINNING",
            "SOURCE_DERIVED_SUPPLY_AND_ETH_INVARIANT_COVERAGE",
            "MACHINE_ATTESTED_PER_CONSTRAINT_RUNTIME_OBSERVATIONS"
        ]
    };
    await writeFile(evidenceFile.replace(/\.json$/, ".native.json"), JSON.stringify(report, null, 2) + "\n");
    console.log("OECL_NATIVE_SOURCE_ADMISSION:" + JSON.stringify({
        sourceFactsA:left.factsExtracted, sourceFactsB:right.factsExtracted,
        constraints: evaluation.statistics.total, unevaluated:evaluation.statistics.unevaluated,
        finalScientificResult: report.finalScientificResult
    }));
}
main().catch(e => { console.error(e); process.exitCode = 1; });
