import type { ResearchSource } from "./ResearchSource.js";

export class ResearchSourceRegistry {

    private readonly sources = new Map<string, ResearchSource>();

    register(source: ResearchSource): void {

        this.sources.set(source.sourceId, source);

    }

    registerMany(sources: ResearchSource[]): void {

        for (const source of sources) {

            this.register(source);

        }

    }

    get(sourceId: string): ResearchSource | undefined {

        return this.sources.get(sourceId);

    }

    has(sourceId: string): boolean {

        return this.sources.has(sourceId);

    }

    getAll(): ResearchSource[] {

        return [...this.sources.values()];

    }

    clear(): void {

        this.sources.clear();

    }

    size(): number {

        return this.sources.size;

    }

}