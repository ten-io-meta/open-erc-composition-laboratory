import type {
    AdaptedResearchSource,
    ResearchSourceAdapter
} from "./ResearchSourceAdapter.js";

export class GitHubResearchAdapter
    implements ResearchSourceAdapter {

    supports(source: any): boolean {

        return source.type === "GITHUB_REPOSITORY";

    }

    adapt(source: any): AdaptedResearchSource {

        return {

            sourceId: source.sourceId,

            protocols: source.protocols ?? [],

            capabilities: source.capabilities ?? [],

            claims: source.claims ?? []

        };

    }

}