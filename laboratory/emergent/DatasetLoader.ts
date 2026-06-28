import { readdir, readFile } from "fs/promises";

export class DatasetLoader {

    async loadAll(directory = "./datasets"): Promise<any[]> {

        const files = await readdir(directory);

        const datasets: any[] = [];

        for (const file of files) {

            if (!file.endsWith(".json")) {
                continue;
            }

            const content = await readFile(
                `${directory}/${file}`,
                "utf8"
            );

            datasets.push(JSON.parse(content));

        }

        return datasets;

    }

}
