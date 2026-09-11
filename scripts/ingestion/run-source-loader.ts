import { SourceLoader } from "../../laboratory/source-loader/SourceLoader.js";
import { ResearchSourceExporter } from "../../laboratory/source-loader/ResearchSourceExporter.js";

async function main() {

    console.log("");
    console.log("====================================");
    console.log("OECL Source Loader");
    console.log("====================================");

    const loader = new SourceLoader();

    const source = await loader.load(
        "./sources/ingestion/github/ethereum-eips.json"
    );

    console.log("");
    console.log("Normalized source:");
    console.log(JSON.stringify(source, null, 4));

    const exporter = new ResearchSourceExporter();

    const exported = await exporter.export(source);

    console.log("");
    console.log("Research source exported:");
    console.log(exported.sourcePath);

    console.log("Evidence exported:");
    console.log(exported.evidencePath);

}

main();