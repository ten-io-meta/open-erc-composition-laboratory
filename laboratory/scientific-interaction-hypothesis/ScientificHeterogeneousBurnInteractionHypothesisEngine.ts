import type { ScientificSourceBoundBurnMechanism } from "../scientific-burn-semantics/ScientificBurnSemanticsComparisonEngine.js";

export interface ScientificInteractionPropertyEvidence {
    invariantId:string;
    participantSide:"A"|"B"|"JOINT";
    sourceFactIds:string[];
    transactionHash:string;
    verdict:"OBSERVED_CONSISTENT"|"OBSERVED_VIOLATION";
}

export interface ScientificHeterogeneousInteractionHypothesis {
    hypothesisId:string;
    mechanism:"COORDINATED_HETEROGENEOUS_DESTRUCTION";
    participants:{id:string;repository:string;revision:string;assetUnit:string}[];
    sharedTransactionHash:string;
    supportingPropertyIds:string[];
    sourceProvenance:{participantId:string;sourceRevision:string;factIds:string[]}[];
    questions:string[];
    limitations:string[];
    status:"SCOPED_EXPERIMENTAL_HYPOTHESIS"|"BLOCKED_INSUFFICIENT_EVIDENCE";
    discoveryAdmission:"NOT_ADMITTED";
    scientificPolarity:"INCONCLUSIVE";
}

/**
 * Independent pre-discovery interaction hypothesis generation.
 * Does not create a ScientificCompositionCandidate and cannot authorize
 * SUPPORTS, CHALLENGES or candidate admission. A shared transaction is
 * evidence only for one explicitly bounded experiment.
 */
export class ScientificHeterogeneousBurnInteractionHypothesisEngine {
    derive(input:{
        mechanisms:ScientificSourceBoundBurnMechanism[];
        properties:ScientificInteractionPropertyEvidence[];
        discoveryCandidateCount:number;
    }):ScientificHeterogeneousInteractionHypothesis {
        const sources=input.mechanisms;
        const properties=input.properties;
        const tx=sources.length===2?sources[0].transactionHash:"";
        const validSource=(m:ScientificSourceBoundBurnMechanism)=>
            !!m?.participantId && !!m.repository &&
            /^[0-9a-f]{40}$/i.test(m.sourceRevision) &&
            /^0x[0-9a-f]{64}$/i.test(m.transactionHash) &&
            m.burnDeclaration.depth===m.burnDeclaration.inheritanceEdgeIds.length &&
            m.burnDeclaration.declarationFactId.length>0 &&
            m.sourceFactIds.length>0 && m.numericalWitnesses.length>0;
        const valid= sources.length===2 &&
            sources.every(validSource) &&
            sources[0].participantId!==sources[1].participantId &&
            sources[0].assetUnit!==sources[1].assetUnit &&
            sources.every(s=>s.transactionHash.toLowerCase()===tx.toLowerCase()) &&
            Number.isSafeInteger(input.discoveryCandidateCount) &&
            input.discoveryCandidateCount===0;
        const bySide=(side:"A"|"B"|"JOINT")=>properties.filter(p=>p.participantSide===side);
        const complete=valid &&
            properties.length>=3 &&
            (["A","B","JOINT"] as const).every(side=>bySide(side).length>0) &&
            new Set(properties.map(p=>p.invariantId)).size===properties.length &&
            properties.every(p=>p.invariantId.trim()&&
                p.verdict==="OBSERVED_CONSISTENT" &&
                p.transactionHash.toLowerCase()===tx.toLowerCase() &&
                p.sourceFactIds.length>0 &&
                p.sourceFactIds.every(id=>id.trim().length>0)) &&
            sources.every((s,i)=>bySide(i===0?"A":"B").some(p=>
                p.sourceFactIds.some(id=>s.sourceFactIds.includes(id)))) &&
            bySide("JOINT").some(p=>
                sources.every(s=>p.sourceFactIds.some(id=>s.sourceFactIds.includes(id))));
        const id=valid?[
            "HYPOTHESIS-COORDINATED-HETEROGENEOUS-BURN",
            ...sources.map(s=>s.participantId+"@"+s.sourceRevision)
        ].join(":"):"HYPOTHESIS-UNRESOLVED";
        return {
            hypothesisId:id,
            mechanism:"COORDINATED_HETEROGENEOUS_DESTRUCTION",
            participants:sources.map(s=>({
                id:s.participantId,repository:s.repository,
                revision:s.sourceRevision,assetUnit:s.assetUnit
            })),
            sharedTransactionHash:tx,
            supportingPropertyIds:complete?properties.map(p=>p.invariantId).sort():[],
            sourceProvenance:sources.map(s=>({
                participantId:s.participantId,sourceRevision:s.sourceRevision,
                factIds:[...s.sourceFactIds]
            })),
            questions:[
                "Under what coordinator ordering do both burns and the ETH payout remain atomic?",
                "Which failed approvals, redeem attempts and reentrancy conditions revert both assets?",
                "Does the NFT redemption obligation remain solvent after the cross-protocol operation?",
                "Does the ERC-20 supply remain non-increasing across all admitted transitions?"
            ],
            limitations:[
                "One local EVM execution cannot establish universal compatibility.",
                "ERC-721 token-ID destruction differs from ERC-20 fungible supply reduction.",
                "All source facts require independent verification of actual package and contract revisions.",
                "Scientific discovery and a READY candidate specification are separate prerequisites."
            ],
            status:complete?"SCOPED_EXPERIMENTAL_HYPOTHESIS":"BLOCKED_INSUFFICIENT_EVIDENCE",
            discoveryAdmission:"NOT_ADMITTED",
            scientificPolarity:"INCONCLUSIVE"
        };
    }
}
