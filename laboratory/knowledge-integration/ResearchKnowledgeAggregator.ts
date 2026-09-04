import { readdir, readFile } from "fs/promises";

import { IntegratedKnowledge } from "./IntegratedKnowledge.js";
import { ResearchKnowledgeAggregationResult } from "./ResearchKnowledgeAggregationResult.js";

export class ResearchKnowledgeAggregator {

    async aggregate(

        analysisRoot = "./analysis-results"

    ): Promise<ResearchKnowledgeAggregationResult> {

        const folders = await readdir(
            analysisRoot,
            { withFileTypes: true }
        );

        const integratedKnowledge: IntegratedKnowledge[] = [];

        let sourceCount = 0;

        for (const folder of folders) {

            if (!folder.isDirectory()) {

                continue;

            }

            try {

                const path =
                    `${analysisRoot}/${folder.name}/research-knowledge.json`;

                const json = JSON.parse(

                    await readFile(path, "utf8")

                );

                const entries =
                    json.integratedKnowledge ??
                    json.entries ??
                    [];

                for (const entry of entries) {

                    const relationText =
                        entry.relation ?? "";

                    const parts =
                        relationText.includes("->")
                            ? relationText.split("->")
                            : relationText.split(":");

                    integratedKnowledge.push({

                        knowledgeId:
                            entry.knowledgeId ??
                            `${folder.name}-${integratedKnowledge.length + 1}`,

                        subject:
                            entry.subject ??
                            parts[0] ??
                            "",

                        relation:
                            entry.subject
                                ? entry.relation
                                : (parts[1] ?? ""),

                        object:
                            entry.object ??
                            parts[2] ??
                            "",

                        supportingSources:
                            entry.supportingSources ?? [],

                        confidence:
                            entry.averageConfidence ??
                            entry.confidence ??
                            0,

                        evidence:
                            entry.evidence ?? [],

                        generatedBy:
                            entry.generatedBy ??
                            folder.name

                    });

                }

                sourceCount++;

            }

            catch {

                // carpeta sin conocimiento

            }

        }

        return {

            generatedAt:
                new Date().toISOString(),

            sourceCount,

            integratedKnowledge,

            errors: []

        };

    }

}