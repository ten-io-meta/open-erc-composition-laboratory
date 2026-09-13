export type IdentityCriterion = {
  criterionId: string;
  kind: "ERC165_INTERFACE";
  interfaceId: string;
  provenance: string | null;
};

export type ProtocolEvidenceDescriptor = {
  protocolId: string;
  identityCriteria: IdentityCriterion[];
};

type JsonRpcResponse = {
  result?: unknown;
  error?: {
    code?: number;
    message?: string;
  };
};

type ObserveCandidateInput = {
  rpcUri: string;
  expectedChainId: string;
  candidateAddress: string | null;
  descriptor: ProtocolEvidenceDescriptor;
};

async function rpc(
  uri: string,
  method: string,
  params: unknown[]
): Promise<unknown> {
  const response = await fetch(uri, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`${method} HTTP ${response.status}`);
  }

  const body =
    (await response.json()) as JsonRpcResponse;

  if (body.error) {
    throw new Error(
      `${method} RPC error: ${
        body.error.message ??
        body.error.code ??
        "UNKNOWN"
      }`
    );
  }

  return body.result;
}

function validAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function validInterfaceId(value: string): boolean {
  return /^0x[a-fA-F0-9]{8}$/.test(value);
}

function supportsInterfaceCallData(
  interfaceId: string
): string {
  if (!validInterfaceId(interfaceId)) {
    throw new Error(
      `Invalid ERC-165 interface id: ${interfaceId}`
    );
  }

  const encodedInterfaceId =
    interfaceId.slice(2).padEnd(64, "0");

  return `0x01ffc9a7${encodedInterfaceId}`;
}

function decodeBoolean(value: unknown): boolean {
  if (
    typeof value !== "string" ||
    !/^0x[0-9a-fA-F]+$/.test(value)
  ) {
    throw new Error(
      "ERC-165 call returned an invalid value."
    );
  }

  return BigInt(value) !== BigInt(0);
}

export function buildConfiguredProtocolDescriptor(
  protocolId: string
): ProtocolEvidenceDescriptor {
  const configuredInterfaceId =
    process.env
      .OECL_EVIDENCE_ERC165_INTERFACE_ID
      ?.trim() || null;

  const configuredProvenance =
    process.env
      .OECL_EVIDENCE_IDENTITY_PROVENANCE
      ?.trim() || null;

  const identityCriteria: IdentityCriterion[] = [];

  if (configuredInterfaceId) {
    identityCriteria.push({
      criterionId: "configured-erc165-interface",
      kind: "ERC165_INTERFACE",
      interfaceId: configuredInterfaceId,
      provenance: configuredProvenance,
    });
  }

  return {
    protocolId,
    identityCriteria,
  };
}

