import type {
    SourceIndependenceAssessment
} from "./SourceIndependenceAssessment.js";

import type {
    SourceIndependenceSetAssessment
} from "./SourceIndependenceSetAssessment.js";

export class SourceIndependenceSetAssessmentEngine {

    build(
        sourceIds: string[],
        pairAssessments: SourceIndependenceAssessment[]
    ): SourceIndependenceSetAssessment {

        const uniqueSourceIds =
            [
                ...new Set(
                    sourceIds
                )
            ];

        if (
            uniqueSourceIds.length < 2
        ) {

            return {
                sourceIds:
                    uniqueSourceIds,

                establishedIndependentSourceIds:
                    [],

                establishedIndependentSources:
                    0,

                fullyEstablished:
                    false,

                hasInconclusiveRelationships:
                    false
            };

        }

        const independentSets:
            string[][] = [];

        const totalMasks =
            1 << uniqueSourceIds.length;

        for (
            let mask = 0;
            mask < totalMasks;
            mask++
        ) {

            const candidate =
                uniqueSourceIds.filter(
                    (_sourceId, index) =>
                        (
                            mask &
                            (
                                1 << index
                            )
                        ) !== 0
                );

            if (
                candidate.length < 2
            ) {
                continue;
            }

            if (
                this.isFullyIndependentSet(
                    candidate,
                    pairAssessments
                )
            ) {

                independentSets.push(
                    candidate
                );

            }

        }

        independentSets.sort(
            (left, right) => {

                if (
                    right.length !==
                    left.length
                ) {

                    return (
                        right.length -
                        left.length
                    );

                }

                return left
                    .join("|")
                    .localeCompare(
                        right.join("|")
                    );

            }
        );

        const establishedIndependentSourceIds =
            independentSets[0] ??
            [];

        const hasInconclusiveRelationships =
            pairAssessments.some(
                assessment =>
                    assessment.status ===
                    "INCONCLUSIVE"
            );

        return {
            sourceIds:
                uniqueSourceIds,

            establishedIndependentSourceIds:
                [
                    ...establishedIndependentSourceIds
                ],

            establishedIndependentSources:
                establishedIndependentSourceIds.length,

            fullyEstablished:
                establishedIndependentSourceIds.length ===
                    uniqueSourceIds.length,

            hasInconclusiveRelationships
        };

    }

    private isFullyIndependentSet(
        sourceIds: string[],
        pairAssessments: SourceIndependenceAssessment[]
    ): boolean {

        for (
            let leftIndex = 0;
            leftIndex < sourceIds.length;
            leftIndex++
        ) {

            for (
                let rightIndex = leftIndex + 1;
                rightIndex < sourceIds.length;
                rightIndex++
            ) {

                const sourceAId =
                    sourceIds[leftIndex];

                const sourceBId =
                    sourceIds[rightIndex];

                const pair =
                    pairAssessments.find(
                        assessment =>
                            this.samePair(
                                assessment.sourceIds,
                                sourceAId,
                                sourceBId
                            )
                    );

                if (
                    pair?.status !==
                    "INDEPENDENT"
                ) {

                    return false;

                }

            }

        }

        return true;

    }

    private samePair(
        pairSourceIds: string[],
        sourceAId: string,
        sourceBId: string
    ): boolean {

        return (
            pairSourceIds.length === 2 &&
            (
                (
                    pairSourceIds[0] === sourceAId &&
                    pairSourceIds[1] === sourceBId
                ) ||
                (
                    pairSourceIds[0] === sourceBId &&
                    pairSourceIds[1] === sourceAId
                )
            )
        );

    }

}