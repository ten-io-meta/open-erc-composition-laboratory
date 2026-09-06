import type { ResearchKnowledge } from "../research-knowledge/ResearchKnowledge.js";
import type { KnowledgeEntry } from "../research-knowledge/KnowledgeEntry.js";

import type { ResearchMemory } from "./ResearchMemory.js";
import type { ResearchMemoryEvent } from "./ResearchMemoryEvent.js";
import type { ResearchMemoryResult } from "./ResearchMemoryResult.js";
import type { ResearchMemoryTimeline } from "./ResearchMemoryTimeline.js";

export class ResearchMemoryEngine {

    update(
        previous: ResearchMemory | null,
        knowledge: ResearchKnowledge,
        sourceId: string
    ): ResearchMemoryResult {

        try {
            const existingEvents =
                previous?.timelines.flatMap(timeline => timeline.events) ?? [];

            const newEvents = knowledge.entries
                .map((entry, index) => this.eventFromEntry(entry, sourceId, index))
                .filter(event => !this.alreadyExists(existingEvents, event));

            const allEvents = [
                ...existingEvents,
                ...newEvents
            ];

            const timelines = this.buildTimelines(allEvents);

            const statistics = this.statistics(timelines);

            return {
                generatedAt: new Date().toISOString(),
                memory: {
                    memoryId: "OECL-V2-RESEARCH-MEMORY",
                    generatedAt: new Date().toISOString(),
                    timelines,
                    statistics
                },
                errors: []
            };

        } catch (error) {
            return {
                generatedAt: new Date().toISOString(),
                memory: {
                    memoryId: "OECL-V2-RESEARCH-MEMORY",
                    generatedAt: new Date().toISOString(),
                    timelines: [],
                    statistics: {
                        events: 0,
                        timelines: 0,
                        sources: 0,
                        averageConfidence: 0,
                        supportedEvents: 0,
                        emergingEvents: 0,
                        rejectedEvents: 0
                    }
                },
                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown research memory error"
                ]
            };
        }
    }

    private eventFromEntry(
        entry: KnowledgeEntry,
        sourceId: string,
        index: number
    ): ResearchMemoryEvent {
        return {
            eventId: `MEM-${sourceId}-${String(index + 1).padStart(5, "0")}`,
            sourceId,
            relation: entry.relation,
            protocolPair: entry.protocolPair,
            capabilityPair: entry.capabilityPair,
            confidence: entry.averageConfidence,
            status: entry.status,
            observedAt: new Date().toISOString(),
            evidence: entry.evidence
        };
    }

    private alreadyExists(
        existingEvents: ResearchMemoryEvent[],
        event: ResearchMemoryEvent
    ): boolean {
        return existingEvents.some(existing =>
            existing.sourceId === event.sourceId &&
            existing.relation === event.relation &&
            existing.protocolPair === event.protocolPair &&
            existing.capabilityPair === event.capabilityPair
        );
    }

    private buildTimelines(
        events: ResearchMemoryEvent[]
    ): ResearchMemoryTimeline[] {
        const groups = new Map<string, ResearchMemoryEvent[]>();

        for (const event of events) {
            const key = JSON.stringify([
                event.relation,
                event.protocolPair ?? null,
                event.capabilityPair ?? null
            ]);

            const existing = groups.get(key) ?? [];
            existing.push(event);
            groups.set(key, existing);
        }

        return [...groups.values()].map(group => {
            const first = group[0];

            return {
                relation: first.relation,
                protocolPair: first.protocolPair,
                capabilityPair: first.capabilityPair,
                events: group
            };
        });
    }

    private statistics(timelines: ResearchMemoryTimeline[]) {
        const events = timelines.flatMap(timeline => timeline.events);

        const sources = new Set(
            events.map(event => event.sourceId)
        );

        const averageConfidence =
            events.length > 0
                ? Math.round(
                    events.reduce(
                        (sum, event) => sum + event.confidence,
                        0
                    ) / events.length
                )
                : 0;

        return {
            events: events.length,
            timelines: timelines.length,
            sources: sources.size,
            averageConfidence,
            supportedEvents: events.filter(
                event => event.status === "SUPPORTED"
            ).length,
            emergingEvents: events.filter(
                event => event.status === "EMERGING"
            ).length,
            rejectedEvents: events.filter(
                event => event.status === "REJECTED"
            ).length
        };
    }

}