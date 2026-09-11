import type {
    AdaptedResearchSource,
    ResearchSourceAdapter
} from "./ResearchSourceAdapter.js";

import { GitHubCompositionSignalExtractor } from "./GitHubCompositionSignalExtractor.js";

export class GitHubResearchAdapter
    implements ResearchSourceAdapter {

    supports(source: any): boolean {

        return source?.type === "GITHUB_REPOSITORY"
            || source?.type === "GITHUB"
            || source?.ingested === true;

    }

    adapt(source: any): AdaptedResearchSource {

        const signalExtractor = new GitHubCompositionSignalExtractor();

        const signals = signalExtractor.extract(source);

        const signalClaims = signals.map(signal =>
            `${signal.fromCapability} ${signal.relation} ${signal.toCapability}: ${signal.reason}`
        );

        return {

            sourceId: source.sourceId,

            protocols:
                source.protocols
                ?? source.referencedProtocols
                ?? [],

            capabilities:
                source.capabilities
                ?? source.referencedCapabilities
                ?? [],

            claims: [
                ...(source.claims ?? []),
                ...signalClaims
            ],

            compositionSignals: signals

        };

    }

}