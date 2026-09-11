import type {
    ScientificCompositionValueRuleId
} from "./ScientificCompositionValueRule.js";


export type ScientificCompositionValueFindingKind =
    | "FUNCTIONAL_COMPLEMENT"
    | "ARCHITECTURAL_PROPERTY"
    | "ADVANTAGE"
    | "TRADEOFF"
    | "EVIDENCE_LIMITATION"
    | "EMERGENT_PROPERTY";


export type ScientificCompositionValueFindingBasis =
    | "SUPPORTED_FUNCTIONAL_RELATION"
    | "SUPPORTED_FULL_CONFIGURATION"
    | "SUPPORTED_STRICT_SUBSET"
    | "DERIVED_COMPOSITION_RULE";


export interface ScientificCompositionValueFinding {

    findingId:
        string;

    ruleId:
        ScientificCompositionValueRuleId;

    kind:
        ScientificCompositionValueFindingKind;

    title:
        string;

    statement:
        string;

    basis:
        ScientificCompositionValueFindingBasis;

    participantIds:
        string[];

    configurationIds:
        string[];

    candidateIds:
        string[];

    needIds:
        string[];

    contributionIds:
        string[];

    boundaryIds:
        string[];

    discoveryEvidenceIds:
        string[];

    compatibilityEvidenceIds:
        string[];

    observationIds:
        string[];

    runIds:
        string[];

}