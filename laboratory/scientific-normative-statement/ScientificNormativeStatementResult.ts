import type {
    ScientificNormativeStatement
} from "./ScientificNormativeStatement.js";


export interface ScientificNormativeStatementResult {

    statements:
        ScientificNormativeStatement[];

    errors:
        string[];

}
