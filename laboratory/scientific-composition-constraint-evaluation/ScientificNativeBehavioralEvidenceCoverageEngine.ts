import {createHash} from "node:crypto";
import type {NativeBehavioralEvaluationSpecification} from
 "../scientific-composition-evaluation-specification/ScientificNativeBehavioralSpecificationEngine.js";

export type NativeCoverageStatus="SCOPED_OBSERVED"|"PARTIAL_EVIDENCE"|"NO_EVIDENCE";
export interface NativeBehavioralCoverageObservation {
    questionId:string;
    participantSide:"A"|"B"|"JOINT";
    category:string;
    sourceFactIds:string[];
    status:NativeCoverageStatus;
    evidenceRefs:string[];
    scope:string;
    missing:string[];
}
export interface NativeBehavioralCoverageResult {
    schemaVersion:"OECL_NATIVE_AST_BEHAVIORAL_COVERAGE_V1";
    hypothesisId:string|null;
    specificationId:string|null;
    observations:NativeBehavioralCoverageObservation[];
    statistics:{total:number;scopedObserved:number;partial:number;missing:number};
    allQuestionsResolved:false;
    sourceCoverageComplete:false;
    status:"PARTIAL_OBSERVATION"|"BLOCKED_EVIDENCE";
    candidateAdmission:"NOT_ADMITTED";
    finalScientificResult:"INCONCLUSIVE";
    errors:string[];
}
type Bundle={
    nativeStudy:any;bridge:any;evm:any;witness:any;native:any;
    rollback:any;rollbackValidated:any;recognized:any;
    raw:{nativeStudy:string;evm:string;witness:string;native:string;rollback:string;recognized:string};
};
const sha=(s:string)=>createHash("sha256").update(s).digest("hex");
const uint=(x:unknown):x is string=>typeof x==="string"&&/^(0|[1-9][0-9]*)$/.test(x);
const tx=(x:unknown)=>typeof x==="string"&&/^0x[0-9a-f]{64}$/i.test(x);
const equals=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
/**
 * Native scientific observation coverage. Scope is one pinned local-Hardhat
 * experiment, NOT independent chain replay or exhaustive path verification.
 * State observation is distinct from AST syntax, which cannot by itself prove
 * that a branch or inherited modifier was executed.
 */
