import type {
    EmergentProperty,
    EmergentPropertyResult
} from "./EmergentProperty.js";

export class CursorAuthorityCorrelationProperty implements EmergentProperty {

    detect(datasets: any[]): EmergentPropertyResult[] {

        let evidence = 0;
        let success = 0;

        for (const dataset of datasets) {

            const cursor = dataset.states?.ERC8312Cursor;

            if (!cursor) {
                continue;
            }

            evidence++;

            if (cursor.cursor <= cursor.consumedAuthority) {
                success++;
            }

        }

        return [
            {
                property: "Cursor Authority Correlation",
                confidence:
                    evidence === 0
                        ? 0
                        : Math.round((success / evidence) * 100),

                evidence,

                description:
                    "Cursor never exceeded consumed authority."
            }
        ];
    }

}
