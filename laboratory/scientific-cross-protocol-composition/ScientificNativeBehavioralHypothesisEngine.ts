import { createHash } from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { analyze } = require("../scientific-behavioral-complementarity/ScientificGraphBoundBehavioralDiscovery.cjs") as {
    analyze: (graph: unknown) => {
        errors: string[];
        hypotheses: SourceHypothesis[];
        participants: SourceParticipant[];
    };
};

type AssetClass = "CLAIM" | "FUNGIBLE" | "NON_FUNGIBLE" | "ACCOUNT_BALANCE" | "RESOURCE";
type Fact = {
    factId: string;
    sourceId: string;
    sourceRevision: string;
    sourceSha256: string;
    attributedParticipantId?: string;
    inheritanceAnchorFactId?: string;
};
type SourceParticipant = {
    sourceId: string;
    revision: string;
    assetClass: AssetClass;
    provenance: Fact[];
    effects: { kind: string; assetClass: string; sourceFactIds: string[] }[];
    restrictions: { kind: string; sourceFactIds: string[] }[];
};
type SourceHypothesis = {
    hypothesisId: string;
    relation: string;
    participants: { sourceId: string; revision: string; assetClass: AssetClass }[];
    sourceEvidence: Fact[];
    status: string;
    admission: string;
    scientificPolarity: string;
};
export interface NativeBehavioralHypothesis {
    hypothesisId: string;
    mechanism: "AST_DERIVED_BOUNDED_RESOURCE_COMPLEMENTARITY";
    relation: "POTENTIAL_ATOMIC_COUPLED_RESOURCE_DECREASE";
    participants: {
        sourceId: string; sourceRevision: string; assetClass: AssetClass;
        sourceSha256: string;
    }[];
    evidence: Fact[];
    state: "SOURCE_ONLY_UNEVALUATED";
    candidateAdmission: "NOT_ADMITTED";
    scientificPolarity: "INCONCLUSIVE";
}
export interface NativeBehavioralDiscoveryResult {
    schemaVersion: "OECL_NATIVE_AST_BEHAVIORAL_DISCOVERY_V1";
    hypotheses: NativeBehavioralHypothesis[];
    errors: string[];
    sourceGraphSha256: string;
    candidateCount: 0;
    scientificPolarity: "INCONCLUSIVE";
}
const sha = (data: string) => createHash("sha256").update(data).digest("hex");
const validHash = (x: unknown) => typeof x === "string" && /^[0-9a-f]{64}$/i.test(x);
const match = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Called by native CrossProtocolCompositionEngine. Its output is a separate
 * scientific hypothesis: NOT a ScientificCompositionCandidate. No candidate
 * is manufactured from an AST label, an ERC name, or an EVM success report.
 */
