# erc-8004/erc-8004-contracts

Repository: erc-8004/erc-8004-contracts

URL: https://github.com/erc-8004/erc-8004-contracts

## Description

Automatically generated OECL research bundle from GitHub repository erc-8004/erc-8004-contracts.

## Protocols

- ERC1967
- ERC721
- IERC1271
- ERC1271
- ERC8004
- ERC7201

## Capabilities

- Testing

## Claims

- description: Discover agents and establish trust through reputation and validation
- Trust models are pluggable and tiered, with security proportional to value at risk, from low-stake tasks like ordering pizza to high-stake tasks like medical diagnosis. Developers can choose from different trust models: reputation systems using client feedback, validation via stake-secured re-execution, zero-knowledge machine learning (zkML) proofs, or trusted execution environment (TEE) oracles.
- **Validation Registry** \- Generic hooks for requesting and recording independent validators checks (e.g. stakers re-running the job, zkML verifiers, TEE oracles, trusted judges).
- When the Validation Registry is deployed, the *identityRegistry* address is set via `initialize(address identityRegistry_)` and is visible by calling `getIdentityRegistry()`, as described above.
- Agents request validation by calling:
- function validationRequest(address validatorAddress, uint256 agentId, string requestURI, bytes32 requestHash) external
- A ValidationRequest event is emitted:
- event ValidationRequest(address indexed validatorAddress, uint256 indexed agentId, string requestURI, bytes32 indexed requestHash)
- function validationResponse(bytes32 requestHash, uint8 response, string responseURI, bytes32 responseHash, string tag) external
- Only *requestHash* and *response* are mandatory; *responseURI*, *responseHash* and *tag* are optional. This function MUST be called by the *validatorAddress* specified in the original request. The *response* is a value between 0 and 100, which can be used as binary (0 for failed, 100 for passed) or with intermediate values for validations with a spectrum of outcomes. The optional *responseURI* points to off-chain evidence or audit of the validation, *responseHash* is its commitment (in case the resource is not on IPFS), while *tag* allows for custom categorization or additional data.
- validationResponse() can be called multiple times for the same *requestHash*, enabling use cases like progressive validation states (e.g., “soft finality” and “hard finality” using *tag*) or updates to validation status.
- Upon successful execution, a *ValidationResponse* event is emitted with all function parameters:
- event ValidationResponse(address indexed validatorAddress, uint256 indexed agentId, bytes32 indexed requestHash, uint8 response, string responseURI, bytes32 responseHash, string tag)
- function getValidationStatus(bytes32 requestHash) external view returns (address validatorAddress, uint256 agentId, uint8 response, bytes32 responseHash, string tag, uint256 lastUpdate)
- //Returns aggregated validation statistics for an agent. agentId is the only mandatory parameter; validatorAddresses and tag are optional filters
- function getAgentValidations(uint256 agentId) external view returns (bytes32[] memory requestHashes)
- Incentives and slashing related to validation are managed by the specific validation protocol and are outside the scope of this registry.
- * Crawling all agents starting from a logically centralized endpoint and discover agent information (name, image, services), capabilities, communication endpoints (MCP, A2A, others), ENS names, wallet addresses and which trust models they support (reputation, validation, TEE attestation)
- * Building agent explorers and marketplaces using any ERC-721 compatible application to browse, transfer, and manage agents
- * Discovering which agents support stake-secured or zkML validation and how to request it through a standardized interface
- The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174).
- The *agentURI* MUST resolve to the agent registration file. It MAY use any URI scheme such as `ipfs://` (e.g., `ipfs://cid`), `https://` (e.g., `https://example.com/agent3.json`), or a base64-encoded `data:` URI (e.g., `data:application/json;base64,eyJ0eXBlIjoi...`) for fully on-chain metadata. When the registration uri changes, it can be updated with *setAgentURI()*.
- The registration file MUST have the following structure:
- The *type*, *name*, *description*, and *image* fields at the top SHOULD ensure compatibility with ERC-721 apps. The number and type of *endpoints* are fully customizable, allowing developers to add as many as they wish. The *version* field in endpoints is a SHOULD, not a MUST.
- The key `agentWallet` is reserved and cannot be set via `setMetadata()` or during `register()` (including the metadata array overload). It represents the address where the agent receives payments and is initially set to the owner's address. To change it, the agent owner must prove control of the new wallet by providing a valid [EIP-712](./eip-712.md) signature for EOAs or [ERC-1271](./eip-1271.md) for smart contract wallets—by calling:
- When the agent is transferred, `agentWallet` is automatically cleared (effectively resetting it to the zero address) and must be re-verified by the new owner.
- This emits one Transfer event, one MetadataSet event for the reserved `agentWallet` key, one MetadataSet event for each additional metadata entry (if any), and
- The *agentId* must be a validly registered agent. The *valueDecimals* MUST be between 0 and 18. The feedback submitter MUST NOT be the agent owner or an approved operator for *agentId*. *tag1*, *tag2*, *endpoint*, *feedbackURI*, and *feedbackHash* are OPTIONAL.
- clientAddresses MUST be provided (non-empty); results without filtering by clientAddresses are subject to Sybil/spam attacks. See Security Considerations for details
- This function MUST be called by the owner or operator of *agentId*. The *requestURI* points to off-chain data containing all information needed for the validator to validate, including inputs and outputs needed for the verification. The *requestHash* is a commitment to this data (`keccak256` of the request payload) and identifies the request. All other fields are mandatory.
- Only *requestHash* and *response* are mandatory; *responseURI*, *responseHash* and *tag* are optional. This function MUST be called by the *validatorAddress* specified in the original request. The *response* is a value between 0 and 100, which can be used as binary (0 for failed, 100 for passed) or with intermediate values for validations with a spectrum of outcomes. The optional *responseURI* points to off-chain evidence or audit of the validation, *responseHash* is its commitment (in case the resource is not on IPFS), while *tag* allows for custom categorization or additional data.
- * On-chain pointers and hashes cannot be deleted, ensuring audit trail integrity
- * While this ERC cryptographically ensures the registration file corresponds to the on-chain agent, it cannot cryptographically guarantee that advertised capabilities are functional and non-malicious. The three trust models (reputation, validation, and TEE attestation) are designed to support this verification need
- * "The tokenURI MUST resolve to the agent registration file. It MAY use any URI scheme such as ipfs://
- it("Should block setting reserved 'agentWallet' key via setMetadata", async function () {
- it("Should block setting reserved 'agentWallet' key via register with metadata", async function () {
- Revoke feedback (use 1-based index) - must be called by the client who gave feedback
- * "The agentId must be a validly registered agent. The score MUST be between 0 and 100."
- * "The score MUST be between 0 and 100."
- Get summary for both clients (must specify tags since contract requires exact match)
- Read all feedback (must match exact tags)
- * Local tests always use testnet addresses (localhost is chainId 31337)
- bytes32 private constant RESERVED_AGENT_WALLET_KEY_HASH = keccak256("agentWallet");
- require(keccak256(bytes(metadata[i].metadataKey)) != RESERVED_AGENT_WALLET_KEY_HASH, "reserved key");
- require(keccak256(bytes(metadataKey)) != RESERVED_AGENT_WALLET_KEY_HASH, "reserved key");
- require(feedbackIndex > 0, "index must be > 0");
- Check permission: caller must be owner or approved operator
- "node_modules/available-typed-arrays": {
- "resolved": "https://registry.npmjs.org/available-typed-arrays/-/available-typed-arrays-1.0.7.tgz",
- "available-typed-arrays": "^1.0.7",
- Repository contains README research context.
- Repository contains contract or interface material.
- Repository contains test evidence.
- Repository contains documentation material.
- Repository contains invariant-like statements.
- Repository exposes 133 executable test or invariant target(s).
- Repository uses the Hardhat toolchain.
