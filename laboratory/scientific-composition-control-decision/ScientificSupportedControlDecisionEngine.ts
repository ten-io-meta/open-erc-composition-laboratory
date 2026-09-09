export const SCIENTIFIC_SUPPORTED_CONTROL_GATES = [
    "QUALIFYING_COMPOSITION_CANDIDATE",
    "KNOWN_RELEVANT_BOUNDARIES",
    "OBSERVED_RELEVANT_BOUNDARIES",
    "NO_OBSERVED_BOUNDARY_VIOLATION",
    "SUFFICIENT_COMPATIBILITY_EVIDENCE",
    "FUNCTIONAL_CONFIGURATION_EVIDENCE"
] as const;


export type ScientificSupportedControlGate =
    typeof SCIENTIFIC_SUPPORTED_CONTROL_GATES[number];


export interface ScientificSupportedControlGateEvidence {
    gate:
        ScientificSupportedControlGate;

    satisfied:
        boolean;

    evidenceIds:
        string[];
}


export class ScientificSupportedControlDecisionEngine {

    evaluate(
        gates:
            ScientificSupportedControlGateEvidence[]
    ) {

        const errors:
            string[] = [];

        const byGate =
            new Map(
                gates.map(
                    item => [
                        item.gate,
                        item
                    ] as const
                )
            );

        if (byGate.size !== gates.length) {
            errors.push(
                "Duplicate SUPPORTED control gate."
            );
        }

        for (
            const gate
            of SCIENTIFIC_SUPPORTED_CONTROL_GATES
        ) {

            const item =
                byGate.get(gate);

            if (item === undefined) {
                errors.push(
                    `Missing SUPPORTED control gate ${gate}.`
                );
                continue;
            }

            if (
                item.satisfied &&
                item.evidenceIds.length === 0
            ) {
                errors.push(
                    `Satisfied gate ${gate} has no evidence.`
                );
            }

        }

        if (errors.length > 0) {
            return {
                decision:
                    "INCONCLUSIVE" as const,
                missingGates:
                    [],
                errors
            };
        }

        const missingGates =
            SCIENTIFIC_SUPPORTED_CONTROL_GATES.filter(
                gate =>
                    !byGate.get(gate)!.satisfied
            );

        return {
            decision:
                missingGates.length === 0
                    ? "SUPPORTED" as const
                    : "INCONCLUSIVE" as const,

            missingGates,

            errors:
                []
        };

    }

}