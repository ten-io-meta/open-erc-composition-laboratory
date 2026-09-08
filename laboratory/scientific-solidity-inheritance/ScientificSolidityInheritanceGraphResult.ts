import type {
    ScientificSolidityInheritanceContainerOccurrence,
    ScientificSolidityInheritanceEdge,
    ScientificSolidityUnresolvedInheritanceReference
} from "./ScientificSolidityInheritanceEdge.js";


export interface ScientificSolidityInheritanceGraphResult {

    containers:
        ScientificSolidityInheritanceContainerOccurrence[];

    edges:
        ScientificSolidityInheritanceEdge[];

    unresolvedInheritanceReferences:
        ScientificSolidityUnresolvedInheritanceReference[];

    errors:
        string[];

}
