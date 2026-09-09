import type {
    ScientificCandidateCompositionDossier
} from "./ScientificCandidateCompositionDossier.js";

import type {
    ScientificCandidateCompositionDossierSummary
} from "./ScientificCandidateCompositionDossierSummary.js";


export class ScientificCandidateCompositionDossierSummaryEngine {

    project(
        dossier:
            ScientificCandidateCompositionDossier
    ): ScientificCandidateCompositionDossierSummary {

        const trace =
            dossier.candidateTrace;

        const scoped =
            dossier.scopedCompatibility;

        return {
            dossierId:
                dossier.dossierId,

            candidateId:
                dossier.candidateId,

            candidateKind:
                trace.candidateKind,

            sourceParticipantId:
                trace.sourceParticipantId,

            targetParticipantId:
                trace.targetParticipantId,

            compatibilityPolarity:
                trace.compatibilityPolarity,

            knownBoundaries:
                trace.knownBoundaryIds.length,

            observedBoundaries:
                trace.observedBoundaryIds.length,

            unevaluatedBoundaries:
                trace.unevaluatedBoundaryIds.length,

            evidenceGaps:
                trace.gapIds.length,

            reasonCodes:
                [...trace.reasonCodes],

            scopedCompatibilityAvailable:
                scoped !== null,

            protocolBoundaryTotal:
                scoped?.relevanceStatistics.protocolBoundaryTotal ?? null,

            relevantBoundaries:
                scoped?.relevanceStatistics.relevant ?? null,

            outOfScopeBoundaries:
                scoped?.relevanceStatistics.outOfScope ?? null,

            unresolvedRelevance:
                scoped?.relevanceStatistics.unresolved ?? null,

            functionalConfigurationCount:
                dossier.functionalConfigurations.length,

            functionalConfigurationIds:
                dossier.functionalConfigurations.map(
                    configuration => configuration.configurationId
                ),

            runtimeCandidateIds:
                [
                    ...new Set(
                        dossier.functionalConfigurations.map(
                            configuration =>
                                configuration.runtimeCandidateId
                        )
                    )
                ].sort(),

            summaryAuthority:
                "DOSSIER_PROJECTION_ONLY",

            summaryStatus:
                "PROJECTED"
        };

    }

}