export class ScientificNativeBehavioralHypothesisEngine {
    discover(input: { graph: any; sourceHypothesisArtifact: any; rawGraph: string }): NativeBehavioralDiscoveryResult {
        const errors: string[] = [];
        const graphSha = sha(input.rawGraph || "");
        const artifact = input.sourceHypothesisArtifact;
        if (!input.graph || artifact?.schemaVersion !== "OECL_AST_BOUND_BEHAVIORAL_SOURCE_DISCOVERY_V1" ||
            artifact.inputKind !== "PINNED_COMPILER_RESOLVED_AST_ONLY" ||
            artifact.graphEvidence?.sha256 !== graphSha ||
            artifact.admission !== "NOT_ADMITTED" || artifact.scientificPolarity !== "INCONCLUSIVE" ||
            artifact.executionEvidenceUsed !== false ||
            input.graph.schemaVersion !== "OECL_SOLIDITY_COMPILER_AST_GRAPH_V1" ||
            input.graph.candidateAdmission !== "NOT_ADMITTED" ||
            input.graph.scientificPolarity !== "INCONCLUSIVE") {
            errors.push("SOURCE_ONLY_AST_ARTIFACT_OR_GRAPH_IDENTITY_INVALID");
        }
        let source: ReturnType<typeof analyze> = {errors: [], hypotheses: [], participants: []};
        if (!errors.length) {
            try { source = analyze(input.graph); }
            catch {errors.push("AST_DISCOVERY_RECOMPUTATION_FAILED");}
        }
        if (!errors.length && (source.errors.length || source.hypotheses.length !== 1 ||
            !match(source.hypotheses, artifact.hypotheses) ||
            !match(source.participants, artifact.normalizedParticipants))) {
            errors.push("AST_HYPOTHESIS_NOT_REPRODUCIBLE_FROM_SOURCE_GRAPH");
        }
        if (!errors.length) {
            const sourceEntries: {unit: string; sha256: string}[] = input.graph.sources;
            const primary: {repository: string; revision: string; sourceSha256: string}[] =
                input.graph.provenance?.primary ?? [];
            if (primary.length !== 2 || new Set(primary.map(p=>p.repository)).size !== 2 ||
                source.participants.length !== 2 ||
                new Set(source.participants.map(p=>p.assetClass)).size !== 2)
                errors.push("MISSING_INDEPENDENT_PROTOCOL_SOURCE_IDENTITIES");
            const knownNodes = [
                ...input.graph.contracts, ...input.graph.edges, ...input.graph.guards,
                ...input.graph.writes, ...input.graph.externalCalls
            ];
            for (const participant of source.participants) {
                if (!primary.some(p=>p.repository===participant.sourceId &&
                    p.revision===participant.revision && validHash(p.sourceSha256)))
                    errors.push("PROTOCOL_REVISION_NOT_ATTRIBUTED_TO_PINNED_SOURCE");
                if (new Set(participant.provenance.map(f=>f.factId)).size !== participant.provenance.length)
                    errors.push("DUPLICATE_NATIVE_FACT_PROVENANCE");
                for (const fact of participant.provenance) {
                    const tokens = /^AST:(.*):([^:]+):(\d+)$/.exec(fact.factId);
                    if (!tokens || !validHash(fact.sourceSha256) ||
                        sourceEntries.filter(x=>x.unit===tokens[1] && x.sha256===fact.sourceSha256).length !== 1 ||
                        !knownNodes.some((x: {location?: {unit?:string; start?:number}})=>
                            x.location?.unit===tokens[1] && x.location.start===Number(tokens[3])) ||
                        (fact.sourceId!==participant.sourceId &&
                          (fact.attributedParticipantId!==participant.sourceId ||
                           !participant.provenance.some(p=>p.factId===fact.inheritanceAnchorFactId &&
                             p.sourceId===participant.sourceId)))) {
                        errors.push("AST_SOURCE_FACT_WITHOUT_VERIFIABLE_COMPILER_LOCATION");
                    }
                }
            }
        }
        const hypotheses: NativeBehavioralHypothesis[] = [];
        if (!errors.length) {
            const proposal=source.hypotheses[0];
            if (proposal.relation!=="POTENTIAL_ATOMIC_COUPLED_RESOURCE_DECREASE" ||
                proposal.status!=="UNEVALUATED_SOURCE_HYPOTHESIS" ||
                proposal.admission!=="NOT_ADMITTED" ||
                proposal.scientificPolarity!=="INCONCLUSIVE")
                errors.push("AST_RELATION_NOT_AN_UNEVALUATED_SOURCE_HYPOTHESIS");
            else {
                hypotheses.push({
                    hypothesisId:proposal.hypothesisId,
                    mechanism:"AST_DERIVED_BOUNDED_RESOURCE_COMPLEMENTARITY",
                    relation:"POTENTIAL_ATOMIC_COUPLED_RESOURCE_DECREASE",
                    participants:proposal.participants.map(p=>({
                        sourceId:p.sourceId,sourceRevision:p.revision,assetClass:p.assetClass,
                        sourceSha256:input.graph.provenance.primary.find(
                            (x:{repository:string})=>x.repository===p.sourceId).sourceSha256
                    })),
                    evidence:proposal.sourceEvidence,
                    state:"SOURCE_ONLY_UNEVALUATED",
                    candidateAdmission:"NOT_ADMITTED",
                    scientificPolarity:"INCONCLUSIVE"
                });
            }
        }
        return {schemaVersion:"OECL_NATIVE_AST_BEHAVIORAL_DISCOVERY_V1",
            hypotheses,errors,sourceGraphSha256:graphSha,
            candidateCount:0,scientificPolarity:"INCONCLUSIVE"};
    }
}
