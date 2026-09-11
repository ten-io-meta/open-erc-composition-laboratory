import type { ProtocolRelationship } from "./ProtocolRelationship.js";

export class CompositionRelationshipEngine {

    discover(datasets: any[]): ProtocolRelationship[] {

        const relationships =
            new Map<string, ProtocolRelationship>();

        for (const dataset of datasets) {

            const protocols =
                Array.from(
                    new Set<string>(
                        (dataset.resolvedProtocols ?? [])
                            .map((protocol: unknown) =>
                                String(protocol).trim()
                            )
                            .filter(Boolean)
                    )
                ).sort(
                    (left, right) =>
                        left.localeCompare(right)
                );

            const successful =
                this.hasExplicitSuccessfulCompositionEvidence(
                    dataset,
                    protocols.length
                );

            const experimentId =
                this.extractExperimentId(
                    dataset
                );

            for (
                let i = 0;
                i < protocols.length;
                i++
            ) {

                for (
                    let j = i + 1;
                    j < protocols.length;
                    j++
                ) {

                    const from =
                        protocols[i];

                    const to =
                        protocols[j];

                    const key =
                        `${from}|${to}`;

                    if (!relationships.has(key)) {

                        relationships.set(key, {

                            from,

                            to,

                            occurrences: 0,

                            confidence: 0,

                            successfulCompositions: 0,

                            experimentIds: []

                        });

                    }

                    const relationship =
                        relationships.get(key)!;

                    relationship.occurrences++;

                    if (
                        experimentId &&
                        !relationship.experimentIds.includes(
                            experimentId
                        )
                    ) {

                        relationship.experimentIds.push(
                            experimentId
                        );

                    }

                    if (successful) {

                        relationship
                            .successfulCompositions++;

                    }

                }

            }

        }

        for (
            const relationship of
            relationships.values()
        ) {

            relationship.confidence =
                relationship.occurrences > 0
                    ? Math.round(
                        relationship.successfulCompositions /
                        relationship.occurrences *
                        100
                    )
                    : 0;

        }

        return [
            ...relationships.values()
        ];

    }

    private extractExperimentId(
        dataset: any
    ): string | undefined {

        const experimentId =
            String(
                dataset?.experimentId ??
                ""
            ).trim();

        return experimentId ||
            undefined;

    }

    private hasExplicitSuccessfulCompositionEvidence(
        dataset: any,
        protocolCount: number
    ): boolean {

        /*
         * Scenario validation is not composition evidence.
         *
         * Legacy fields such as:
         *
         * - validationPassed
         * - propertyResults["Composability"]
         * - benchmark.target
         *
         * must not be promoted into evidence that a
         * protocol composition itself succeeded.
         *
         * A dataset-level successfulComposition flag can
         * establish pair-level success only when exactly
         * two protocols were under observation.
         *
         * Multi-protocol success cannot be projected onto
         * every pair without explicit pair attribution.
         */

        return (
            protocolCount === 2 &&
            dataset?.successfulComposition === true
        );

    }

}