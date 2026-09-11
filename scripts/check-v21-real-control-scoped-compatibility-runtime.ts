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
import {
    buildErc8004Erc8060ControlRegistration
} from "../laboratory/scientific-joint-contract-harness/controls/ScientificErc8004Erc8060ControlRegistration.js";

import {
    ScientificCandidateEvaluationSurfaceProjectionEngine
} from "../laboratory/scientific-candidate-boundary-relevance/ScientificCandidateEvaluationSurfaceProjectionEngine.js";

import {
    ScientificCandidateExecutionSurfaceExclusionEngine
} from "../laboratory/scientific-candidate-boundary-relevance/ScientificCandidateExecutionSurfaceExclusionEngine.js";

import {
    ScientificCandidateBoundaryRelevanceEvidenceEngine
} from "../laboratory/scientific-candidate-boundary-relevance/ScientificCandidateBoundaryRelevanceEvidenceEngine.js";

import {
    ScientificCandidateBoundaryRelevanceEngine
} from "../laboratory/scientific-candidate-boundary-relevance/ScientificCandidateBoundaryRelevanceEngine.js";

import {
    ScientificCandidateScopedCompatibilityEngine
} from "../laboratory/scientific-candidate-boundary-relevance/ScientificCandidateScopedCompatibilityEngine.js";
import {
    ScientificCandidateFunctionalConfigurationEvidenceEngine
} from "../laboratory/scientific-candidate-functional-configuration/ScientificCandidateFunctionalConfigurationEvidenceEngine.js";

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

    console.log("");
    console.log(
        "=== A2.7 REAL RELEVANCE-SCOPED COMPATIBILITY ==="
    );


    const allGenericBoundaries =
        profiles.flatMap(
            profile =>
                profile.boundaries
        );


    if (
        allGenericBoundaries.length !==
        37
    ) {

        throw new Error(
            `A2.7 expected 37 generic boundaries, got ${allGenericBoundaries.length}.`
        );

    }


    const runtimeRelevanceEvidence =
        new ScientificCandidateBoundaryRelevanceEvidenceEngine()
            .deriveFromRuntimeObservations(
                genericCandidate.candidateId,
                allGenericBoundaries,
                bridge.observations
            );


    noErrors(
        "A2.7 runtime relevance evidence",
        runtimeRelevanceEvidence.errors
    );


    check(
        "17 REAL RUNTIME BOUNDARIES -> 17 REACHABILITY EVIDENCE ITEMS",
        runtimeRelevanceEvidence.evidence.length ===
            17
    );


    const registration =
        buildErc8004Erc8060ControlRegistration();


    const projection =
        new ScientificCandidateEvaluationSurfaceProjectionEngine()
            .project(
                registration,
                {
                    candidateId:
                        genericCandidate.candidateId,

                    sourceParticipantId:
                        genericCandidate.sourceParticipantId,

                    targetParticipantId:
                        genericCandidate.targetParticipantId
                }
            );


    noErrors(
        "A2.7 evaluation surface projection",
        projection.errors
    );


    check(
        "REAL CONTROL PROJECTS TWO COMPLETE PARTICIPANT SURFACES",
        projection.surfaces.length ===
            2 &&
        projection.surfaces.every(
            surface =>
                surface.completeness ===
                "COMPLETE_FOR_CANDIDATE_EVALUATION"
        )
    );


    const sourceFactsByParticipant =
        new Map([
            [
                "ERC-8004",
                erc8004.github.sourceFacts
            ],
            [
                "ERC-8060",
                erc8060.github.sourceFacts
            ]
        ]);


    const profileByParticipant =
        new Map(
            profiles.map(
                profile => [
                    profile.protocolId,
                    profile
                ] as const
            )
        );


    const exclusionEngine =
        new ScientificCandidateExecutionSurfaceExclusionEngine();


    const exclusionEvidence =
        [];


    const excludedBoundaryIds =
        new Set<string>();


    const retainedBoundaryIds =
        new Set<string>();


    for (
        const surface
        of projection.surfaces
    ) {

        const profile =
            profileByParticipant.get(
                surface.participantId
            );


        const facts =
            sourceFactsByParticipant.get(
                surface.participantId
            );


        if (
            profile === undefined ||
            facts === undefined
        ) {

            throw new Error(
                `A2.7 missing real profile/source facts for ${surface.participantId}.`
            );

        }


        const bindings =
            profile.boundaries.map(
                boundary => {

                    const matchingFacts =
                        facts.filter(
                            fact =>
                                boundary.evidenceIds.includes(
                                    fact.factId
                                )
                        );


                    if (
                        matchingFacts.length !==
                        1
                    ) {

                        throw new Error(
                            `A2.7 boundary ${boundary.boundaryId} matched ${matchingFacts.length} source facts.`
                        );

                    }


                    const fact =
                        matchingFacts[0];


                    if (
                        !fact.containerSymbol
                    ) {

                        throw new Error(
                            `A2.7 boundary ${boundary.boundaryId} has no exact source container.`
                        );

                    }


                    return {

                        boundaryId:
                            boundary.boundaryId,

                        participantId:
                            profile.protocolId,

                        containerSymbol:
                            fact.containerSymbol

                    };

                }
            );


        const exclusion =
            exclusionEngine.derive(
                surface,
                bindings
            );


        noErrors(
            `A2.7 surface exclusion ${surface.participantId}`,
            exclusion.errors
        );


        for (
            const evidence
            of exclusion.evidence
        ) {

            exclusionEvidence.push(
                evidence
            );

        }


        for (
            const boundaryId
            of exclusion.excludedBoundaryIds
        ) {

            excludedBoundaryIds.add(
                boundaryId
            );

        }


        for (
            const boundaryId
            of exclusion.retainedBoundaryIds
        ) {

            retainedBoundaryIds.add(
                boundaryId
            );

        }

    }


    check(
        "REAL SURFACE PRODUCES EXACTLY 20 EXCLUSION EVIDENCE ITEMS",
        exclusionEvidence.length ===
            20 &&
        excludedBoundaryIds.size ===
            20
    );


    check(
        "REAL SURFACE RETAINS EXACTLY 17 CANDIDATE BOUNDARIES",
        retainedBoundaryIds.size ===
            17
    );


    const runtimeBoundaryIds =
        new Set(
            runtimeRelevanceEvidence
                .evidence
                .map(
                    evidence =>
                        evidence.boundaryId
                )
        );


    check(
        "RUNTIME REACHABILITY EXACTLY MATCHES THE 17 RETAINED BOUNDARIES",
        runtimeBoundaryIds.size ===
            17 &&
        [...runtimeBoundaryIds].every(
            boundaryId =>
                retainedBoundaryIds.has(
                    boundaryId
                )
        ) &&
        [...retainedBoundaryIds].every(
            boundaryId =>
                runtimeBoundaryIds.has(
                    boundaryId
                )
        )
    );


    check(
        "NO RUNTIME BOUNDARY IS CLASSIFIED FOR EXCLUSION",
        [...runtimeBoundaryIds].every(
            boundaryId =>
                !excludedBoundaryIds.has(
                    boundaryId
                )
        )
    );


    const combinedRelevanceEvidence = [
        ...runtimeRelevanceEvidence.evidence,
        ...exclusionEvidence
    ];


    const evidenceBoundaryIds =
        new Set(
            combinedRelevanceEvidence.map(
                evidence =>
                    evidence.boundaryId
            )
        );


    check(
        "37 OF 37 GENERIC BOUNDARIES HAVE RELEVANCE EVIDENCE",
        combinedRelevanceEvidence.length ===
            37 &&
        evidenceBoundaryIds.size ===
            37
    );


    const relevance =
        new ScientificCandidateBoundaryRelevanceEngine()
            .evaluate({

                candidateId:
                    genericCandidate.candidateId,

                participantIds: [
                    genericCandidate.sourceParticipantId,
                    genericCandidate.targetParticipantId
                ],

                boundaries:
                    allGenericBoundaries,

                evidence:
                    combinedRelevanceEvidence

            });


    noErrors(
        "A2.7 candidate boundary relevance",
        relevance.errors
    );


    check(
        "REAL CONTROL RELEVANCE = 17 RELEVANT / 20 OUT_OF_SCOPE / 0 UNRESOLVED",
        relevance.statistics.total ===
            37 &&
        relevance.statistics.relevant ===
            17 &&
        relevance.statistics.outOfScope ===
            20 &&
        relevance.statistics.unresolved ===
            0
    );


    check(
        "ALL RUNTIME BOUNDARIES ARE RELEVANT",
        relevance.assessments
            .filter(
                assessment =>
                    runtimeBoundaryIds.has(
                        assessment.boundaryId
                    )
            )
            .every(
                assessment =>
                    assessment.relevance ===
                    "RELEVANT"
            )
    );


    check(
        "ALL EXCLUDED SURFACE BOUNDARIES ARE OUT_OF_SCOPE",
        relevance.assessments
            .filter(
                assessment =>
                    excludedBoundaryIds.has(
                        assessment.boundaryId
                    )
            )
            .every(
                assessment =>
                    assessment.relevance ===
                    "OUT_OF_SCOPE"
            )
    );


    const scopedCompatibility =
        new ScientificCandidateScopedCompatibilityEngine()
            .evaluate({

                profiles,

                candidateSet,

                observations:
                    bridge.observations,

                relevanceAssessments:
                    relevance.assessments

            });


    noErrors(
        "A2.7 scoped compatibility",
        scopedCompatibility.errors
    );


    const scopedAssessment =
        scopedCompatibility
            .assessments
            .find(
                item =>
                    item.candidateId ===
                    genericCandidate.candidateId
            );


    if (
        scopedAssessment ===
        undefined
    ) {

        throw new Error(
            "A2.7 scoped compatibility assessment missing."
        );

    }

    const runtimeExport =
        exported as typeof exported & {
            driverReport?: {
                chainId:
                    string | number;
                sharedRuntime:
                    boolean;
                participantA: {
                    executed:
                        boolean;
                    contractAddresses:
                        string[];
                };
                participantB: {
                    executed:
                        boolean;
                    contractAddresses:
                        string[];
                };
                crossProtocolInteractionObservations?: Array<{
                    observationId:
                        string;
                    candidateId:
                        string;
                    sourceSide:
                        "A" | "B";
                    targetSide:
                        "A" | "B";
                    callKind:
                        "CALL" | "STATICCALL" | "DELEGATECALL";
                    sourceAddress:
                        string;
                    targetAddress:
                        string;
                    status:
                        "OBSERVED";
                    evidence:
                        string[];
                }>;
            } | null;
        };


    const driverReport =
        runtimeExport.driverReport;


    if (!driverReport) {
        throw new Error(
            "A2.9b real driver report missing."
        );
    }


    const runtimeInteractions =
        driverReport
            .crossProtocolInteractionObservations ??
        [];


    check(
        "REAL DRIVER REPORT HAS SHARED RUNTIME",
        driverReport.sharedRuntime === true
    );


    check(
        "BOTH REAL PARTICIPANTS EXECUTED WITH ADDRESSES",
        driverReport.participantA.executed === true &&
        driverReport.participantB.executed === true &&
        driverReport.participantA.contractAddresses.length > 0 &&
        driverReport.participantB.contractAddresses.length > 0
    );


    check(
        "REAL DRIVER REPORT HAS TWO OBSERVED CROSS-PROTOCOL INTERACTIONS",
        runtimeInteractions.length === 2 &&
        runtimeInteractions.every(
            interaction =>
                interaction.status === "OBSERVED"
        )
    );

    const sideParticipant = {
        A: registration.applicability.participantA.participantId,
        B: registration.applicability.participantB.participantId
    } as const;


    const functionalConfiguration =
        new ScientificCandidateFunctionalConfigurationEvidenceEngine()
            .evaluate({
                candidateId: genericCandidate.candidateId,

                participantIds: [
                    genericCandidate.sourceParticipantId,
                    genericCandidate.targetParticipantId
                ],

                runtimeBinding: {
                    genericCandidateId: genericCandidate.candidateId,
                    runtimeCandidateId:
                        exported.requirement.candidate.candidateId,
                    evidenceIds: [...genericCandidate.evidenceIds]
                },

                chainId: driverReport.chainId,
                sharedRuntime: driverReport.sharedRuntime,

                participants: [
                    {
                        participantId: sideParticipant.A,
                        executed: driverReport.participantA.executed,
                        contractAddresses:
                            [...driverReport.participantA.contractAddresses]
                    },
                    {
                        participantId: sideParticipant.B,
                        executed: driverReport.participantB.executed,
                        contractAddresses:
                            [...driverReport.participantB.contractAddresses]
                    }
                ],

                interactions: runtimeInteractions.map(
                    interaction => ({
                        observationId: interaction.observationId,
                        runtimeCandidateId: interaction.candidateId,
                        sourceParticipantId:
                            sideParticipant[interaction.sourceSide],
                        targetParticipantId:
                            sideParticipant[interaction.targetSide],
                        callKind: interaction.callKind,
                        sourceAddress: interaction.sourceAddress,
                        targetAddress: interaction.targetAddress,
                        evidenceIds: [...interaction.evidence]
                    })
                ),

                compatibility: {
                    candidateId: genericCandidate.candidateId,
                    scientificPolarity:
                        scopedAssessment.compatibility.scientificPolarity,
                    total: scopedAssessment.compatibility.statistics.total,
                    preserved:
                        scopedAssessment.compatibility.statistics.preserved,
                    violated:
                        scopedAssessment.compatibility.statistics.violated,
                    unevaluated:
                        scopedAssessment.compatibility.statistics.unevaluated,
                    unresolvedRelevance:
                        scopedAssessment.relevanceStatistics.unresolved
                }
            });


    noErrors(
        "A2.9b functional configuration",
        functionalConfiguration.errors
    );

    check(
        "REAL FUNCTIONAL CONFIGURATION IS EVIDENCED",
        functionalConfiguration.evidence?.status === "EVIDENCED"
    );


    check(
        "REAL FUNCTIONAL CONFIGURATION PRESERVES TWO INTERACTIONS",
        functionalConfiguration
            .evidence
            ?.interactionObservationIds
            .length === 2
    );


    check(
        "REAL FUNCTIONAL CONFIGURATION PRESERVES SHARED RUNTIME",
        functionalConfiguration.evidence?.sharedRuntime === true
    );


    console.log("");
    console.log(
        `functional configuration: ${functionalConfiguration.evidence?.status ?? "MISSING"}`
    );
    console.log(
        `runtime interactions:     ${functionalConfiguration.evidence?.interactionObservationIds.length ?? 0}`
    );
    console.log(
        `shared runtime:           ${functionalConfiguration.evidence?.sharedRuntime ?? false}`
    );


    console.log("");
    console.log(
        `protocol boundaries:      ${scopedAssessment.relevanceStatistics.protocolBoundaryTotal}`
    );

    console.log(
        `relevant boundaries:      ${scopedAssessment.relevanceStatistics.relevant}`
    );

    console.log(
        `out-of-scope boundaries:  ${scopedAssessment.relevanceStatistics.outOfScope}`
    );

    console.log(
        `unresolved boundaries:    ${scopedAssessment.relevanceStatistics.unresolved}`
    );

    console.log(
        `evaluated boundaries:     ${scopedAssessment.compatibility.statistics.total}`
    );

    console.log(
        `preserved boundaries:     ${scopedAssessment.compatibility.statistics.preserved}`
    );

    console.log(
        `violated boundaries:      ${scopedAssessment.compatibility.statistics.violated}`
    );

    console.log(
        `unevaluated boundaries:   ${scopedAssessment.compatibility.statistics.unevaluated}`
    );

    console.log(
        `scoped polarity:          ${scopedAssessment.compatibility.scientificPolarity}`
    );


    check(
        "SCOPED COMPATIBILITY EVALUATES EXACTLY 17 RELEVANT BOUNDARIES",
        scopedAssessment
            .compatibility
            .statistics
            .total ===
            17
    );


    check(
        "ALL 17 RELEVANT REAL BOUNDARIES ARE PRESERVED",
        scopedAssessment
            .compatibility
            .statistics
            .preserved ===
            17 &&
        scopedAssessment
            .compatibility
            .statistics
            .violated ===
            0 &&
        scopedAssessment
            .compatibility
            .statistics
            .unevaluated ===
            0
    );


    check(
        "REAL STRUCTURAL CANDIDATE REACHES CANDIDATE-LEVEL SUPPORT",
        scopedAssessment
            .compatibility
            .scientificPolarity ===
            "SUPPORT"
    );


    check(
        "STRUCTURAL CANDIDATE KIND IS PRESERVED",
        scopedAssessment
            .compatibility
            .candidateKind ===
            "STRUCTURAL_FOUNDATION"
    );


    const scopedSerialized =
        JSON.stringify(
            scopedAssessment
        );


    check(
        "CANDIDATE-LEVEL SUPPORT DOES NOT CLAIM FUNCTIONAL OR GLOBAL COMPOSITION",
        !scopedSerialized.includes(
            "FUNCTIONAL_CONFIGURATION"
        ) &&
        !scopedSerialized.includes(
            "GLOBAL_COMPOSITION"
        )
    );


    console.log("");
    console.log(
        "A2.7 SCIENTIFIC INTERPRETATION:"
    );

    console.log(
        "SUPPORT means all candidate-relevant boundaries observed in this exact evaluation were preserved."
    );

    console.log(
        "It does not promote STRUCTURAL_FOUNDATION into the functional solver."
    );

    console.log(
        "It does not establish global protocol composition."
    );
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