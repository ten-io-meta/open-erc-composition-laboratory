import { createHash } from "node:crypto";
import type {
    NativeBehavioralDiscoveryResult
} from "../scientific-cross-protocol-composition/ScientificNativeBehavioralHypothesisEngine.js";

type SourceFact = {
    factId: string;
    sourceId: string;
    sourceRevision: string;
    sourceSha256: string;
    attributedParticipantId?: string;
    inheritanceAnchorFactId?: string;
};
type Participant = {
    sourceId: string; revision: string; assetClass: string;
    provenance: SourceFact[];
    effects: {kind:string;assetClass:string;boundedBy:string;sourceFactIds:string[]}[];
    restrictions: {kind:string;sourceFactIds:string[]}[];
};
export interface NativeBehavioralQuestion {
    questionId: string;
    participantSide: "A" | "B" | "JOINT";
    category: "AUTHORIZATION" | "AVAILABILITY" | "STATE_CONSISTENCY" | "RESOURCE_DECREASE" |
        "ATOMIC_EXECUTION" | "JOINT_ROLLBACK";
    sourceFactIds: string[];
    prediction: string;
    evidenceRequired: string;
    status: "NOT_EVALUATED";
}
export interface NativeBehavioralEvaluationSpecification {
    specificationId: string;
    hypothesisId: string;
    status: "INSUFFICIENT_EVIDENCE";
    sourceGraphSha256: string;
    questions: NativeBehavioralQuestion[];
    participantAQuestionIds: string[];
    participantBQuestionIds: string[];
    jointQuestionIds: string[];
    unresolvedRequirements: string[];
    nativeCandidateId: null;
    candidateAdmission: "NOT_ADMITTED";
    scientificPolarity: "INCONCLUSIVE";
}
export interface NativeBehavioralEvaluationSpecificationResult {
    schemaVersion: "OECL_NATIVE_BEHAVIORAL_EVALUATION_SPECIFICATION_V1";
    specifications: NativeBehavioralEvaluationSpecification[];
    errors: string[];
    candidateCount: 0;
    scientificPolarity: "INCONCLUSIVE";
}
const hash=(x:unknown)=>createHash("sha256").update(JSON.stringify(x)).digest("hex");

/** Produce source-derived scientific questions, not a READY candidate spec.
 * All known local constraints are enumerated, and joint/runtime uncertainties
 * remain explicit, so the admission engine cannot mistake a draft for READY.
 */
