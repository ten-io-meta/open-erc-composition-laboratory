export type ScientificSourceExternalCallForm =
    | "LOW_LEVEL_CALL"
    | "LOW_LEVEL_STATICCALL"
    | "LOW_LEVEL_DELEGATECALL"
    | "CAST_MEMBER_CALL";


/*
 * Directly observed Solidity call syntax.
 *
 * This structure does not establish:
 *
 * - another protocol as the runtime target,
 * - interface compatibility,
 * - EVM call success,
 * - composition polarity.
 *
 * CAST_MEMBER_CALL deliberately describes source syntax only.
 * A typed Solidity member call is not promoted to an EVM CALL
 * opcode without runtime evidence.
 */
export interface ScientificSourceExternalCall {

    callForm:
        ScientificSourceExternalCallForm;

    /*
     * Exact target expression observed at the call site.
     *
     * Examples:
     *
     * newWallet
     * payable(msg.sender)
     * to
     */
    targetExpression:
        string;

    /*
     * For cast/member syntax such as:
     *
     * ReceiverType(target).onReceive(...)
     *
     * No claim is made here that the symbol is semantically an
     * interface rather than another Solidity type.
     */
    castTypeSymbol?:
        string;

    memberSymbol?:
        string;

    /*
     * Optional directly observed ABI encodeCall target carried by
     * a low-level call, for example:
     *
     * abi.encodeCall(SignatureType.validateSignature, (...))
     */
    encodedCallTypeSymbol?:
        string;

    encodedCallMemberSymbol?:
        string;
}