import type { ResearchExtraction } from "../extraction/ResearchExtraction.js";
import type { ProtocolSemantic } from "./ProtocolSemantic.js";

export class ProtocolSemanticExtractor {

    extract(extraction: ResearchExtraction): ProtocolSemantic[] {

        const knownRoles: Record<string, ProtocolSemantic> = {
            ERC8004: {
                protocolId: "ERC8004",
                capabilities: ["AgentIdentity"],
                role: "Agent identity binding",
                evidence: [extraction.sourceId],
                confidence: 100
            },
            ERC8217: {
                protocolId: "ERC8217",
                capabilities: ["IdentityBinding"],
                role: "Identity binding",
                evidence: [extraction.sourceId],
                confidence: 100
            },
            ERC8281: {
                protocolId: "ERC8281",
                capabilities: ["InputProvenance"],
                role: "Input provenance",
                evidence: [extraction.sourceId],
                confidence: 100
            },
            ERC8299: {
                protocolId: "ERC8299",
                capabilities: ["SpineCommitment"],
                role: "Spine commitment",
                evidence: [extraction.sourceId],
                confidence: 100
            },
            ERC8001: {
                protocolId: "ERC8001",
                capabilities: ["Authority"],
                role: "Authority envelope",
                evidence: [extraction.sourceId],
                confidence: 100
            },
            ERC8312: {
                protocolId: "ERC8312",
                capabilities: ["Cursor"],
                role: "Consumption cursor",
                evidence: [extraction.sourceId],
                confidence: 100
            },
            ERC8301: {
                protocolId: "ERC8301",
                capabilities: ["Workflow"],
                role: "Workflow state machine",
                evidence: [extraction.sourceId],
                confidence: 100
            },
            ERC8263: {
                protocolId: "ERC8263",
                capabilities: ["Anchoring"],
                role: "Commitment anchoring",
                evidence: [extraction.sourceId],
                confidence: 100
            },
            ERC8274: {
                protocolId: "ERC8274",
                capabilities: ["Verification"],
                role: "Verification",
                evidence: [extraction.sourceId],
                confidence: 100
            },
            ReceiptOS: {
                protocolId: "ReceiptOS",
                capabilities: ["Eligibility"],
                role: "Eligibility",
                evidence: [extraction.sourceId],
                confidence: 100
            },
            ERC8275: {
                protocolId: "ERC8275",
                capabilities: ["Settlement"],
                role: "Settlement layer",
                evidence: [extraction.sourceId],
                confidence: 100
            },
            ERC8060: {
                protocolId: "ERC8060",
                capabilities: ["EmbeddedValue"],
                role: "Embedded native value",
                evidence: [extraction.sourceId],
                confidence: 100
            },
            IERC8060Reservable: {
                protocolId: "IERC8060Reservable",
                capabilities: ["Reservation", "Accounting"],
                role: "Reservable accounting layer",
                evidence: [extraction.sourceId],
                confidence: 100
            }
        };

        return extraction.protocols
            .filter(protocol => knownRoles[protocol] !== undefined)
            .map(protocol => knownRoles[protocol]);

    }

}