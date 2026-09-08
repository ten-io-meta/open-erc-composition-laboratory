import type {
    ScientificSourceObservation
} from "../scientific-source-observation/ScientificSourceObservation.js";

import type {
    ScientificSourceFact
} from "../scientific-source-fact/ScientificSourceFact.js";

import type {
    ScientificProtocolRelationEvidence
} from "../scientific-protocol-relation-evidence/ScientificProtocolRelationEvidence.js";

import type {
    ScientificEvidenceLineageDerivedLink,
    ScientificEvidenceLineageResolution,
    ScientificEvidenceLineageResult,
    ScientificEvidenceLineageTerminalEvidence
} from "./ScientificEvidenceLineage.js";


export interface ScientificEvidenceLineageEngineInput {

    observations:
        ScientificSourceObservation[];

    facts:
        ScientificSourceFact[];

    protocolRelationEvidence:
        ScientificProtocolRelationEvidence[];

    derivedLinks:
        ScientificEvidenceLineageDerivedLink[];

    requestedEvidenceIds:
        string[];

}


function unique(
    values:
        string[]
): string[] {

    return [
        ...new Set(
            values
        )
    ].sort();

}


function sameRevision(
    a:
        string | undefined,
    b:
        string | undefined
): boolean {

    return (
        a ??
        ""
    ) ===
        (
            b ??
            ""
        );

}


export class ScientificEvidenceLineageEngine {

