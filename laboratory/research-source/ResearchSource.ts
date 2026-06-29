import { ResearchSourceType } from "./ResearchSourceType.js";

export interface ResearchSource {

    /**
     * Unique research source identifier.
     */
    sourceId: string;

    /**
     * Human-readable title.
     */
    title: string;

    /**
     * Type of research source.
     */
    type: ResearchSourceType;

    /**
     * Original author or organization.
     */
    author?: string;

    /**
     * Publication date if available.
     */
    publishedAt?: string;

    /**
     * Version identifier if applicable.
     */
    version?: string;

    /**
     * Original source location.
     * May be a DOI, URL, repository, etc.
     */
    location?: string;

    /**
     * Short description.
     */
    description?: string;

    /**
     * Keywords extracted or assigned.
     */
    keywords: string[];

    /**
     * Protocols explicitly mentioned.
     */
    referencedProtocols: string[];

    /**
     * Capabilities explicitly mentioned.
     */
    referencedCapabilities: string[];

    /**
     * Indicates whether this source has already been ingested.
     */
    ingested: boolean;

    /**
     * Timestamp of ingestion.
     */
    ingestedAt?: string;

}