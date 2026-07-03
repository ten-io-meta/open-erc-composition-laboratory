import type {
    AdaptedResearchSource,
    ResearchSourceAdapter
} from "./ResearchSourceAdapter.js";

import { GitHubCompositionSignalExtractor } from "./GitHubCompositionSignalExtractor.js";

export class GitHubResearchAdapter
    implements ResearchSourceAdapter {

    supports(source: any): boolean {

        return source.type === "GITHUB_REPOSITORY";

    }

    adapt(source: any): AdaptedResearchSource {

        const signalExtractor = new GitHubCompositionSignalExtractor();

        const signals = signalExtractor.extract(source);

        const signalClaims = signals.map(signal =>
            `${signal.fromCapability} ${signal.relation} ${signal.toCapability}: ${signal.reason}`
        );

        return {

            sourceId: source.sourceId,

            protocols: source.protocols ?? [],

            capabilities: source.capabilities ?? [],

            claims: [
                ...(source.claims ?? []),
                ...signalClaims
            ]

        };

    }

}