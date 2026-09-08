import type {
    ScientificCompositionComplementarityMatch,
    ScientificCompositionObjectiveCoverage
} from "./ScientificCompositionComplementarityMatch.js";


export interface ScientificCompositionComplementarityResult {

    matches:
        ScientificCompositionComplementarityMatch[];

    unresolvedNeedIds:
        string[];

    objectiveCoverage:
        ScientificCompositionObjectiveCoverage[];

    errors:
        string[];

}
