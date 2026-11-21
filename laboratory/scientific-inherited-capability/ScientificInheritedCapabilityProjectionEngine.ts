import type { ScientificSourceFact } from "../scientific-source-fact/ScientificSourceFact.js";
import type { ScientificSolidityInheritanceGraphResult } from "../scientific-solidity-inheritance/ScientificSolidityInheritanceGraphResult.js";

/**
 * Structural capability provenance, NOT a scientific semantic relationship.
 * Each reported declaration is reached through exact source-fact inheritance
 * edges. No capability is synthesized from a function name alone.
 */
export interface ScientificInheritedCapability {
    rootDeclarationFactId: string;
    declarationFactId: string;
    sourceId: string;
    sourceRevision?: string;
    containerSymbol: string;
    symbol: string;
    sourceLocator: ScientificSourceFact["locator"];
    sourceRawText: string;
    inheritanceEdgeIds: string[];
    inheritanceContainers: string[];
    depth: number;
}

export interface ScientificInheritedCapabilityProjection {
    status: "RESOLVED" | "INCOMPLETE";
    capabilities: ScientificInheritedCapability[];
    unresolved: string[];
    errors: string[];
}

export class ScientificInheritedCapabilityProjectionEngine {
    project(input: {
        graph: ScientificSolidityInheritanceGraphResult;
        facts: ScientificSourceFact[];
        rootDeclarationFactId: string;
        /** Optional restriction; without it, all inherited function names are observed. */
        symbols?: string[];
    }): ScientificInheritedCapabilityProjection {
        const errors = [...input.graph.errors];
        const factsById = new Map(input.facts.map(f => [f.factId, f]));
        if (factsById.size !== input.facts.length) errors.push("Duplicate fact identity.");
        const containers = input.graph.containers;
        const root = containers.find(x => x.declarationFactId === input.rootDeclarationFactId);
        if (!root) errors.push("Root contract declaration is absent from inheritance graph.");
        const unresolved = new Set<string>();
        const projected: ScientificInheritedCapability[] = [];
        if (errors.length || !root) return {status:"INCOMPLETE",capabilities:[],unresolved:[],errors};

        const bySymbol = new Map<string,typeof containers>();
        for (const c of containers) {
            const previous = bySymbol.get(c.containerSymbol) ?? [];
            bySymbol.set(c.containerSymbol, [...previous,c]);
        }
        const allowed = input.symbols ? new Set(input.symbols) : undefined;
        const visited = new Set<string>();
        const walk = (declarationFactId:string, trail:string[], edgeIds:string[], depth:number):void => {
            if (visited.has(declarationFactId)) return;
            visited.add(declarationFactId);
            const node = containers.find(x => x.declarationFactId === declarationFactId);
            if (!node) {unresolved.add("Missing graph node "+declarationFactId);return;}
            const declaration = factsById.get(node.declarationFactId);
            if (!declaration || declaration.sourceId !== node.sourceId ||
                declaration.sourceRevision !== node.sourceRevision)
                {unresolved.add("Declaration source lineage mismatch "+node.declarationFactId);return;}
            for (const fact of input.facts) {
                if (fact.kind !== "FUNCTION_DECLARATION" || !fact.symbol ||
                    (allowed && !allowed.has(fact.symbol)) ||
                    fact.sourceId !== node.sourceId ||
                    fact.sourceRevision !== node.sourceRevision ||
                    fact.observationId !== node.observationId ||
                    fact.containerSymbol !== node.containerSymbol) continue;
                projected.push({
                    rootDeclarationFactId:input.rootDeclarationFactId,
                    declarationFactId:fact.factId,sourceId:fact.sourceId,
                    sourceRevision:fact.sourceRevision,
                    containerSymbol:fact.containerSymbol,
                    symbol:fact.symbol,sourceLocator:fact.locator,sourceRawText:fact.rawText,
                    inheritanceEdgeIds:[...edgeIds],inheritanceContainers:[...trail],
                    depth
                });
            }
            const uncertain = input.graph.unresolvedInheritanceReferences.filter(x =>
                x.subjectDeclarationFactId === declarationFactId);
            for (const missing of uncertain) unresolved.add(
                "Unresolved inheritance "+node.containerSymbol+" -> "+missing.inheritedSymbol+
                " ("+missing.reason+")");
            for (const edge of input.graph.edges.filter(e=>e.subjectDeclarationFactId===declarationFactId)) {
                const objects=bySymbol.get(edge.inheritedSymbol) ?? [];
                if (objects.length!==1 || objects[0].declarationFactId!==edge.objectDeclarationFactId ||
                    objects[0].sourceId!==edge.objectSourceId ||
                    objects[0].sourceRevision!==edge.objectSourceRevision ||
                    edge.subjectSourceId!==node.sourceId ||
                    edge.subjectSourceRevision!==node.sourceRevision ||
                    edge.resolutionBasis!=="UNIQUE_DECLARATION_SYMBOL_IN_INPUT") {
                    unresolved.add("Ambiguous or inconsistent edge "+edge.inheritanceEdgeId);
                    continue;
                }
                if (trail.includes(edge.objectContainerSymbol)) {
                    unresolved.add("Inheritance cycle "+edge.inheritanceEdgeId);
                    continue;
                }
                walk(edge.objectDeclarationFactId,[...trail,edge.objectContainerSymbol],
                    [...edgeIds,edge.inheritanceEdgeId],depth+1);
            }
        };
        walk(root.declarationFactId,[root.containerSymbol],[],0);
        projected.sort((a,b)=>a.symbol.localeCompare(b.symbol) ||
            a.depth-b.depth || a.declarationFactId.localeCompare(b.declarationFactId));
        return {
            status:unresolved.size===0?"RESOLVED":"INCOMPLETE",
            capabilities:projected,
            unresolved:[...unresolved].sort(),
            errors
        };
    }
}
