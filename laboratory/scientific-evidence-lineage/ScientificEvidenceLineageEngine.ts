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
    ScientificEvidenceLineageReference,
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

    requestedEvidenceRefs:
        ScientificEvidenceLineageReference[];

}


function encode(
    parts:
        string[]
): string {

    return parts
        .map(
            part =>
                `${part.length}:${part}`
        )
        .join("|");

}


function referenceKey(
    reference:
        ScientificEvidenceLineageReference
): string {

    return encode([
        reference.sourceId,
        reference.sourceRevision ?? "UNVERSIONED",
        reference.evidenceId
    ]);

}


function uniqueStrings(
    values:
        string[]
): string[] {

    return [
        ...new Set(
            values
        )
    ].sort();

}


function uniqueReferences(
    values:
        ScientificEvidenceLineageReference[]
): ScientificEvidenceLineageReference[] {

    const byKey =
        new Map<
            string,
            ScientificEvidenceLineageReference
        >();


    for (
        const value
        of values
    ) {

        byKey.set(
            referenceKey(
                value
            ),
            value
        );

    }


    return [...byKey.values()]
        .sort(
            (a, b) =>
                referenceKey(
                    a
                ).localeCompare(
                    referenceKey(
                        b
                    )
                )
        );

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


function reference(
    sourceId:
        string,
    sourceRevision:
        string | undefined,
    evidenceId:
        string
): ScientificEvidenceLineageReference {

    return {

        evidenceId,

        sourceId,

        ...(
            sourceRevision !==
            undefined
                ? {
                    sourceRevision
                }
                : {}
        )

    };

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

            const observationRef =
                reference(
                    observation.sourceId,
                    observation.sourceRevision,
                    observation.observationId
                );

            const key =
                referenceKey(
                    observationRef
                );


            if (
                observations.has(
                    key
                )
            ) {

                errors.push(
                    `Duplicate source observation in provenance scope ${key}.`
                );

                continue;

            }


            observations.set(
                key,
                observation
            );


            this.addTerminal(
                terminals,
                {

                    ...observationRef,

                    kind:
                        "SOURCE_OBSERVATION",

                    sourceType:
                        observation.sourceType,

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
                    referenceKey(
                        reference(
                            fact.sourceId,
                            fact.sourceRevision,
                            fact.observationId
                        )
                    )
                );


            if (
                observation ===
                undefined
            ) {

                errors.push(
                    `Source fact ${fact.factId} references unknown observation ${fact.observationId} inside ${fact.sourceId}.`
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

                    ...reference(
                        fact.sourceId,
                        fact.sourceRevision,
                        fact.factId
                    ),

                    kind:
                        "SOURCE_FACT",

                    sourceType:
                        observation.sourceType,

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
                    referenceKey(
                        reference(
                            relation.sourceId,
                            relation.sourceRevision,
                            relation.observationId
                        )
                    )
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

                    ...reference(
                        relation.sourceId,
                        relation.sourceRevision,
                        relation.relationEvidenceId
                    ),

                    kind:
                        "DOCUMENTARY_RELATION",

                    sourceType:
                        observation.sourceType,

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
                        uniqueStrings(
                            inputLink.parentEvidenceIds
                        )

                };

            const key =
                referenceKey(
                    link
                );


            if (
                terminals.has(
                    key
                )
            ) {

                errors.push(
                    `Evidence identity collides with terminal evidence inside provenance scope ${key}.`
                );

                continue;

            }


            const existing =
                links.get(
                    key
                );


            if (
                existing !==
                undefined
            ) {

                if (
                    existing.kind !==
                    link.kind
                ) {

                    errors.push(
                        `Derived evidence ${link.evidenceId} has conflicting kinds inside ${link.sourceId}.`
                    );

                    continue;

                }


                existing.parentEvidenceIds =
                    uniqueStrings([
                        ...existing.parentEvidenceIds,
                        ...link.parentEvidenceIds
                    ]);


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
                key,
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

        const reachedTerminalKeys =
            new Set<string>();


        const resolveOne = (
            requested:
                ScientificEvidenceLineageReference,
            stack:
                string[]
        ): ScientificEvidenceLineageResolution => {

            const key =
                referenceKey(
                    requested
                );


            const cached =
                memo.get(
                    key
                );


            if (
                cached !==
                undefined
            ) {

                return cached;

            }


            const terminal =
                terminals.get(
                    key
                );


            if (
                terminal !==
                undefined
            ) {

                reachedTerminalKeys.add(
                    key
                );


                const resolution:
                    ScientificEvidenceLineageResolution = {

                        ...requested,

                        status:
                            "RESOLVED",

                        terminalEvidenceIds: [
                            requested.evidenceId
                        ],

                        unresolvedLeafIds:
                            []

                    };


                memo.set(
                    key,
                    resolution
                );


                return resolution;

            }


            if (
                stack.includes(
                    key
                )
            ) {

                errors.push(
                    `Evidence lineage cycle detected inside provenance scope ${requested.sourceId}.`
                );


                return {

                    ...requested,

                    status:
                        "UNRESOLVED",

                    terminalEvidenceIds:
                        [],

                    unresolvedLeafIds: [
                        requested.evidenceId
                    ]

                };

            }


            const link =
                links.get(
                    key
                );


            if (
                link ===
                undefined
            ) {

                const resolution:
                    ScientificEvidenceLineageResolution = {

                        ...requested,

                        status:
                            "UNRESOLVED",

                        terminalEvidenceIds:
                            [],

                        unresolvedLeafIds: [
                            requested.evidenceId
                        ]

                    };


                memo.set(
                    key,
                    resolution
                );


                return resolution;

            }


            const parentResults =
                link.parentEvidenceIds
                    .map(
                        parentEvidenceId =>
                            resolveOne(
                                reference(
                                    link.sourceId,
                                    link.sourceRevision,
                                    parentEvidenceId
                                ),
                                [
                                    ...stack,
                                    key
                                ]
                            )
                    );


            const terminalEvidenceIds =
                uniqueStrings(
                    parentResults
                        .flatMap(
                            result =>
                                result.terminalEvidenceIds
                        )
                );

            const unresolvedLeafIds =
                uniqueStrings(
                    parentResults
                        .flatMap(
                            result =>
                                result.unresolvedLeafIds
                        )
                );


            const resolution:
                ScientificEvidenceLineageResolution = {

                    ...requested,

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
                key,
                resolution
            );


            return resolution;

        };


        const resolutions =
            uniqueReferences(
                input.requestedEvidenceRefs
            )
                .map(
                    requested =>
                        resolveOne(
                            requested,
                            []
                        )
                )
                .sort(
                    (a, b) =>
                        referenceKey(
                            a
                        ).localeCompare(
                            referenceKey(
                                b
                            )
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
                [...reachedTerminalKeys]
                    .map(
                        key =>
                            terminals.get(
                                key
                            )!
                    )
                    .sort(
                        (a, b) =>
                            referenceKey(
                                a
                            ).localeCompare(
                                referenceKey(
                                    b
                                )
                            )
                    ),

            links:
                [...links.values()]
                    .sort(
                        (a, b) =>
                            referenceKey(
                                a
                            ).localeCompare(
                                referenceKey(
                                    b
                                )
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

        const key =
            referenceKey(
                terminal
            );


        if (
            terminals.has(
                key
            )
        ) {

            errors.push(
                `Duplicate terminal evidence inside provenance scope ${key}.`
            );

            return;

        }


        terminals.set(
            key,
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
                uniqueStrings(
                    errors
                )

        };

    }

}