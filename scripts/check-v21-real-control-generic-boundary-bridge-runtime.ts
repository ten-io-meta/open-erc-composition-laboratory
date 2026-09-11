import {
    execFile
} from "node:child_process";

import {
    promisify
} from "node:util";

import {
    readFile,
    rm
} from "node:fs/promises";

import {
    join
} from "node:path";

import {
    tmpdir
} from "node:os";

import {
    GitHubAdapter
} from "../laboratory/github-adapter/GitHubAdapter.js";

import {
    ScientificSemanticDerivationEngine
} from "../laboratory/scientific-semantic-derivation/ScientificSemanticDerivationEngine.js";

import {
    ScientificCapabilityAttributionEngine
} from "../laboratory/scientific-capability-attribution/ScientificCapabilityAttributionEngine.js";

import {
    ScientificProtocolIdentityAttributionEngine
} from "../laboratory/scientific-protocol-identity/ScientificProtocolIdentityAttributionEngine.js";

import {
    ScientificStructuralProtocolRelationEvidenceEngine
} from "../laboratory/scientific-protocol-relation-evidence/ScientificStructuralProtocolRelationEvidenceEngine.js";

import {
    ScientificProtocolCompositionProfileEngine
} from "../laboratory/scientific-protocol-composition-profile/ScientificProtocolCompositionProfileEngine.js";

import {
    CrossProtocolCompositionEngine
} from "../laboratory/scientific-cross-protocol-composition/CrossProtocolCompositionEngine.js";

import {
    ScientificStructuralFoundationCompositionCandidateEngine
} from "../laboratory/scientific-structural-foundation-candidate/ScientificStructuralFoundationCompositionCandidateEngine.js";

import {
    ScientificCompositionCandidateSetEngine
} from "../laboratory/scientific-composition-candidate-set/ScientificCompositionCandidateSetEngine.js";

import {
    ScientificCandidateRuntimeBoundaryEvidenceBridgeEngine
} from "../laboratory/scientific-candidate-runtime-evidence-bridge/ScientificCandidateRuntimeBoundaryEvidenceBridgeEngine.js";

import {
    ScientificCompositionCandidateCompatibilityEngine
} from "../laboratory/scientific-composition-candidate-compatibility/ScientificCompositionCandidateCompatibilityEngine.js";

import type {
    ScientificCompositionExecutionRequirement
} from "../laboratory/scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";

import type {
    ScientificCompositionConstraintObservation
} from "../laboratory/scientific-composition-constraint-evaluation/ScientificCompositionConstraintObservation.js";


const execFileAsync =
    promisify(execFile);


let pass = 0;
let fail = 0;


function check(
    name: string,
    condition: boolean
): void {

    console.log(
        `${name}: ${condition ? "PASS" : "FAIL"}`
    );

    condition
        ? pass++
        : fail++;

}


function noErrors(
    stage: string,
    errors: string[]
): void {

    if (errors.length > 0) {
        throw new Error(
            `${stage}\n${errors.join("\n")}`
        );
    }

}


async function buildProfile(
    owner: string,
    repo: string,
    protocolId: string,
    expectedRevision: string
) {

    const github =
        await new GitHubAdapter()
            .run({
                owner,
                repo,
                forceFresh:
                    false
            });


    noErrors(
        `${protocolId} GitHub`,
        github.errors
    );


    const revision =
        github.repository.commitSha;


    if (revision !== expectedRevision) {
        throw new Error(
            `${protocolId} revision mismatch: ${revision}`
        );
    }


    const semantic =
        new ScientificSemanticDerivationEngine()
            .derive({
                sourceId:
                    github.sourceId,
                sourceRevision:
                    revision,
                facts:
                    github.sourceFacts
            });


    noErrors(
        `${protocolId} semantic`,
        semantic.errors
    );


    const capability =
        new ScientificCapabilityAttributionEngine()
            .attribute({
                derivation:
                    semantic,
                facts:
                    github.sourceFacts
            });


    noErrors(
        `${protocolId} capability`,
        capability.errors
    );


    const identity =
        new ScientificProtocolIdentityAttributionEngine()
            .attribute({
                attribution:
                    capability,
                observations:
                    github.sourceObservations
            });


    noErrors(
        `${protocolId} identity`,
        identity.errors
    );


    const structural =
        new ScientificStructuralProtocolRelationEvidenceEngine()
            .extract({
                sourceId:
                    github.sourceId,
                sourceRevision:
                    revision,
                facts:
                    github.sourceFacts,
                protocolAttributedCapabilities:
                    identity.protocolAttributedCapabilities
            });


    noErrors(
        `${protocolId} structural`,
        structural.errors
    );


    const profileResult =
        new ScientificProtocolCompositionProfileEngine()
            .build({
                protocolId,
                sourceId:
                    github.sourceId,
                sourceRevision:
                    revision,
                sourceFacts:
                    github.sourceFacts,
                attributedCapabilities:
                    identity.protocolAttributedCapabilities,
                protocolConcepts:
                    [],
                structuralRelations:
                    structural.relations,
                attributedExternalCalls:
                    []
            });


    noErrors(
        `${protocolId} profile`,
        profileResult.errors
    );


    if (profileResult.profile === null) {
        throw new Error(
            `${protocolId} profile is null.`
        );
    }


    return {
        github,
        revision,
        structural,
        profile:
            profileResult.profile
    };

}