export class ScientificNativeBehavioralSpecificationEngine {
    build(input: {
        discovery: NativeBehavioralDiscoveryResult;
        normalizedParticipants: Participant[];
    }): NativeBehavioralEvaluationSpecificationResult {
        const fail=(reason:string):NativeBehavioralEvaluationSpecificationResult=>({
            schemaVersion:"OECL_NATIVE_BEHAVIORAL_EVALUATION_SPECIFICATION_V1",
            specifications:[],errors:[reason],candidateCount:0,
            scientificPolarity:"INCONCLUSIVE"
        });
        const d=input.discovery;
        if(d.schemaVersion!=="OECL_NATIVE_AST_BEHAVIORAL_DISCOVERY_V1" ||
            d.errors.length!==0 || d.hypotheses.length!==1 || d.candidateCount!==0 ||
            d.hypotheses[0].candidateAdmission!=="NOT_ADMITTED" ||
            d.hypotheses[0].state!=="SOURCE_ONLY_UNEVALUATED")
            return fail("NO_ATTESTED_NATIVE_SOURCE_ONLY_HYPOTHESIS");
        const hypothesis=d.hypotheses[0];
        const ordered=hypothesis.participants;
        if(ordered.length!==2||new Set(ordered.map(x=>x.sourceId)).size!==2 ||
           new Set(ordered.map(x=>x.assetClass)).size!==2 ||
           !Array.isArray(input.normalizedParticipants) ||
           input.normalizedParticipants.length!==2)
            return fail("AMBIGUOUS_NATIVE_HYPOTHESIS_PARTICIPANTS");
        const questions:NativeBehavioralQuestion[]=[];
        const localIds:{A:string[],B:string[]}={A:[],B:[]};
        const categories=["AUTHORIZATION","AVAILABILITY","STATE_CONSISTENCY"] as const;
        for(let i=0;i<2;i++){
            const side=i===0?"A":"B";
            const p=ordered[i];
            const candidates=input.normalizedParticipants.filter(x=>
                x.sourceId===p.sourceId && x.revision===p.sourceRevision &&
                x.assetClass===p.assetClass);
            if(candidates.length!==1) return fail("PARTICIPANT_SOURCE_FACTS_NOT_MATCHED");
            const source=candidates[0];
            const facts=new Map(source.provenance.map(f=>[f.factId,f]));
            if(facts.size!==source.provenance.length ||
               !source.provenance.every(f=>hypothesis.evidence.some(h=>
                 h.factId===f.factId&&h.sourceId===f.sourceId&&
                 h.sourceRevision===f.sourceRevision&&h.sourceSha256===f.sourceSha256)))
                return fail("UNATTRIBUTED_OR_DUPLICATED_EVALUATION_FACT");
            const effect=source.effects.filter(e=>e.kind==="DECREASE" &&
                e.assetClass===p.assetClass&&e.boundedBy==="AVAILABLE_QUANTITY");
            if(effect.length!==1||effect[0].sourceFactIds.length===0 ||
               !effect[0].sourceFactIds.every(id=>facts.has(id)))
                return fail("MISSING_BOUND_RESOURCE_DECREASE");
            for(const category of categories){
                const matches=source.restrictions.filter(r=>r.kind===category);
                if(matches.length!==1||!matches[0].sourceFactIds.length||
                   !matches[0].sourceFactIds.every(id=>facts.has(id)))
                    return fail("MISSING_OR_AMBIGUOUS_SOURCE_RESTRICTION_"+category);
                const q:NativeBehavioralQuestion={
                    questionId:hypothesis.hypothesisId+":"+side+":"+category,
                    participantSide:side,category,sourceFactIds:matches[0].sourceFactIds,
                    prediction:"The participant's "+category+" restriction holds under intended execution.",
                    evidenceRequired:"Independent execution observation tied to exact source identity and transaction.",
                    status:"NOT_EVALUATED"
                };
                questions.push(q);localIds[side].push(q.questionId);
            }
            const q:NativeBehavioralQuestion={
                questionId:hypothesis.hypothesisId+":"+side+":RESOURCE_DECREASE",
                participantSide:side,category:"RESOURCE_DECREASE",
                sourceFactIds:effect[0].sourceFactIds,
                prediction:"The "+p.assetClass+" conserved resource decreases without violating protocol-local invariants.",
                evidenceRequired:"Before-and-after measurements of this exact resource; cross-unit equivalence is not assumed.",
                status:"NOT_EVALUATED"
            };
            questions.push(q);localIds[side].push(q.questionId);
        }
        const a=questions.find(q=>q.participantSide==="A"&&q.category==="RESOURCE_DECREASE")!;
        const b=questions.find(q=>q.participantSide==="B"&&q.category==="RESOURCE_DECREASE")!;
        const jointQuestions:NativeBehavioralQuestion[]=[
            {questionId:hypothesis.hypothesisId+":JOINT:ATOMIC_EXECUTION",
             participantSide:"JOINT",category:"ATOMIC_EXECUTION",
             sourceFactIds:[...a.sourceFactIds,...b.sourceFactIds],
             prediction:"Both source-attributed resource decreases can occur in one transaction.",
             evidenceRequired:"Independently validated shared transaction receipt and both resource deltas.",
             status:"NOT_EVALUATED"},
            {questionId:hypothesis.hypothesisId+":JOINT:JOINT_ROLLBACK",
             participantSide:"JOINT",category:"JOINT_ROLLBACK",
             sourceFactIds:[...a.sourceFactIds,...b.sourceFactIds],
             prediction:"A failure on either participant rolls back both participant states.",
             evidenceRequired:"Adversarial rollback receipts with source and transaction provenance for both sides.",
             status:"NOT_EVALUATED"}
        ];
        questions.push(...jointQuestions);
        if(new Set(questions.map(q=>q.questionId)).size!==10)
            return fail("DUPLICATE_OR_MISSING_EVALUATION_QUESTION");
        const spec:NativeBehavioralEvaluationSpecification={
            specificationId:"NATIVE-AST-RESEARCH-SPEC-"+hash({
                hypothesisId:hypothesis.hypothesisId,
                sourceGraphSha256:d.sourceGraphSha256,
                questions:questions.map(q=>({category:q.category,side:q.participantSide,
                    factIds:q.sourceFactIds}))
            }).slice(0,24),
            hypothesisId:hypothesis.hypothesisId,status:"INSUFFICIENT_EVIDENCE",
            sourceGraphSha256:d.sourceGraphSha256,questions,
            participantAQuestionIds:localIds.A,participantBQuestionIds:localIds.B,
            jointQuestionIds:jointQuestions.map(q=>q.questionId),
            unresolvedRequirements:[
                "CALL_GRAPH_DYNAMIC_DISPATCH_AND_MODIFIER_PATH_FEASIBILITY",
                "COMPLETE_SOURCE_DERIVED_CONSTRAINT_COVERAGE",
                "SCOPED_JOINT_TRANSACTION_AND_ROLLBACK_EVIDENCE",
                "NATIVE_DISCOVERED_COMPOSITION_CANDIDATE_AND_READY_ADMISSION_SPECIFICATION"
            ],
            nativeCandidateId:null,candidateAdmission:"NOT_ADMITTED",
            scientificPolarity:"INCONCLUSIVE"
        };
        return {
            schemaVersion:"OECL_NATIVE_BEHAVIORAL_EVALUATION_SPECIFICATION_V1",
            specifications:[spec],errors:[],candidateCount:0,scientificPolarity:"INCONCLUSIVE"
        };
    }
}
