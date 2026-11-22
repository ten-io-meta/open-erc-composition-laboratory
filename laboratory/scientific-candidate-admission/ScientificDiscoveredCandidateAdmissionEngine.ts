import type { ScientificCrossProtocolCompositionResult } from "../scientific-cross-protocol-composition/ScientificCrossProtocolCompositionResult.js";
import type { ScientificCompositionEvaluationSpecificationResult } from "../scientific-composition-evaluation-specification/ScientificCompositionEvaluationSpecificationResult.js";
import type { ScientificCompositionExecutionRequirement } from "../scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";

export interface ScientificDiscoveredCandidateAdmission {
    candidateId: string;
    status: "ELIGIBLE_FOR_REVIEW" | "BLOCKED";
    errors: string[];
    coverage: {
        declaredConstraints: number;
        participantAConstraints: number;
        participantBConstraints: number;
        unresolvedGuards: number;
    };
}

/**
 * Candidate discovery eligibility is separate from proof of compatibility.
 * The only accepted source of identity is the actual discovery result and
 * the matching READY specification. Never infer a discovered candidate
 * from a successful transaction or hand-authored identifier.
 *
 * ELIGIBLE_FOR_REVIEW is NOT SUPPORTS and cannot certify evidence validity.
 */
export class ScientificDiscoveredCandidateAdmissionEngine {
    assess(
        candidateId: string,
        discovery: ScientificCrossProtocolCompositionResult,
        specifications: ScientificCompositionEvaluationSpecificationResult,
        requirement: ScientificCompositionExecutionRequirement
    ): ScientificDiscoveredCandidateAdmission {
        const errors: string[] = [];
        if (discovery.errors.length) errors.push("Discovery contains upstream errors.");
        if (specifications.errors.length) errors.push("Evaluation specifications contain upstream errors.");
        const matches = discovery.candidates.filter(x => x.candidateId === candidateId);
        if (matches.length !== 1) errors.push("Exactly one genuinely discovered candidate is required.");
        const candidate = matches[0];
        const specMatches = specifications.specifications.filter(x => x.candidateId === candidateId);
        if (specMatches.length !== 1) errors.push("Exactly one evaluation specification is required.");
        const spec = specMatches[0];
        if (!candidate || !spec) return this.result(candidateId, requirement, errors);
        if (candidate.evaluationStatus !== "UNEVALUATED") errors.push("Candidate discovery status must be UNEVALUATED.");
        if (!candidate.provenance.length) errors.push("Independent discovery provenance is required.");
        if (!candidate.provenance.every(x => x.sourceId.trim() && x.evidenceId.trim() && !!x.sourceRevision))
            errors.push("Every discovery evidence item must carry a source ID, revision and evidence ID.");
        if (new Set(candidate.provenance.map(x => x.evidenceId)).size !== candidate.provenance.length)
            errors.push("Duplicate discovery evidence identities.");
        const kinds = new Set(["EXPLICIT_EXTENSION_FOR", "SHARED_RECURRENT_CONCEPT", "SHARED_PROTOCOL_FOUNDATION"]);
        if (!kinds.has(candidate.mechanism)) errors.push("Unsupported discovery mechanism.");
        if (spec.status !== "READY" || !spec.scientificCriteria)
            errors.push("Scientific specification is not READY.");
        if (!spec.candidateSnapshot || JSON.stringify(spec.candidateSnapshot) !== JSON.stringify(candidate))
            errors.push("Specification candidate snapshot does not match discovery.");
        if (spec.mechanism !== candidate.mechanism || spec.specificationId !== requirement.evaluationSpecificationId)
            errors.push("Specification mechanism or identifier mismatch.");
        if (requirement.candidate.candidateId !== candidateId ||
            JSON.stringify(requirement.candidate) !== JSON.stringify(candidate))
            errors.push("Execution requirement candidate does not match discovery.");
        if (candidate.participantA.kind !== "PROTOCOL" || candidate.participantB.kind !== "PROTOCOL" ||
            candidate.participantA.id === candidate.participantB.id)
            errors.push("Two different discovered protocol participants are required.");
        if (requirement.participantSources.length !== 2)
            errors.push("Exactly two pinned participant sources are required.");
        for (const side of ["A", "B"] as const) {
            const expected = side === "A" ? candidate.participantA : candidate.participantB;
            const sources = requirement.participantSources.filter(x => x.participantSide === side);
            if (sources.length !== 1 || sources[0].participantId !== expected.id ||
                sources[0].participantKind !== expected.kind || !sources[0].repository.trim() ||
                !/^[a-f0-9]{40}$/i.test(sources[0].sourceRevision))
                errors.push("Missing or incorrect pinned source for participant "+side+".");
        }
        if (requirement.unresolvedGuardFactIds.length)
            errors.push("Unresolved source guard facts remain.");
        const ids = requirement.constraints.map(x => x.constraintId);
        const idsA = requirement.participantAConstraintIds;
        const idsB = requirement.participantBConstraintIds;
        const idsSpec = spec.constraints.map(x => x.constraintId);
        if (!ids.length || ids.length !== new Set(ids).size ||
            ids.length !== idsSpec.length || ids.some(x => !idsSpec.includes(x)))
            errors.push("Constraint IDs do not match exact READY specification.");
        if (!idsA.length || !idsB.length ||
            idsA.length + idsB.length !== ids.length ||
            new Set([...idsA,...idsB]).size !== ids.length ||
            [...idsA,...idsB].some(x => !ids.includes(x)))
            errors.push("Incomplete A and B constraint coverage.");
        if (spec.participantAConstraintIds.length !== idsA.length ||
            spec.participantBConstraintIds.length !== idsB.length ||
            [...idsA].sort().join("|") !== [...spec.participantAConstraintIds].sort().join("|") ||
            [...idsB].sort().join("|") !== [...spec.participantBConstraintIds].sort().join("|"))
            errors.push("Participant constraint IDs differ from specification.");
        if (spec.unresolvedGuardFactIds.length)
            errors.push("READY specification still has unresolved source guards.");
        for (const constraint of requirement.constraints) {
            const side = constraint.participantSide;
            const source = requirement.participantSources.find(x=>x.participantSide===side);
            const specConstraint = spec.constraints.find(x=>x.constraintId===constraint.constraintId);
            if (!source || !specConstraint ||
                JSON.stringify(constraint) !== JSON.stringify(specConstraint) ||
                constraint.candidateId !== candidateId ||
                constraint.participantId !== source.participantId ||
                constraint.sourceId !== source.sourceId ||
                constraint.sourceRevision?.toLowerCase() !== source.sourceRevision.toLowerCase() ||
                !(side==="A"?idsA:idsB).includes(constraint.constraintId))
                errors.push("Unattributed or modified constraint "+constraint.constraintId+".");
        }
        // Source revisions in discovery provenance may refer to documentary
        // inputs, not to deployed implementation commits. Do NOT falsely
        // demand they equal checkout revisions; this binding is reviewed later.
        return this.result(candidateId, requirement, errors);
    }

    private result(candidateId: string, requirement: ScientificCompositionExecutionRequirement, errors: string[]): ScientificDiscoveredCandidateAdmission {
        return {
            candidateId,
            status: errors.length === 0 ? "ELIGIBLE_FOR_REVIEW" : "BLOCKED",
            errors,
            coverage: {
                declaredConstraints:requirement.constraints.length,
                participantAConstraints:requirement.participantAConstraintIds.length,
                participantBConstraints:requirement.participantBConstraintIds.length,
                unresolvedGuards:requirement.unresolvedGuardFactIds.length
            }
        };
    }
}
