import type { KnowledgeEntry } from "./KnowledgeEntry.js";
import type { MachineReasoningResult } from "../machine-reasoning/MachineReasoningResult.js";
import type { MachineReasoningInference } from "../machine-reasoning/MachineReasoningInference.js";

export class ReasoningKnowledgeAdapter {

    static toKnowledgeEntries(
        machineReasoning: MachineReasoningResult | undefined,
        startIndex: number,
        sourceId = "UNKNOWN"
    ): KnowledgeEntry[] {

        if (!machineReasoning?.inferences) {
            return [];
        }

        const timestamp = new Date().toISOString();

        return machineReasoning.inferences.map(
            (inference: MachineReasoningInference, index: number) => {

                const subject =
                    "subject" in inference
                        ? String((inference as any).subject)
                        : "UnknownSubject";

                const relation =
                    "relation" in inference
                        ? String((inference as any).relation)
                        : "INFERRED";

                const object =
                    "object" in inference
                        ? String((inference as any).object)
                        : "UnknownObject";

                const confidence =
                    "confidence" in inference
                        ? Number((inference as any).confidence)
                        : 70;

                const evidence =
                    "evidence" in inference && Array.isArray((inference as any).evidence)
                        ? (inference as any).evidence.map(String)
                        : [];

                const reasoning =
                    "reasoning" in inference
                        ? String((inference as any).reasoning)
                        : undefined;

                return {
                    entryId: `KNOW-${String(startIndex + index +1).padStart(5, "0")}`,
                    sourceId,
                    relation: `${subject}:${relation}:${object}`,
                    protocolPair: `${subject}->${object}`,
                    observations: 1,
                    averageConfidence: confidence,
                    confirmed: 0,
                    partial: 1,
                    unsupported: 0,
                    status: "EMERGING",
                    evidence: [
                        "machine-reasoning",
                        `inference:${subject}:${relation}:${object}`,
                        ...evidence,
                        ...(reasoning ? [`reasoning:${reasoning}`] : [])
                    ],
                    generatedBy: "MACHINE_REASONING",
                    timestamp
                };

            }
        );

    }

}