import type {
    EmergentProperty,
    EmergentPropertyResult
} from "./EmergentProperty.js";

export class ReservationIntegrityProperty implements EmergentProperty {

    detect(datasets: any[]): EmergentPropertyResult[] {

        let evidence = 0;
        let success = 0;

        for (const dataset of datasets) {

            const state = dataset.states?.ERC8060Reservable;

            if (!state) {
                continue;
            }

            evidence++;

            if (state.lockedValue <= state.totalValue) {
                success++;
            }

        }

        return [
            {
                property: "Reservation Integrity",
                confidence:
                    evidence === 0
                        ? 0
                        : Math.round((success / evidence) * 100),

                evidence,

                description:
                    "Reserved value never exceeded total value."
            }
        ];
    }

}