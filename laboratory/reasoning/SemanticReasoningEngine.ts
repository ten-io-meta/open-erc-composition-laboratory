import type { SemanticDiscoveryResult } from "../semantic-discovery/SemanticDiscoveryResult.js";
import type { SemanticReasoningRelation } from "./SemanticReasoningRelation.js";
import type { SemanticReasoningResult } from "./SemanticReasoningResult.js";

export class SemanticReasoningEngine {

    reason(result: SemanticDiscoveryResult): SemanticReasoningResult {

        try {

            const capabilities = new Set(
                result.model.capabilities.map(capability => capability.capabilityId)
            );

            const relations: SemanticReasoningRelation[] = [];

            const addRelation = (
                fromCapability: string,
                toCapability: string,
                relation: SemanticReasoningRelation["relation"],
                reason: string,
                confidence: number
            ): void => {

                if (!capabilities.has(fromCapability) || !capabilities.has(toCapability)) {
                    return;
                }

                relations.push({
                    fromCapability,
                    toCapability,
                    relation,
                    reason,
                    evidence: [result.graphId],
                    confidence
                });

            };

            addRelation(
                "Authority",
                "Cursor",
                "CONSTRAINS",
                "Authority constrains how much consumption can be represented by the cursor.",
                100
            );

            addRelation(
                "Cursor",
                "Authority",
                "DEPENDS_ON",
                "Cursor accounting depends on an authority boundary to determine valid consumption.",
                100
            );

            addRelation(
                "Reservation",
                "Settlement",
                "CONSTRAINS",
                "Reservation constrains settlement by defining the maximum reserved value available for settlement.",
                100
            );

            addRelation(
                "Settlement",
                "Reservation",
                "DEPENDS_ON",
                "Settlement depends on reserved value to remain bounded by deterministic accounting.",
                100
            );

            addRelation(
                "Reservation",
                "Accounting",
                "PROTECTS",
                "Reservation protects accounting by separating locked value from available value.",
                100
            );

            addRelation(
                "Accounting",
                "Reservation",
                "ACCOUNTS_FOR",
                "Accounting tracks reserved value through locked and available value boundaries.",
                100
            );

            addRelation(
                "EmbeddedValue",
                "Reservation",
                "ENABLES",
                "Embedded value enables reservable accounting by providing value held inside the token context.",
                90
            );

            addRelation(
                "Workflow",
                "Authority",
                "DEPENDS_ON",
                "Workflow execution depends on authority constraints to remain bounded.",
                85
            );

            addRelation(
                "Workflow",
                "Settlement",
                "PRODUCES",
                "Workflow execution can produce settlement actions as part of a composed protocol flow.",
                85
            );

            addRelation(
                "Verification",
                "Settlement",
                "VALIDATES",
                "Verification validates settlement conditions before value movement is accepted.",
                85
            );

            addRelation(
                "Anchoring",
                "Verification",
                "ANCHORS",
                "Anchoring provides commitment references that verification can use as evidence.",
                85
            );

            addRelation(
                "Eligibility",
                "Settlement",
                "CONSTRAINS",
                "Eligibility constrains settlement by determining whether a settlement path is allowed.",
                85
            );

            return {
                sourceId: result.graphId,
                reasonedAt: new Date().toISOString(),
                relations,
                errors: []
            };

        } catch (error) {

            return {
                sourceId: result.graphId,
                reasonedAt: new Date().toISOString(),
                relations: [],
                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown semantic reasoning error"
                ]
            };

        }

    }

}