export class ScientificNativeBehavioralEvidenceCoverageEngine {
    evaluate(b:Bundle):NativeBehavioralCoverageResult {
        const spec:NativeBehavioralEvaluationSpecification|undefined=
            b.nativeStudy?.specification?.specifications?.[0];
        const fail=(reason:string):NativeBehavioralCoverageResult=>({
            schemaVersion:"OECL_NATIVE_AST_BEHAVIORAL_COVERAGE_V1",
            hypothesisId:spec?.hypothesisId??null,specificationId:spec?.specificationId??null,
            observations:[],statistics:{total:0,scopedObserved:0,partial:0,missing:0},
            allQuestionsResolved:false,sourceCoverageComplete:false,
            status:"BLOCKED_EVIDENCE",candidateAdmission:"NOT_ADMITTED",
            finalScientificResult:"INCONCLUSIVE",errors:[reason]
        });
        if(!b.bridge?.matched||b.bridge.status!=="SCOPED_OBSERVATION_CONSISTENT"||
           b.bridge.candidateAdmission!=="NOT_ADMITTED"||
           b.bridge.finalScientificResult!=="INCONCLUSIVE"||
           b.bridge.nativeDiscoveredCandidateCount!==0||
           b.nativeStudy?.schemaVersion!=="OECL_NATIVE_AST_BEHAVIORAL_STUDY_V1"||
           b.nativeStudy.nativeCandidatesGenerated!==0||
           b.nativeStudy.admission!=="NOT_ADMITTED"||
           b.nativeStudy.finalScientificResult!=="INCONCLUSIVE"||
           b.nativeStudy.specification?.specifications?.length!==1||
           b.nativeStudy.specification.errors?.length!==0||
           !spec||spec.status!=="INSUFFICIENT_EVIDENCE"||
           spec.candidateAdmission!=="NOT_ADMITTED"||spec.nativeCandidateId!==null||
           b.bridge.nativeSourceSpecification?.specificationId!==spec.specificationId||
           b.bridge.nativeSourceSpecification.status!==spec.status||
           b.bridge.nativeSourceSpecification.questionCount!==10||
           spec.questions?.length!==10||
           new Set(spec.questions.map(q=>q.questionId)).size!==10)
            return fail("SOURCE_DISCOVERY_SPECIFICATION_NOT_INCOMPLETE_AND_BOUND");
        const origin=b.nativeStudy.discovery?.hypotheses?.[0];
        if(origin?.hypothesisId!==spec.hypothesisId||
           origin.participants?.length!==2||
           origin.participants[0]?.assetClass!=="CLAIM"||
           origin.participants[1]?.assetClass!=="FUNGIBLE"||
           b.bridge.hypothesisId!==spec.hypothesisId||
           b.bridge.sourceRoles?.length!==2||
           b.bridge.sourceRoles[0].sourceId!==origin.participants[0].sourceId||
           b.bridge.sourceRoles[1].sourceId!==origin.participants[1].sourceId)
            return fail("PARTICIPANT_ROLE_MAPPING_NOT_SUPPORTED");
        for(const key of ["nativeStudy","evm","witness","native","rollback","recognized"] as const){
            if(typeof b.raw?.[key]!=="string")return fail("MISSING_RAW_EVIDENCE_BYTES");
            try {
                if(!equals(JSON.parse(b.raw[key]),b[key]))
                    return fail("ARTIFACT_CONTENT_DIFFERS_FROM_SOURCE_BYTES");
            } catch {return fail("INVALID_ARTIFACT_JSON_BYTES");}
        }
        const digests=[
            ["nativeStudy","nativeStudy"],["evm","evm"],["witness","witness"],
            ["native","native"],["recognized","recognized"]
        ] as const;
        if(digests.some(([key,prop])=>typeof b.raw?.[key]!=="string"||
           b.bridge.artifactHashes?.[prop]!==sha(b.raw[key])))
            return fail("SOURCE_OR_EVM_ARTIFACT_BYTES_CHANGED");
        if(b.recognized?.sourceArtifacts?.[3]?.sha256!==sha(b.raw.rollback)||
           b.rollbackValidated?.sourceReportSha256!==sha(b.raw.rollback)||
           b.rollbackValidated?.counts?.cases!==4||
           b.rollbackValidated?.counts?.revertedReceipts!==4||
           b.rollbackValidated?.allObservedStatesUnchanged!==true||
           b.rollback?.schemaVersion!=="OECL_PINNED_FAILURE_EXPERIMENTS_V1"||
           b.rollback.chainId!==31337||
           !Array.isArray(b.rollback.cases)||b.rollback.cases.length!==4||
           b.rollback.cases.some((c:any)=>!c.unchanged||
              !equals(c.measuredStateBefore,c.measuredStateAfter)||
              c.revertedReceiptStatus!==0||!tx(c.attemptedTransactionHash)))
            return fail("ROLLBACK_EXPERIMENTS_NOT_SOURCE_BOUND_OR_INDEPENDENTLY_VALIDATED");
        if(b.rollbackValidated.sourceRevisionA!==b.bridge.sourceRoles[0].revision||
           b.rollbackValidated.sourceRevisionB!==b.bridge.sourceRoles[1].revision||
           b.rollback.cases.some((c:any)=>
              c.sourceProvenance?.participantA!==
                b.bridge.sourceRoles[0].sourceId+"@"+b.bridge.sourceRoles[0].revision||
              c.sourceProvenance?.participantB!==
                b.bridge.sourceRoles[1].sourceId+"@"+b.bridge.sourceRoles[1].revision))
            return fail("ROLLBACK_CASE_SOURCE_REVISIONS_NOT_BOUND");
        const receipt=b.evm?.observations;
        const nativeConstraints=b.native?.constraints;
        const nativeObservations=b.native?.observations;
        if(!receipt||!tx(b.evm?.transactions?.jointRedemption)||
           !Array.isArray(nativeConstraints)||!Array.isArray(nativeObservations)||
           nativeConstraints.length!==3||nativeObservations.length!==3||
           b.native.result?.statistics?.preserved!==3||
           b.native.result?.scientificPolarity!=="SUPPORT"||
           b.native.finalScientificResult!=="INCONCLUSIVE"||
           b.witness?.scientificPolarity!=="INCONCLUSIVE"||
           b.witness?.sourceTransactions?.joint!==b.evm.transactions.jointRedemption)
            return fail("NATIVE_LOCAL_WITNESS_NOT_AVAILABLE");
        const cases=new Map<string,any>(b.rollback.cases.map((c:any)=>[c.experimentId,c]));
        if(cases.size!==4||!["REVERT-NONOWNER","REVERT-NFT-APPROVAL",
           "REVERT-ERC20-APPROVAL","REVERT-ERC20-BALANCE"].every(id=>cases.has(id)))
            return fail("MISSING_MANDATORY_FAILURE_CLASS");
        const local=(left:string,right:string,side:"A"|"B")=>
            nativeConstraints.some((c:any)=>c.participantSide===side&&
                c.behavioralPredicate?.leftMetric===left&&
                c.behavioralPredicate?.rightMetric===right&&
                nativeObservations.some((o:any)=>o.constraintId===c.constraintId&&
                   o.verdict==="PRESERVED"&&o.transactionHash===b.evm.transactions.jointRedemption));
        const solvency=local("afterWei","remainingObligationWei","A")&&
            uint(receipt.nftBackingAfter)&&uint(receipt.nftObligationAfter)&&
            BigInt(receipt.nftBackingAfter)>=BigInt(receipt.nftObligationAfter);
        const supply=local("afterUnits","beforeUnits","B")&&
            uint(receipt.erc20SupplyBefore)&&uint(receipt.erc20SupplyAfter)&&
            uint(receipt.supplyDecrease)&&BigInt(receipt.supplyDecrease)>0n&&
            BigInt(receipt.erc20SupplyBefore)-BigInt(receipt.erc20SupplyAfter)===
                BigInt(receipt.supplyDecrease);
        const joint=receipt.sameTransactionContainsBothBurns===true&&
            Number.isSafeInteger(receipt.nftBurnLogIndex)&&
            Number.isSafeInteger(receipt.erc20BurnLogIndex)&&
            receipt.nftBurnLogIndex!==receipt.erc20BurnLogIndex&&
            b.recognized.property?.witnessTransaction===b.evm.transactions.jointRedemption;
        const rollback=cases.size===4&&b.rollbackValidated.counts.revertedReceipts===4;
        const ref=(name:string)=>"SHA256:"+sha(name==="rollback"?b.raw.rollback:
            name==="native"?b.raw.native:
            name==="witness"?b.raw.witness:
            name==="recognized"?b.raw.recognized:b.raw.evm);
        const scenarios:Record<string,{
            supported:boolean;partial:boolean;refs:string[];scope:string;missing:string[]
        }>={
            "A:AUTHORIZATION":{supported:rollback&&!!cases.get("REVERT-NONOWNER"),
                partial:true,refs:[ref("rollback")],
                scope:"Local unauthorized owner experiment reverts with identical measured state",
                missing:["Not a general authorization proof across all execution paths"]},
            "A:AVAILABILITY":{supported:solvency,partial:true,refs:[ref("native"),ref("evm")],
                scope:"Backing >= remaining NFT liabilities measured after joint redemption",
                missing:["No exhaustive solvency proof for every reachable NFT state"]},
            "A:STATE_CONSISTENCY":{supported:false,partial:joint&&solvency,
                refs:[ref("evm"),ref("witness")],
                scope:"AST internal burn edge plus local successful receipt (indirect)",
                missing:["No independent internal-call execution trace across modifiers and branches"]},
            "A:RESOURCE_DECREASE":{supported:false,partial:joint&&
                uint(receipt.ethRedeemed)&&BigInt(receipt.ethRedeemed)>0n,
                refs:[ref("evm"),ref("witness")],
                scope:"ETH redemption and final NFT liabilities measured",
                missing:["NFT liability amount before burn absent from primary success receipt"]},
            "B:AUTHORIZATION":{supported:false,
                partial:rollback&&!!cases.get("REVERT-ERC20-APPROVAL"),
                refs:[ref("rollback")],
                scope:"Coordinator allowance failure reverted, not direct proof of inherited burn caller authority",
                missing:["No isolated ERC20Burnable authorization-path execution trace"]},
            "B:AVAILABILITY":{supported:rollback&&supply&&
                !!cases.get("REVERT-ERC20-BALANCE"),partial:true,
                refs:[ref("rollback"),ref("evm")],
                scope:"Insufficient fungible balance rollback and positive supply decrease measured locally",
                missing:["Not proof for every ERC20 balance or allowance state"]},
            "B:STATE_CONSISTENCY":{supported:supply,partial:true,
                refs:[ref("native"),ref("evm")],
                scope:"Native numeric supply invariant preserved in pinned local transaction",
                missing:["No complete analysis of all inherited state mutation entrypoints"]},
            "B:RESOURCE_DECREASE":{supported:supply,partial:true,
                refs:[ref("evm"),ref("native")],
                scope:"ERC20 supply-before minus supply-after equals observed burned units",
                missing:["Not a proof of monotonicity for all future transactions"]},
            "JOINT:ATOMIC_EXECUTION":{supported:joint&&solvency&&supply,partial:true,
                refs:[ref("recognized"),ref("evm")],
                scope:"Distinct NFT and ERC20 burn logs in one pinned Hardhat transaction",
                missing:["No independently replayed public-chain receipt or general coordinator feasibility proof"]},
            "JOINT:JOINT_ROLLBACK":{supported:rollback,partial:true,
                refs:[ref("rollback")],
                scope:"Four scoped reverted local transactions with before/after state equality",
                missing:["No independent replay of all attempted transactions or exhaustive interleavings"]}
        };
        const observations:NativeBehavioralCoverageObservation[]=[];
        for(const q of spec.questions){
            const key=q.participantSide+":"+q.category,scenario=scenarios[key];
            if(!scenario||q.status!=="NOT_EVALUATED"||!q.sourceFactIds?.length||
               !q.sourceFactIds.every(id=>origin.evidence.some((f:any)=>f.factId===id)))
                return fail("QUESTION_WITHOUT_SOURCE_FACT_OR_SUPPORTED_SEMANTICS");
            const status:NativeCoverageStatus=scenario.supported?"SCOPED_OBSERVED":
                scenario.partial?"PARTIAL_EVIDENCE":"NO_EVIDENCE";
            observations.push({
                questionId:q.questionId,participantSide:q.participantSide,
                category:q.category,sourceFactIds:q.sourceFactIds,
                status,evidenceRefs:scenario.refs,scope:scenario.scope,
                missing:scenario.missing
            });
        }
        const statistics={total:observations.length,
            scopedObserved:observations.filter(o=>o.status==="SCOPED_OBSERVED").length,
            partial:observations.filter(o=>o.status==="PARTIAL_EVIDENCE").length,
            missing:observations.filter(o=>o.status==="NO_EVIDENCE").length};
        return {schemaVersion:"OECL_NATIVE_AST_BEHAVIORAL_COVERAGE_V1",
            hypothesisId:spec.hypothesisId,specificationId:spec.specificationId,
            observations,statistics,allQuestionsResolved:false,sourceCoverageComplete:false,
            status:"PARTIAL_OBSERVATION",candidateAdmission:"NOT_ADMITTED",
            finalScientificResult:"INCONCLUSIVE",errors:[]};
    }
}
