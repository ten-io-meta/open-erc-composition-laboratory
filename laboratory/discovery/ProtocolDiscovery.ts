import { readdir } from "fs/promises";
import { join } from "path";

import { ProtocolManifestLoader } from "../protocols/ProtocolManifestLoader.js";
import { ProtocolRegistry } from "../registry/ProtocolRegistry.js";

export class ProtocolDiscovery {

    constructor(
        private readonly registry: ProtocolRegistry,
        private readonly manifestLoader: ProtocolManifestLoader
    ) {}

    async discover(root: string): Promise<void> {

        const entries = await readdir(root, {
            withFileTypes: true
        });

        for (const entry of entries) {

            if (!entry.isDirectory()) {
                continue;
            }

            const manifestPath = join(
                root,
                entry.name,
                "manifest.json"
            );

            try {

                const manifest =
                    await this.manifestLoader.load(manifestPath);

                this.registry.register({
                    id: manifest.id,
                    name: manifest.name,
                    version: manifest.version,
                    capabilities: manifest.capabilities
                });

                console.log(
                    `Discovered protocol: ${manifest.id}`
                );

            } catch {

                // carpeta sin manifest
            }
        }
    }
}