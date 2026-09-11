import {
    execFile
} from "node:child_process";

import {
    promisify
} from "node:util";

import {
    join
} from "node:path";

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
    buildErc8004Erc8060ControlRegistration
} from "../laboratory/scientific-joint-contract-harness/controls/ScientificErc8004Erc8060ControlRegistration.js";

import {
    ScientificCandidateEvaluationSurfaceProjectionEngine
} from "../laboratory/scientific-candidate-boundary-relevance/ScientificCandidateEvaluationSurfaceProjectionEngine.js";

import {
    ScientificCandidateExecutionSurfaceExclusionEngine
} from "../laboratory/scientific-candidate-boundary-relevance/ScientificCandidateExecutionSurfaceExclusionEngine.js";

import type {
    ScientificCompositionExecutionRequirement
} from "../laboratory/scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";


const execFileAsync =
    promisify(execFile);


function normalize(
    value: string
): string {

    return value
        .replace(/\s+/g, " ")
        .trim();

}


function requireNoErrors(
    stage: string,
    errors: string[]
): void {

    if (errors.length > 0) {
        throw new Error(
            `${stage}\n${errors.join("\n")}`
        );
    }

}


async function loadRequirement():
    Promise<ScientificCompositionExecutionRequirement> {

    const runnerPath =
        join(
            process.cwd(),
            "scripts",
            "run-real-scientific-cross-protocol.ts"
        );


    const invocation =
        process.platform === "win32"
            ? {
                command:
                    process.env.ComSpec ??
                    "cmd.exe",

                args: [
                    "/d",
                    "/c",
                    "npx.cmd",
                    "tsx",
                    runnerPath
                ]
            }
            : {
                command:
                    "npx",

                args: [
                    "tsx",
                    runnerPath
                ]
            };


    const { stdout, stderr } =
        await execFileAsync(
            invocation.command,
            invocation.args,
            {
                cwd:
                    process.cwd(),

                env: {
                    ...process.env,

                    OECL_EMIT_COMPOSITION_EXECUTION_REQUIREMENTS:
                        "1"
                },

                encoding:
                    "utf8",

                maxBuffer:
                    64 * 1024 * 1024
            }
        );


    const prefix =
        "OECL_COMPOSITION_EXECUTION_REQUIREMENTS=";


    const records =
        stdout
            .split(/\r?\n/)
            .filter(
                line =>
                    line.startsWith(prefix)
            );


    if (records.length !== 1) {

        throw new Error(
            [
                `Expected one requirement export, observed ${records.length}.`,
                stderr.slice(-3000)
            ].join("\n")
        );

    }


    const requirements =
        JSON.parse(
            records[0].slice(
                prefix.length
            )
        ) as ScientificCompositionExecutionRequirement[];


    const matches =
        requirements.filter(
            requirement =>
                requirement.candidate.participantA.id ===
                    "ERC-8004" &&
                requirement.candidate.participantB.id ===
                    "ERC-8060" &&
                requirement.candidate.mechanism ===
                    "SHARED_PROTOCOL_FOUNDATION" &&
                requirement.candidate.foundationProtocolId ===
                    "ERC-721"
        );


    if (matches.length !== 1) {
        throw new Error(
            `Expected exact 8004 x 8060 requirement, observed ${matches.length}.`
        );
    }


    return matches[0];

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


    requireNoErrors(
        `${protocolId} GitHub`,
        github.errors
    );


    const revision =
        github.repository.commitSha;


    if (revision !== expectedRevision) {
        throw new Error(
            `${protocolId} revision mismatch.`
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


    requireNoErrors(
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


    requireNoErrors(
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


    requireNoErrors(
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


    requireNoErrors(
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


    requireNoErrors(
        `${protocolId} profile`,
        profileResult.errors
    );


    if (profileResult.profile === null) {
        throw new Error(
            `${protocolId} profile missing.`
        );
    }


    return {
        profile:
            profileResult.profile,

        facts:
            github.sourceFacts
    };

}


async function main(): Promise<void> {

    console.log("");
    console.log(
        "V2.1 REAL CONTROL BOUNDARY COVERAGE AUDIT"
    );
    console.log(
        "========================================="
    );


    const requirement =
        await loadRequirement();


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


    const sources = [
        erc8004,
        erc8060
    ];


    const coveredBoundaryIds =
        new Set<string>();


    let exactConstraintMatches =
        0;


    for (const constraint of requirement.constraints) {

        const source =
            sources.find(
                item =>
                    item.profile.protocolId ===
                    constraint.participantId
            );


        if (source === undefined) {
            throw new Error(
                `No profile for ${constraint.participantId}.`
            );
        }


        const matches =
            source.profile.boundaries.filter(
                boundary =>
                    boundary.kind ===
                        "SOURCE_CONSTRAINT" &&
                    boundary.evidenceIds.includes(
                        constraint.factId
                    ) &&
                    normalize(boundary.subject) ===
                        normalize(constraint.rawText)
            );


        if (matches.length !== 1) {

            throw new Error(
                `Constraint ${constraint.constraintId} matched ${matches.length} boundaries.`
            );

        }


        coveredBoundaryIds.add(
            matches[0].boundaryId
        );

        exactConstraintMatches++;

    }


    const allBoundaries =
        sources.flatMap(
            source =>
                source.profile.boundaries.map(
                    boundary => ({
                        protocolId:
                            source.profile.protocolId,

                        boundary,

                        facts:
                            source.facts
                    })
                )
        );


    const uncovered =
        allBoundaries.filter(
            item =>
                !coveredBoundaryIds.has(
                    item.boundary.boundaryId
                )
        );


    console.log("");
    console.log(
        "=== COVERAGE SUMMARY ==="
    );

    console.log(
        `execution constraints:       ${requirement.constraints.length}`
    );

    console.log(
        `exact boundary matches:      ${exactConstraintMatches}`
    );

    console.log(
        `generic boundaries total:    ${allBoundaries.length}`
    );

    console.log(
        `covered generic boundaries:  ${coveredBoundaryIds.size}`
    );

    console.log(
        `uncovered boundaries:        ${uncovered.length}`
    );


    console.log("");
    console.log(
        "=== UNCOVERED BOUNDARIES ==="
    );


    for (const item of uncovered) {

        const fact =
            item.facts.find(
                candidateFact =>
                    item.boundary.evidenceIds.includes(
                        candidateFact.factId
                    )
            );


        console.log("");
        console.log(
            `[${item.protocolId}]`
        );

        console.log(
            `boundaryId: ${item.boundary.boundaryId}`
        );

        console.log(
            `subject:    ${item.boundary.subject}`
        );

        console.log(
            `container:  ${fact?.containerKind ?? "UNKNOWN"}:${fact?.containerSymbol ?? "UNKNOWN"}`
        );

        console.log(
            `file:       ${fact?.locator.filePath ?? "UNKNOWN"}`
        );

        console.log(
            `line:       ${fact?.locator.startLine ?? "UNKNOWN"}`
        );

        console.log(
            `factId:     ${fact?.factId ?? "UNKNOWN"}`
        );

    }


    const uncovered8004 =
        uncovered.filter(
            item =>
                item.protocolId ===
                "ERC-8004"
        ).length;


    const uncovered8060 =
        uncovered.filter(
            item =>
                item.protocolId ===
                "ERC-8060"
        ).length;


    console.log("");
    console.log(
        "=== UNCOVERED BY PROTOCOL ==="
    );

    console.log(
        `ERC-8004: ${uncovered8004}`
    );

    console.log(
        `ERC-8060: ${uncovered8060}`
    );


    if (
        requirement.constraints.length !== 17 ||
        exactConstraintMatches !== 17 ||
        allBoundaries.length !== 37 ||
        coveredBoundaryIds.size !== 17 ||
        uncovered.length !== 20
    ) {

        throw new Error(
            "A2.4 observed unexpected real-control coverage counts."
        );

    }


    console.log("");
    console.log(
        "=== A2.6d2 REAL EVALUATION SURFACE EXCLUSION ==="
    );


    const registration =
        buildErc8004Erc8060ControlRegistration();


    const projection =
        new ScientificCandidateEvaluationSurfaceProjectionEngine()
            .project(
                registration,
                {
                    candidateId:
                        "V21-REAL-CONTROL-EVALUATION-SURFACE",

                    sourceParticipantId:
                        "ERC-8004",

                    targetParticipantId:
                        "ERC-8060"
                }
            );


    requireNoErrors(
        "A2.6d2 surface projection",
        projection.errors
    );


    if (
        projection.surfaces.length !==
        2
    ) {

        throw new Error(
            `Expected 2 projected participant surfaces, got ${projection.surfaces.length}.`
        );

    }


    const exclusionEngine =
        new ScientificCandidateExecutionSurfaceExclusionEngine();


    const exclusions =
        projection.surfaces.map(
            surface => {

                const participantBoundaries =
                    allBoundaries.filter(
                        item =>
                            item.protocolId ===
                            surface.participantId
                    );


                const bindings =
                    participantBoundaries.map(
                        item => {

                            const matchingFacts =
                                item.facts.filter(
                                    fact =>
                                        item.boundary.evidenceIds.includes(
                                            fact.factId
                                        )
                                );


                            if (
                                matchingFacts.length !==
                                1
                            ) {

                                throw new Error(
                                    `Boundary ${item.boundary.boundaryId} matched ${matchingFacts.length} source facts.`
                                );

                            }


                            const fact =
                                matchingFacts[0];


                            if (
                                !fact.containerSymbol
                            ) {

                                throw new Error(
                                    `Boundary ${item.boundary.boundaryId} has no exact source container symbol.`
                                );

                            }


                            return {

                                boundaryId:
                                    item.boundary.boundaryId,

                                participantId:
                                    item.protocolId,

                                containerSymbol:
                                    fact.containerSymbol

                            };

                        }
                    );


                const result =
                    exclusionEngine.derive(
                        surface,
                        bindings
                    );


                requireNoErrors(
                    `A2.6d2 exclusion ${surface.participantId}`,
                    result.errors
                );


                return {

                    participantId:
                        surface.participantId,

                    surface,

                    result,

                    participantBoundaries

                };

            }
        );


    const erc8004Exclusion =
        exclusions.find(
            item =>
                item.participantId ===
                "ERC-8004"
        );


    const erc8060Exclusion =
        exclusions.find(
            item =>
                item.participantId ===
                "ERC-8060"
        );


    if (
        erc8004Exclusion ===
            undefined ||
        erc8060Exclusion ===
            undefined
    ) {

        throw new Error(
            "A2.6d2 did not resolve both real-control participants."
        );

    }


    function containerForBoundary(
        participant:
            typeof erc8004Exclusion,
        boundaryId:
            string
    ): string {

        const item =
            participant
                .participantBoundaries
                .find(
                    candidate =>
                        candidate.boundary.boundaryId ===
                        boundaryId
                );


        if (item === undefined) {

            throw new Error(
                `Unknown boundary ${boundaryId}.`
            );

        }


        const matchingFacts =
            item.facts.filter(
                fact =>
                    item.boundary.evidenceIds.includes(
                        fact.factId
                    )
            );


        if (
            matchingFacts.length !==
            1 ||
            !matchingFacts[0].containerSymbol
        ) {

            throw new Error(
                `Boundary ${boundaryId} has no unique source container.`
            );

        }


        return matchingFacts[0].containerSymbol;

    }


    const excluded8004Containers =
        erc8004Exclusion
            .result
            .excludedBoundaryIds
            .map(
                boundaryId =>
                    containerForBoundary(
                        erc8004Exclusion,
                        boundaryId
                    )
            );


    const retained8004Containers =
        erc8004Exclusion
            .result
            .retainedBoundaryIds
            .map(
                boundaryId =>
                    containerForBoundary(
                        erc8004Exclusion,
                        boundaryId
                    )
            );


    const excluded8060Containers =
        erc8060Exclusion
            .result
            .excludedBoundaryIds
            .map(
                boundaryId =>
                    containerForBoundary(
                        erc8060Exclusion,
                        boundaryId
                    )
            );


    const retained8060Containers =
        erc8060Exclusion
            .result
            .retainedBoundaryIds
            .map(
                boundaryId =>
                    containerForBoundary(
                        erc8060Exclusion,
                        boundaryId
                    )
            );


    const reputationExcluded =
        excluded8004Containers.filter(
            container =>
                container ===
                "ReputationRegistryUpgradeable"
        ).length;


    const validationExcluded =
        excluded8004Containers.filter(
            container =>
                container ===
                "ValidationRegistryUpgradeable"
        ).length;


    const identityRetained =
        retained8004Containers.filter(
            container =>
                container ===
                "IdentityRegistryUpgradeable"
        ).length;


    const otherExcluded8004Containers =
        [
            ...new Set(
                excluded8004Containers.filter(
                    container =>
                        container !==
                            "ReputationRegistryUpgradeable" &&
                        container !==
                            "ValidationRegistryUpgradeable"
                )
            )
        ];


    const otherRetained8004Containers =
        [
            ...new Set(
                retained8004Containers.filter(
                    container =>
                        container !==
                        "IdentityRegistryUpgradeable"
                )
            )
        ];


    const otherRetained8060Containers =
        [
            ...new Set(
                retained8060Containers.filter(
                    container =>
                        container !==
                        "ERC8060Reference"
                )
            )
        ];


    console.log(
        `generic boundaries total: ${allBoundaries.length}`
    );

    console.log(
        `ERC-8004 boundaries total: ${
            erc8004Exclusion.participantBoundaries.length
        }`
    );

    console.log(
        `ERC-8004 retained: ${
            erc8004Exclusion.result.retainedBoundaryIds.length
        }`
    );

    console.log(
        `ERC-8004 excluded: ${
            erc8004Exclusion.result.excludedBoundaryIds.length
        }`
    );

    console.log(
        `  IdentityRegistryUpgradeable retained: ${identityRetained}`
    );

    console.log(
        `  ReputationRegistryUpgradeable excluded: ${reputationExcluded}`
    );

    console.log(
        `  ValidationRegistryUpgradeable excluded: ${validationExcluded}`
    );

    console.log(
        `ERC-8060 boundaries total: ${
            erc8060Exclusion.participantBoundaries.length
        }`
    );

    console.log(
        `ERC-8060 retained: ${
            erc8060Exclusion.result.retainedBoundaryIds.length
        }`
    );

    console.log(
        `ERC-8060 excluded: ${
            erc8060Exclusion.result.excludedBoundaryIds.length
        }`
    );


    if (
        allBoundaries.length !==
            37
    ) {

        throw new Error(
            "A2.6d2 expected exactly 37 real generic boundaries."
        );

    }


    if (
        erc8004Exclusion
            .participantBoundaries
            .length !==
            30
    ) {

        throw new Error(
            "A2.6d2 expected exactly 30 ERC-8004 boundaries."
        );

    }


    if (
        erc8060Exclusion
            .participantBoundaries
            .length !==
            7
    ) {

        throw new Error(
            "A2.6d2 expected exactly 7 ERC-8060 boundaries."
        );

    }


    if (
        erc8004Exclusion
            .result
            .retainedBoundaryIds
            .length !==
            10
    ) {

        throw new Error(
            "A2.6d2 expected exactly 10 retained ERC-8004 boundaries."
        );

    }


    if (
        erc8004Exclusion
            .result
            .excludedBoundaryIds
            .length !==
            20
    ) {

        throw new Error(
            "A2.6d2 expected exactly 20 excluded ERC-8004 boundaries."
        );

    }


    if (
        identityRetained !==
            10 ||
        reputationExcluded !==
            12 ||
        validationExcluded !==
            8
    ) {

        throw new Error(
            "A2.6d2 real ERC-8004 container distribution is not the expected 10/12/8."
        );

    }


    if (
        otherExcluded8004Containers.length >
            0
    ) {

        throw new Error(
            `A2.6d2 found unexpected excluded ERC-8004 containers: ${otherExcluded8004Containers.join(", ")}`
        );

    }


    if (
        otherRetained8004Containers.length >
            0
    ) {

        throw new Error(
            `A2.6d2 found unexpected retained ERC-8004 containers: ${otherRetained8004Containers.join(", ")}`
        );

    }


    if (
        erc8060Exclusion
            .result
            .excludedBoundaryIds
            .length !==
            0 ||
        erc8060Exclusion
            .result
            .retainedBoundaryIds
            .length !==
            7
    ) {

        throw new Error(
            "A2.6d2 expected all 7 ERC-8060 boundaries to remain inside the declared surface."
        );

    }


    if (
        excluded8060Containers.length !==
            0 ||
        otherRetained8060Containers.length >
            0
    ) {

        throw new Error(
            "A2.6d2 observed an unexpected ERC-8060 container distribution."
        );

    }


    const exclusionSerialized =
        JSON.stringify({
            projection,
            exclusions: exclusions.map(
                item => ({
                    participantId:
                        item.participantId,
                    result:
                        item.result
                })
            )
        });


    if (
        exclusionSerialized.includes(
            '"SUPPORT"'
        ) ||
        exclusionSerialized.includes(
            '"CHALLENGE"'
        ) ||
        exclusionSerialized.includes(
            '"INCONCLUSIVE"'
        ) ||
        exclusionSerialized.includes(
            '"PRESERVED"'
        ) ||
        exclusionSerialized.includes(
            '"VIOLATED"'
        )
    ) {

        throw new Error(
            "A2.6d2 exclusion projection invented scientific polarity."
        );

    }


    console.log("");
    console.log(
        "A2.6d2 REAL SURFACE EXCLUSION: PASS"
    );

    console.log(
        "No composition polarity was manufactured."
    );


    console.log("");
    console.log(
        "RESULT: PASS"
    );

    console.log(
        "No relevance decision was manufactured."
    );

}


main()
    .catch(
        error => {

            console.error(error);
            process.exitCode = 1;

        }
    );