    resolve(
        input:
            ScientificEvidenceLineageEngineInput
    ): ScientificEvidenceLineageResult {

        const errors:
            string[] =
            [];

        const terminals =
            new Map<
                string,
                ScientificEvidenceLineageTerminalEvidence
            >();

        const observations =
            new Map<
                string,
                ScientificSourceObservation
            >();


        for (
            const observation
            of input.observations
        ) {

            if (
                observations.has(
                    observation.observationId
                )
            ) {

                errors.push(
                    `Duplicate source observation ${observation.observationId}.`
                );

                continue;

            }


            observations.set(
                observation.observationId,
                observation
            );


            this.addTerminal(
                terminals,
                {
                    evidenceId:
                        observation.observationId,

                    kind:
                        "SOURCE_OBSERVATION",

                    sourceId:
                        observation.sourceId,

                    sourceType:
                        observation.sourceType,

                    ...(
                        observation.sourceRevision !==
                        undefined
                            ? {
                                sourceRevision:
                                    observation.sourceRevision
                            }
                            : {}
                    ),

                    sourceLocation:
                        observation.locator.sourceLocation,

                    ...(
                        observation.locator.filePath !==
                        undefined
                            ? {
                                filePath:
                                    observation.locator.filePath
                            }
                            : {}
                    ),

                    ...(
                        observation.locator.startLine !==
                        undefined
                            ? {
                                startLine:
                                    observation.locator.startLine
                            }
                            : {}
                    ),

                    ...(
                        observation.locator.endLine !==
                        undefined
                            ? {
                                endLine:
                                    observation.locator.endLine
                            }
                            : {}
                    ),

                    rawText:
                        observation.rawText
                },
                errors
            );

        }


        for (
            const fact
            of input.facts
        ) {

            const observation =
                observations.get(
                    fact.observationId
                );


            if (
                observation ===
                undefined
            ) {

                errors.push(
                    `Source fact ${fact.factId} references unknown observation ${fact.observationId}.`
                );

                continue;

            }


            if (
                fact.sourceId !==
                    observation.sourceId ||
                !sameRevision(
                    fact.sourceRevision,
                    observation.sourceRevision
                )
            ) {

                errors.push(
                    `Source fact ${fact.factId} disagrees with observation provenance ${fact.observationId}.`
                );

                continue;

            }


            this.addTerminal(
                terminals,
                {
                    evidenceId:
                        fact.factId,

                    kind:
                        "SOURCE_FACT",

                    sourceId:
                        fact.sourceId,

                    sourceType:
                        observation.sourceType,

                    ...(
                        fact.sourceRevision !==
                        undefined
                            ? {
                                sourceRevision:
                                    fact.sourceRevision
                            }
                            : {}
                    ),

                    sourceLocation:
                        fact.locator.sourceLocation,

                    ...(
                        fact.locator.filePath !==
                        undefined
                            ? {
                                filePath:
                                    fact.locator.filePath
                            }
                            : {}
                    ),

                    ...(
                        fact.locator.startLine !==
                        undefined
                            ? {
                                startLine:
                                    fact.locator.startLine
                            }
                            : {}
                    ),

                    ...(
                        fact.locator.endLine !==
                        undefined
                            ? {
                                endLine:
                                    fact.locator.endLine
                            }
                            : {}
                    ),

                    rawText:
                        fact.rawText
                },
                errors
            );

        }


        for (
            const relation
            of input.protocolRelationEvidence
        ) {

            const observation =
                observations.get(
                    relation.observationId
                );


            if (
                observation ===
                undefined
            ) {

                errors.push(
                    `Documentary relation ${relation.relationEvidenceId} references unknown observation ${relation.observationId}.`
                );

                continue;

            }


            if (
                relation.sourceId !==
                    observation.sourceId ||
                !sameRevision(
                    relation.sourceRevision,
                    observation.sourceRevision
                )
            ) {

                errors.push(
                    `Documentary relation ${relation.relationEvidenceId} disagrees with observation provenance ${relation.observationId}.`
                );

                continue;

            }


            this.addTerminal(
                terminals,
                {
                    evidenceId:
                        relation.relationEvidenceId,

                    kind:
                        "DOCUMENTARY_RELATION",

                    sourceId:
                        relation.sourceId,

                    sourceType:
                        observation.sourceType,

                    ...(
                        relation.sourceRevision !==
                        undefined
                            ? {
                                sourceRevision:
                                    relation.sourceRevision
                            }
                            : {}
                    ),

                    sourceLocation:
                        relation.locator.sourceLocation,

                    ...(
                        relation.locator.filePath !==
                        undefined
                            ? {
                                filePath:
                                    relation.locator.filePath
                            }
                            : {}
                    ),

                    ...(
                        relation.locator.startLine !==
                        undefined
                            ? {
                                startLine:
                                    relation.locator.startLine
                            }
                            : {}
                    ),

                    ...(
                        relation.locator.endLine !==
                        undefined
                            ? {
                                endLine:
                                    relation.locator.endLine
                            }
                            : {}
                    ),

                    rawText:
                        relation.rawText
                },
                errors
            );

        }


        const links =
            new Map<
                string,
                ScientificEvidenceLineageDerivedLink
            >();


        for (
            const inputLink
            of input.derivedLinks
        ) {

            const link:
                ScientificEvidenceLineageDerivedLink = {

                    ...inputLink,

                    parentEvidenceIds:
                        unique(
                            inputLink.parentEvidenceIds
                        )

                };


            if (
                terminals.has(
                    link.evidenceId
                ) ||
                links.has(
                    link.evidenceId
                )
            ) {

                errors.push(
                    `Evidence identity collision ${link.evidenceId}.`
                );

                continue;

            }


            if (
                link.parentEvidenceIds.length ===
                0
            ) {

                errors.push(
                    `Derived evidence ${link.evidenceId} has no structured parent evidence.`
                );

                continue;

            }


            links.set(
                link.evidenceId,
                link
            );

        }


        if (
            errors.length >
            0
        ) {

            return this.failed(
                errors
            );

        }


        const memo =
            new Map<
                string,
                ScientificEvidenceLineageResolution
            >();

        const reachedTerminals =
            new Set<string>();


        const resolveOne = (
            evidenceId:
                string,
            stack:
                string[]
        ): ScientificEvidenceLineageResolution => {

            const cached =
                memo.get(
                    evidenceId
                );


            if (
                cached !==
                undefined
            ) {

                return cached;

            }


            const terminal =
                terminals.get(
                    evidenceId
                );


            if (
                terminal !==
                undefined
            ) {

                reachedTerminals.add(
                    evidenceId
                );


                const resolution:
                    ScientificEvidenceLineageResolution = {

                        evidenceId,

                        status:
                            "RESOLVED",

                        terminalEvidenceIds: [
                            evidenceId
                        ],

                        unresolvedLeafIds:
                            []

                    };


                memo.set(
                    evidenceId,
                    resolution
                );


                return resolution;

            }


            if (
                stack.includes(
                    evidenceId
                )
            ) {

                errors.push(
                    `Evidence lineage cycle ${[
                        ...stack,
                        evidenceId
                    ].join(" -> ")}.`
                );


                return {

                    evidenceId,

                    status:
                        "UNRESOLVED",

                    terminalEvidenceIds:
                        [],

                    unresolvedLeafIds: [
                        evidenceId
                    ]

                };

            }


            const link =
                links.get(
                    evidenceId
                );


            if (
                link ===
                undefined
            ) {

                const resolution:
                    ScientificEvidenceLineageResolution = {

                        evidenceId,

                        status:
                            "UNRESOLVED",

                        terminalEvidenceIds:
                            [],

                        unresolvedLeafIds: [
                            evidenceId
                        ]

                    };


                memo.set(
                    evidenceId,
                    resolution
                );


                return resolution;

            }


            const childResults =
                link.parentEvidenceIds.map(
                    parentId =>
                        resolveOne(
                            parentId,
                            [
                                ...stack,
                                evidenceId
                            ]
                        )
                );


            const terminalEvidenceIds =
                unique(
                    childResults.flatMap(
                        result =>
                            result.terminalEvidenceIds
                    )
                );

            const unresolvedLeafIds =
                unique(
                    childResults.flatMap(
                        result =>
                            result.unresolvedLeafIds
                    )
                );


            for (
                const terminalId
                of terminalEvidenceIds
            ) {

                const terminalEvidence =
                    terminals.get(
                        terminalId
                    )!;


                if (
                    terminalEvidence.sourceId !==
                        link.sourceId ||
                    !sameRevision(
                        terminalEvidence.sourceRevision,
                        link.sourceRevision
                    )
                ) {

                    errors.push(
                        `Derived evidence ${link.evidenceId} crosses source provenance through ${terminalId}.`
                    );

                }

            }


            const resolution:
                ScientificEvidenceLineageResolution = {

                    evidenceId,

                    status:
                        unresolvedLeafIds.length ===
                            0 &&
                        terminalEvidenceIds.length >
                            0
                            ? "RESOLVED"
                            : "UNRESOLVED",

                    terminalEvidenceIds,

                    unresolvedLeafIds

                };


            memo.set(
                evidenceId,
                resolution
            );


            return resolution;

        };


        const requestedEvidenceIds =
            unique(
                input.requestedEvidenceIds
            );


        const resolutions =
            requestedEvidenceIds
                .map(
                    evidenceId =>
                        resolveOne(
                            evidenceId,
                            []
                        )
                )
                .sort(
                    (a, b) =>
                        a.evidenceId.localeCompare(
                            b.evidenceId
                        )
                );


        if (
            errors.length >
            0
        ) {

            return this.failed(
                errors
            );

        }


        return {

            terminalEvidenceCatalog:
                [...reachedTerminals]
                    .map(
                        evidenceId =>
                            terminals.get(
                                evidenceId
                            )!
                    )
                    .sort(
                        (a, b) =>
                            a.evidenceId.localeCompare(
                                b.evidenceId
                            )
                    ),

            links:
                [...links.values()]
                    .sort(
                        (a, b) =>
                            a.evidenceId.localeCompare(
                                b.evidenceId
                            )
                    ),

            resolutions,

            errors:
                []

        };

    }


    private addTerminal(
        terminals:
            Map<
                string,
                ScientificEvidenceLineageTerminalEvidence
            >,
        terminal:
            ScientificEvidenceLineageTerminalEvidence,
        errors:
            string[]
    ): void {

        if (
            terminals.has(
                terminal.evidenceId
            )
        ) {

            errors.push(
                `Duplicate terminal evidence ${terminal.evidenceId}.`
            );

            return;

        }


        terminals.set(
            terminal.evidenceId,
            terminal
        );

    }


    private failed(
        errors:
            string[]
    ): ScientificEvidenceLineageResult {

        return {

            terminalEvidenceCatalog:
                [],

            links:
                [],

            resolutions:
                [],

            errors:
                unique(
                    errors
                )

        };

    }

}