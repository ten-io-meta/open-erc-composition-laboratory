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