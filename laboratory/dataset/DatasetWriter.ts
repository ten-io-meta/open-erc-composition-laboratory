import { mkdir, writeFile } from "fs/promises";

export class DatasetWriter {
    async write(
        experimentId: string,
        data: Record<string, unknown>
    ): Promise<void> {
        await mkdir("./datasets", { recursive: true });

        await writeFile(
            `./datasets/${experimentId}.json`,
            JSON.stringify(data, null, 2),
            "utf8"
        );
    }
}