export async function observeProtocolCandidate(
  input: ObserveCandidateInput
) {
  const {
    rpcUri,
    expectedChainId,
    candidateAddress,
    descriptor,
  } = input;

  if (!candidateAddress) {
    return {
      protocolStatus:
        "NO_EVIDENCE_SOURCE" as const,

      candidateAddress: null,

      observedBlock: null,
      observedBlockHash: null,

      chainMatch: null,
      runtimeCodePresent: null,

      identityStatus:
        "NOT_EVALUATED_NO_LOCATOR" as const,

      identityTests: [],

      error: null,
    };
  }

  if (!validAddress(candidateAddress)) {
    return {
      protocolStatus:
        "INVALID_EVIDENCE_SOURCE" as const,

      candidateAddress,

      observedBlock: null,
      observedBlockHash: null,

      chainMatch: false,
      runtimeCodePresent: false,

      identityStatus:
        "NOT_EVALUATED_INVALID_LOCATOR" as const,

      identityTests: [],

      error:
        "Candidate deployment address is invalid.",
    };
  }

  try {
    const chainResult =
      await rpc(
        rpcUri,
        "eth_chainId",
        []
      );

    if (typeof chainResult !== "string") {
      throw new Error(
        "eth_chainId returned an invalid value."
      );
    }

    const observedChainId =
      BigInt(chainResult).toString(10);

    const chainMatch =
      observedChainId === expectedChainId;

    if (!chainMatch) {
      return {
        protocolStatus:
          "CHAIN_MISMATCH" as const,

        candidateAddress,

        observedBlock: null,
        observedBlockHash: null,

        chainMatch: false,
        runtimeCodePresent: false,

        identityStatus:
          "NOT_EVALUATED_CHAIN_MISMATCH" as const,

        identityTests: [],

        error:
          `Expected chain ${expectedChainId}, observed ${observedChainId}.`,
      };
    }

    const blockNumberResult =
      await rpc(
        rpcUri,
        "eth_blockNumber",
        []
      );

    if (
      typeof blockNumberResult !== "string" ||
      !/^0x[0-9a-fA-F]+$/.test(
        blockNumberResult
      )
    ) {
      throw new Error(
        "eth_blockNumber returned an invalid value."
      );
    }

    const blockTag = blockNumberResult;

    const [
      blockResult,
      runtimeCodeResult,
    ] = await Promise.all([
      rpc(
        rpcUri,
        "eth_getBlockByNumber",
        [blockTag, false]
      ),

      rpc(
        rpcUri,
        "eth_getCode",
        [
          candidateAddress,
          blockTag,
        ]
      ),
    ]);

    const block =
      blockResult as {
        hash?: string | null;
      } | null;

    const observedBlockHash =
      block?.hash?.toLowerCase() ?? null;

    const observedBlock =
      Number(BigInt(blockTag));

    const runtimeCodePresent =
      typeof runtimeCodeResult === "string" &&
      runtimeCodeResult !== "0x";

    if (!runtimeCodePresent) {
      return {
        protocolStatus:
          "NO_CODE_AT_CANDIDATE" as const,

        candidateAddress,

        observedBlock,
        observedBlockHash,

        chainMatch: true,
        runtimeCodePresent: false,

        identityStatus:
          "NOT_EVALUATED_NO_RUNTIME_CODE" as const,

        identityTests: [],

        error: null,
      };
    }

    if (
      descriptor.identityCriteria.length === 0
    ) {
      return {
        protocolStatus:
          "RUNTIME_CODE_OBSERVED_AT_CANDIDATE" as const,

        candidateAddress,

        observedBlock,
        observedBlockHash,

        chainMatch: true,
        runtimeCodePresent: true,

        identityStatus:
          "NO_IDENTITY_CRITERION" as const,

        identityTests: [],

        error: null,
      };
    }

    const identityTests =
      await Promise.all(
        descriptor.identityCriteria.map(
          async (criterion) => {
            if (
              criterion.kind !==
              "ERC165_INTERFACE"
            ) {
              return {
                criterionId:
                  criterion.criterionId,

                kind:
                  criterion.kind,

                interfaceId:
                  criterion.interfaceId,

                provenance:
                  criterion.provenance,

                status:
                  "UNSUPPORTED_CRITERION_KIND" as const,

                observedValue: null,

                error:
                  "Identity criterion kind is not supported.",
              };
            }

            if (
              !validInterfaceId(
                criterion.interfaceId
              )
            ) {
              return {
                criterionId:
                  criterion.criterionId,

                kind:
                  criterion.kind,

                interfaceId:
                  criterion.interfaceId,

                provenance:
                  criterion.provenance,

                status:
                  "INVALID_CRITERION" as const,

                observedValue: null,

                error:
                  "Configured ERC-165 interface id is invalid.",
              };
            }

            try {
              const [
                erc165SelfResult,
                erc165InvalidResult,
                targetResult,
              ] = await Promise.all([
                rpc(
                  rpcUri,
                  "eth_call",
                  [
                    {
                      to: candidateAddress,
                      data:
                        supportsInterfaceCallData(
                          "0x01ffc9a7"
                        ),
                      gas: "0x7530",
                    },
                    blockTag,
                  ]
                ),

                rpc(
                  rpcUri,
                  "eth_call",
                  [
                    {
                      to: candidateAddress,
                      data:
                        supportsInterfaceCallData(
                          "0xffffffff"
                        ),
                      gas: "0x7530",
                    },
                    blockTag,
                  ]
                ),

                rpc(
                  rpcUri,
                  "eth_call",
                  [
                    {
                      to: candidateAddress,
                      data:
                        supportsInterfaceCallData(
                          criterion.interfaceId
                        ),
                      gas: "0x7530",
                    },
                    blockTag,
                  ]
                ),
              ]);

              const erc165SelfSupported =
                decodeBoolean(
                  erc165SelfResult
                );

              const erc165InvalidSupported =
                decodeBoolean(
                  erc165InvalidResult
                );

              const targetSupported =
                decodeBoolean(
                  targetResult
                );

              const erc165BehaviorValid =
                erc165SelfSupported &&
                !erc165InvalidSupported;

              return {
                criterionId:
                  criterion.criterionId,

                kind:
                  criterion.kind,

                interfaceId:
                  criterion.interfaceId,

                provenance:
                  criterion.provenance,

                status:
                  !erc165BehaviorValid
                    ? "ERC165_BEHAVIOR_INVALID" as const
                    : targetSupported
                      ? "ERC165_SUPPORT_TRUE" as const
                      : "ERC165_SUPPORT_FALSE" as const,

                observedValue:
                  targetSupported,

                erc165SelfSupported,
                erc165InvalidSupported,
                erc165BehaviorValid,

                error: null,
              };
            } catch (error) {
              return {
                criterionId:
                  criterion.criterionId,

                kind:
                  criterion.kind,

                interfaceId:
                  criterion.interfaceId,

                provenance:
                  criterion.provenance,

                status:
                  "CRITERION_UNRESOLVED" as const,

                observedValue: null,

                erc165SelfSupported: null,
                erc165InvalidSupported: null,
                erc165BehaviorValid: null,

                error:
                  error instanceof Error
                    ? error.message
                    : "Unknown identity criterion error.",
              };
            }
          }
        )
      );

    const hasUnresolved =
      identityTests.some(
        (test) =>
          test.status ===
            "CRITERION_UNRESOLVED" ||
          test.status ===
            "INVALID_CRITERION" ||
          test.status ===
            "UNSUPPORTED_CRITERION_KIND"
      );

    const allSatisfied =
      identityTests.length > 0 &&
      identityTests.every(
        (test) =>
          test.status ===
          "ERC165_SUPPORT_TRUE"
      );

    const identityStatus =
      hasUnresolved
        ? "IDENTITY_CRITERIA_UNRESOLVED" as const
        : allSatisfied
          ? "IDENTITY_CRITERIA_SATISFIED" as const
          : "IDENTITY_CRITERIA_NOT_SATISFIED" as const;

    return {
      protocolStatus:
        "RUNTIME_CODE_OBSERVED_AT_CANDIDATE" as const,

      candidateAddress,

      observedBlock,
      observedBlockHash,

      chainMatch: true,
      runtimeCodePresent: true,

      identityStatus,
      identityTests,

      error: null,
    };
  } catch (error) {
    return {
      protocolStatus:
        "UNRESOLVED" as const,

      candidateAddress,

      observedBlock: null,
      observedBlockHash: null,

      chainMatch: false,
      runtimeCodePresent: false,

      identityStatus:
        "IDENTITY_CRITERIA_UNRESOLVED" as const,

      identityTests: [],

      error:
        error instanceof Error
          ? error.message
          : "Unknown candidate evidence error.",
    };
  }
}
