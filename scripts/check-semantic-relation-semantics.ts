import {
    normalizeSemanticRelation,
    semanticRelationPhrase,
    semanticRelationEvidenceCues
} from "../laboratory/reasoning/SemanticRelationSemantics";


const relations = [
    "ENABLES",
    "DEPENDS_ON",
    "REQUIRES",
    "CONSTRAINS",
    "PRODUCES",
    "CONSUMES",
    "SETTLES",
    "PROTECTS",
    "VALIDATES",
    "ANCHORS",
    "RESERVES",
    "ACCOUNTS_FOR"
];


for (const relation of relations) {

    const normalized =
        normalizeSemanticRelation(
            relation
        );

    const phrase =
        semanticRelationPhrase(
            relation
        );

    const cues =
        semanticRelationEvidenceCues(
            relation
        );

    console.log({
        relation,
        normalized,
        phrase,
        supportCueCount: cues.support.length,
        challengeCueCount: cues.challenge.length,
        supportSample: cues.support.slice(0, 4),
        challengeSample: cues.challenge.slice(0, 4)
    });

}