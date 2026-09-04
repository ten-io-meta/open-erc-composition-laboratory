import type { MachineReasoningInference } from "./MachineReasoningInference.js";
import type { MachineReasoningResult } from "./MachineReasoningResult.js";

export class MachineReasoningEngine {

    reason(sourceId: string, extraction: any): MachineReasoningResult {

        try {
            const capabilities: string[] = extraction.capabilities ?? [];
            const protocols: string[] = extraction.protocols ?? [];
            const claims: any[] = extraction.claims ?? [];

            const claimText = claims
                .map(claim => typeof claim === "string" ? claim : claim.text ?? "")
                .join("\n")
                .toLowerCase();

            const inferences: MachineReasoningInference[] = [];

            const has = (capability: string) =>
                capabilities.includes(capability);

            const add = (
                subject: string,
                relation: string,
                object: string,
                reason: string,
                confidence: number,
                evidence: string[]
            ) => {
                inferences.push({
                    inferenceId: `MRI-${String(inferences.length + 1).padStart(5, "0")}`,
                    sourceId,
                    subject,
                    relation,
                    object,
                    reason,
                    confidence,
                    evidence
                });
            };

            if (has("EmbeddedValue") && has("Reservation")) {
                add(
                    "EmbeddedValue",
                    "ENABLES",
                    "Reservation",
                    "A repository that contains both embedded value and reservation capabilities suggests that embedded value can be committed without immediate transfer.",
                    72,
                    ["capability:EmbeddedValue", "capability:Reservation"]
                );
            }

            if (has("Reservation") && has("Accounting")) {
                add(
                    "Reservation",
                    "CONSTRAINS",
                    "Accounting",
                    "Reservation appears to constrain accounting by separating committed value from available value.",
                    76,
                    ["capability:Reservation", "capability:Accounting"]
                );
            }

            if (has("Reservation") && has("Settlement")) {
                add(
                    "Reservation",
                    "BOUNDS",
                    "Settlement",
                    "Reservation and settlement appearing together suggests that reserved value may define a deterministic settlement boundary.",
                    74,
                    ["capability:Reservation", "capability:Settlement"]
                );
            }

            if (has("InvariantValidation") && has("Accounting")) {
                add(
                    "InvariantValidation",
                    "VALIDATES",
                    "Accounting",
                    "Invariant validation combined with accounting suggests that the repository attempts to prove accounting safety properties.",
                    78,
                    ["capability:InvariantValidation", "capability:Accounting"]
                );
            }

            if (has("Testing") && has("InvariantValidation")) {
                add(
                    "Testing",
                    "SUPPORTS",
                    "InvariantValidation",
                    "Testing and invariant validation appearing together indicates executable evidence for claimed invariants.",
                    70,
                    ["capability:Testing", "capability:InvariantValidation"]
                );
            }

            if (
                claimText.includes("deterministic") &&
                has("Accounting")
            ) {
                add(
                    "DeterministicExecution",
                    "REQUIRES",
                    "Accounting",
                    "Claims mentioning deterministic behavior together with accounting indicate that deterministic execution depends on stable accounting boundaries.",
                    68,
                    ["claim:deterministic", "capability:Accounting"]
                );
            }

            if (
                claimText.includes("cannot") ||
                claimText.includes("never") ||
                claimText.includes("must")
            ) {
                add(
                    "InvariantLanguage",
                    "INDICATES",
                    "SafetyConstraint",
                    "Normative language such as cannot, never, or must suggests safety constraints that may be suitable for hypothesis validation.",
                    64,
                    ["claim:normative-language"]
                );
            }

            if (
                protocols.includes("ERC8060") &&
                protocols.includes("IERC8060Reservable")
            ) {
                add(
                    "ERC8060",
                    "ENABLES",
                    "IERC8060Reservable",
                    "The repository links ERC8060 with IERC8060Reservable, suggesting that reservable accounting extends embedded value behavior.",
                    80,
                    ["protocol:ERC8060", "protocol:IERC8060Reservable"]
                );
            }

            return {
                generatedAt: new Date().toISOString(),
                sourceId,
                inferences,
                errors: []
            };

        } catch (error) {
            return {
                generatedAt: new Date().toISOString(),
                sourceId,
                inferences: [],
                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown machine reasoning error"
                ]
            };
        }

    }

}