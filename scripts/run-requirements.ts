import { writeFile, mkdir } from "fs/promises";

import { ProtocolDiscovery } from "../laboratory/discovery/ProtocolDiscovery.js";
import { ProtocolManifestLoader } from "../laboratory/protocols/ProtocolManifestLoader.js";
import { ProtocolRegistry } from "../laboratory/registry/ProtocolRegistry.js";
import { ProtocolFactory } from "../laboratory/protocols/ProtocolFactory.js";

import { ProtocolRequirementEngine } from "../laboratory/requirements/ProtocolRequirementEngine.js";
import { ManifestRequirement } from "../laboratory/requirements/ManifestRequirement.js";
import { CapabilityRequirement } from "../laboratory/requirements/CapabilityRequirement.js";
import { InvariantRequirement } from "../laboratory/requirements/InvariantRequirement.js";
import { AdapterRequirement } from "../laboratory/requirements/AdapterRequirement.js";
import { ActionRequirement } from "../laboratory/requirements/ActionRequirement.js";

const protocols = [
    {
        id: "ERC8001Authority",
        capabilities: ["Authority"],
        invariants: ["authority-safety"],
        actions: ["authorize"]
    },
    {
        id: "ERC8060Reservable",
        capabilities: ["Reservation", "Accounting"],
        invariants: ["reservation-safety"],
        actions: ["reserve"]
    },
    {
        id: "ERC8312Cursor",
        capabilities: ["Cursor"],
        invariants: ["cursor-safety"],
        actions: ["consume"]
    },
    {
        id: "ERC8275Settlement",
        capabilities: ["Settlement"],
        invariants: ["settlement-safety"],
        actions: ["settle"]
    }
];

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL Requirements Engine");
    console.log("====================================");

    const protocolRegistry = new ProtocolRegistry();
    const manifestLoader = new ProtocolManifestLoader();

    const discovery = new ProtocolDiscovery(
        protocolRegistry,
        manifestLoader
    );

    await discovery.discover("./laboratory/protocols");

    const requirementEngine = new ProtocolRequirementEngine();

    requirementEngine.register(new ManifestRequirement());
    requirementEngine.register(new CapabilityRequirement());
    requirementEngine.register(new InvariantRequirement());
    requirementEngine.register(new AdapterRequirement());
    requirementEngine.register(new ActionRequirement());

    const exportedResults: any[] = [];

    for (const protocol of protocols) {

        console.log("");
        console.log("------------------------------------");
        console.log(`Protocol: ${protocol.id}`);
        console.log("------------------------------------");

        let adapterAvailable = true;

        try {
            ProtocolFactory.create(protocol.id);
        } catch {
            adapterAvailable = false;
        }

        const results = requirementEngine.evaluate({
            protocolId: protocol.id,
            capabilities: protocol.capabilities,
            invariants: protocol.invariants,
            adapterAvailable,
            actions: protocol.actions
        });

        const passed = results.filter(result => result.passed).length;
        const total = results.length;

        let status = "Not Ready";

        if (passed === total) {
            status = "Eligible";
        } else if (passed > 0) {
            status = "Partial";
        }

        for (const result of results) {
            console.log(
                `${result.passed ? "PASS" : "FAIL"} ${result.requirement}: ${result.message}`
            );
        }

        console.log("");
        console.log(`Eligibility: ${passed}/${total}`);
        console.log(`Status: ${status}`);

        exportedResults.push({
            protocolId: protocol.id,
            eligibility: status,
            passed,
            total,
            capabilities: protocol.capabilities,
            invariants: protocol.invariants,
            adapterAvailable
        });
    }

    await mkdir("./requirements-results", { recursive: true });

    await writeFile(
        "./requirements-results/protocols.json",
        JSON.stringify(exportedResults, null, 4)
    );

    console.log("");
    console.log("Requirements exported:");
    console.log("./requirements-results/protocols.json");

    console.log("");
    console.log("Requirements check finished.");
}

main();