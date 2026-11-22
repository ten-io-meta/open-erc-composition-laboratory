/**
 * A burn symbol is a lexical capability, not sufficient proof that the same
 * conserved quantity is destroyed. This comparative gate makes the unit of
 * destruction explicit before any recurrent concept may be proposed.
 *
 * Classification is derived from source-anchored evidence supplied by a
 * separate, exact-version source and transaction verifier; unverified input
 * identities must not be accepted for candidate discovery.
 */
export type ScientificBurnAssetUnit = "ERC721_TOKEN_ID" | "ERC20_FUNGIBLE_AMOUNT";

export interface ScientificSourceBoundBurnMechanism {
    participantId: string;
    repository: string;
    sourceRevision: string;
    inheritedDependency?: { package: string; version: string; filePath: string; sourceSha256: string };
    burnDeclaration: { sourceId: string; sourceRevision: string; containerSymbol: string; declarationFactId: string; inheritanceEdgeIds: string[]; depth: number };
    assetUnit: ScientificBurnAssetUnit;
    sourceFactIds: string[];
    numericalWitnesses: string[];
    transactionHash: string;
}

export interface ScientificBurnSemanticsComparison {
    status: "SCOPED_SHARED_IRREVERSIBLE_DESTRUCTION" | "INSUFFICIENT_EVIDENCE";
    operationNameOverlap: boolean;
    equivalentAssetUnit: boolean;
    equivalentRedemptionSemantics: boolean;
    properties: string[];
    limitations: string[];
    participantSources: { id: string; revision: string; factIds: string[] }[];
    scientificPolarity: "INCONCLUSIVE";
}

export class ScientificBurnSemanticsComparisonEngine {
    compare(a:ScientificSourceBoundBurnMechanism,b:ScientificSourceBoundBurnMechanism):ScientificBurnSemanticsComparison {
        const valid=(x:ScientificSourceBoundBurnMechanism):boolean=>
            !!x.participantId.trim() && !!x.repository.trim() &&
            /^[a-f0-9]{40}$/i.test(x.sourceRevision) &&
            x.sourceFactIds.length>0 && x.numericalWitnesses.length>0 &&
            new Set(x.sourceFactIds).size===x.sourceFactIds.length &&
            x.sourceFactIds.every(id=>id.trim().length>0) &&
            x.numericalWitnesses.every(id=>id.trim().length>0) &&
            x.burnDeclaration.declarationFactId.trim().length>0 &&
            x.burnDeclaration.containerSymbol.trim().length>0 &&
            x.burnDeclaration.sourceId.trim().length>0 &&
            x.burnDeclaration.depth===x.burnDeclaration.inheritanceEdgeIds.length &&
            Number.isSafeInteger(x.burnDeclaration.depth) && x.burnDeclaration.depth>=0 &&
            (x.burnDeclaration.depth>0 || x.burnDeclaration.sourceRevision.toLowerCase()===x.sourceRevision.toLowerCase()) &&
            /^0x[a-f0-9]{64}$/i.test(x.transactionHash) &&
            (x.assetUnit==="ERC721_TOKEN_ID"||x.assetUnit==="ERC20_FUNGIBLE_AMOUNT") &&
            (x.burnDeclaration.depth===0 ||
                !!x.inheritedDependency && x.inheritedDependency.sourceSha256.match(/^[a-f0-9]{64}$/i)!==null);
        const complete=valid(a)&&valid(b) &&
            a.participantId!==b.participantId &&
            a.transactionHash.toLowerCase()===b.transactionHash.toLowerCase();
        const participantSources=[a,b].map(x=>({id:x.participantId,revision:x.sourceRevision,factIds:[...x.sourceFactIds]}));
        const limitations=[
            "Shared function name does not establish equal burn semantics or token units.",
            "This compares one source-bound EVM experiment; it is not a discovered composition candidate.",
            "Reverted-path atomicity and full invariant completeness require separate scientific checks."
        ];
        if(!complete) return {
            status:"INSUFFICIENT_EVIDENCE",operationNameOverlap:false,
            equivalentAssetUnit:false,equivalentRedemptionSemantics:false,
            properties:[],limitations,participantSources,scientificPolarity:"INCONCLUSIVE"
        };
        const equivalentAssetUnit=a.assetUnit===b.assetUnit;
        return {
            status:"SCOPED_SHARED_IRREVERSIBLE_DESTRUCTION",
            operationNameOverlap:true,
            equivalentAssetUnit,
            equivalentRedemptionSemantics:false,
            properties:[
                "Both burns occurred in one observed local EVM transaction.",
                "Both operations destroy a participant-specific on-chain asset.",
                "Unit identity and economically redeemable value are independent dimensions."
            ],
            limitations,participantSources,scientificPolarity:"INCONCLUSIVE"
        };
    }
}