async function main(): Promise<void> {

    console.log("");
    console.log(
        "V2.1 REAL CONTROL -> GENERIC BOUNDARY BRIDGE"
    );
    console.log(
        "============================================"
    );


    const exportPath =
        join(
            tmpdir(),
            `oecl-v21-real-control-${process.pid}.json`
        );


    const command =
        process.platform === "win32"
            ? (
                process.env.ComSpec ??
                "C:\\Windows\\System32\\cmd.exe"
            )
            : "npx";


    const args =
        process.platform === "win32"
            ? [
                "/d",
                "/c",
                "npx tsx .\\scripts\\check-real-erc8004-erc8060-composition-runtime-end-to-end.ts"
            ]
            : [
                "tsx",
                "./scripts/check-real-erc8004-erc8060-composition-runtime-end-to-end.ts"
            ];


    await execFileAsync(
        command,
        args,
        {
            cwd:
                process.cwd(),
            env: {
                ...process.env,
                OECL_V21_REAL_CONTROL_EXPORT:
                    exportPath
            },
            maxBuffer:
                32 * 1024 * 1024
        }
    );


    const exported =
        JSON.parse(
            await readFile(
                exportPath,
                "utf8"
            )
        ) as {
            requirement:
                ScientificCompositionExecutionRequirement;
            constraintObservations:
                ScientificCompositionConstraintObservation[];
            compositionConstraintEvaluation:
                {
                    scientificPolarity?: string;
                    statistics?: {
                        total: number;
                        preserved: number;
                        violated: number;
                        unevaluated: number;
                    };
                } | null;
        };


    await rm(
        exportPath,
        {
            force:
                true
        }
    );


    check(
        "REAL CONTROL EXPORTS EXACTLY 17 RUNTIME CONSTRAINT OBSERVATIONS",
        exported.constraintObservations.length ===
            17
    );


    check(
        "ALL 17 REAL RUNTIME CONSTRAINTS ARE PRESERVED",
        exported.constraintObservations.every(
            observation =>
                observation.verdict ===
                "PRESERVED"
        )
    );


    check(
        "PAIR-SPECIFIC CONSTRAINT EVALUATION REMAINS SUPPORT",
        exported
            .compositionConstraintEvaluation
            ?.scientificPolarity ===
            "SUPPORT"
    );


    const erc8004 =
        await buildProfile(
            "erc-8004",
            "erc-8004-contracts",
            "ERC-8004",
            "b9e466c250744a7e06b13dff9d3c2844ed64f825"
        );


    const erc8060 =
        await buildProfile(
            "ten-io-meta",
            "erc8060-native-eth-value",
            "ERC-8060",
            "c7eed906835ab39fbc8439eb0493e5a5371b23a2"
        );


    const crossProtocol =
        new CrossProtocolCompositionEngine()
            .discover({
                protocolConceptResults:
                    [],
                protocolRelationEvidenceResults:
                    [],
                structuralProtocolRelationEvidenceResults: [
                    erc8004.structural,
                    erc8060.structural
                ]
            });


    noErrors(
        "cross-protocol discovery",
        crossProtocol.errors
    );


    const normalized =
        new ScientificStructuralFoundationCompositionCandidateEngine()
            .normalize(
                crossProtocol
            );


    noErrors(
        "structural normalization",
        normalized.errors
    );


    const normalizedCandidate =
        normalized.candidates.find(
            candidate =>
                candidate.participantAId ===
                    "ERC-8004" &&
                candidate.participantBId ===
                    "ERC-8060" &&
                candidate.foundationProtocolId ===
                    "ERC-721"
        );


    if (normalizedCandidate === undefined) {
        throw new Error(
            "Real normalized ERC-8004 x ERC-8060 candidate missing."
        );
    }


    check(
        "REAL EXECUTION REQUIREMENT USES SAME DISCOVERED SOURCE CANDIDATE",
        exported.requirement.candidate.candidateId ===
            normalizedCandidate.sourceCandidateId
    );


    const candidateSet =
        new ScientificCompositionCandidateSetEngine()
            .build({
                participantIds: [
                    "ERC-8004",
                    "ERC-8060"
                ],
                functionalMatches:
                    [],
                documentaryCandidates:
                    [],
                structuralFoundationCandidates: [
                    normalizedCandidate
                ]
            });


    noErrors(
        "candidate set",
        candidateSet.errors
    );


    const genericCandidate =
        candidateSet.candidates.find(
            candidate =>
                candidate.kind ===
                "STRUCTURAL_FOUNDATION"
        );


    if (
        genericCandidate === undefined ||
        genericCandidate.kind !==
            "STRUCTURAL_FOUNDATION"
    ) {
        throw new Error(
            "Generic structural candidate missing."
        );
    }


    const profiles = [
        erc8004.profile,
        erc8060.profile
    ];


    const genericBoundaryCount =
        profiles.reduce(
            (sum, profile) =>
                sum +
                profile.boundaries.length,
            0
        );


    const bridge =
        new ScientificCandidateRuntimeBoundaryEvidenceBridgeEngine()
            .bridge(
                genericCandidate,
                exported.requirement,
                exported.constraintObservations,
                profiles
            );


    if (bridge.errors.length > 0) {

        console.log("");
        console.log(
            "=== BRIDGE ERRORS ==="
        );

        console.log(
            bridge.errors.join("\n")
        );

    }


    check(
        "ALL REAL RUNTIME CONSTRAINTS MAP EXACTLY INTO GENERIC BOUNDARIES",
        bridge.errors.length ===
            0 &&
        bridge.observations.length ===
            17
    );


    if (bridge.errors.length > 0) {

        console.log("");
        console.log(`PASS: ${pass}`);
        console.log(`FAIL: ${fail}`);
        console.log("RESULT: FAIL");

        process.exitCode = 1;
        return;

    }


    check(
        "ALL BRIDGED GENERIC BOUNDARY OBSERVATIONS REMAIN PRESERVED",
        bridge.observations.every(
            observation =>
                observation.verdict ===
                "PRESERVED"
        )
    );


    const compatibility =
        new ScientificCompositionCandidateCompatibilityEngine()
            .evaluate({
                profiles,
                candidateSet,
                observations:
                    bridge.observations
            });


    noErrors(
        "generic compatibility",
        compatibility.errors
    );


    const assessment =
        compatibility.assessments.find(
            item =>
                item.candidateId ===
                genericCandidate.candidateId
        );


    if (assessment === undefined) {
        throw new Error(
            "Generic compatibility assessment missing."
        );
    }


    check(
        "GENERIC COMPATIBILITY HAS NO OBSERVED VIOLATION",
        assessment.scientificPolarity !==
            "CHALLENGE"
    );


    console.log("");
    console.log(
        "=== REAL GENERIC COVERAGE ==="
    );

    console.log(
        `ERC-8004 generic boundaries: ${erc8004.profile.boundaries.length}`
    );

    console.log(
        `ERC-8060 generic boundaries: ${erc8060.profile.boundaries.length}`
    );

    console.log(
        `generic boundaries total:    ${genericBoundaryCount}`
    );

    console.log(
        `runtime observations:        ${exported.constraintObservations.length}`
    );

    console.log(
        `bridged observations:        ${bridge.observations.length}`
    );

    console.log(
        `generic candidate polarity:  ${assessment.scientificPolarity}`
    );


    if (
        genericBoundaryCount ===
            bridge.observations.length
    ) {

        check(
            "FULL GENERIC BOUNDARY COVERAGE -> SUPPORT",
            assessment.scientificPolarity ===
                "SUPPORT"
        );

    }
    else {

        check(
            "PARTIAL GENERIC BOUNDARY COVERAGE DOES NOT FORCE SUPPORT",
            assessment.scientificPolarity ===
                "INCONCLUSIVE"
        );

    }


    console.log("");
    console.log(`PASS: ${pass}`);
    console.log(`FAIL: ${fail}`);
    console.log(
        `RESULT: ${fail === 0 ? "PASS" : "FAIL"}`
    );


    if (fail > 0) {
        process.exitCode = 1;
    }

}


main()
    .catch(
        error => {

            console.error(error);
            process.exitCode = 1;

        }
    );