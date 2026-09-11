import type { ProtocolSemantic } from "./ProtocolSemantic.js";

export interface ProtocolSemanticResult {

    sourceId: string;

    extractedAt: string;

    semantics: ProtocolSemantic[];

    errors: string[];

}