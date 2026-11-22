// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// This receiver exists only in the OECL local integration experiment.
// It must not be deployed as a production wallet or listed as an ERC standard.
interface IOECLExperimentNFT {
    function mint(string calldata uri) external payable;
    function approve(address to, uint256 tokenId) external;
}
interface IOECLExperimentToken {
    function approve(address to, uint256 amount) external returns (bool);
}
interface IOECLExperimentCoordinator {
    function redeem(uint256 tokenId) external;
}
contract OECLAdversarialEthReceiver {
    enum Mode { ACCEPT, REJECT_ETH, TRY_REENTER }
    IOECLExperimentNFT public immutable nft;
    IOECLExperimentToken public immutable token;
    IOECLExperimentCoordinator public immutable coordinator;
    uint256 public immutable burnUnits;

    Mode public mode;
    uint256 public targetedTokenId;
    uint256 public callbackCount;
    bool public attemptedReentry;
    bool public reentrySucceeded;
    bytes public reentryFailure;

    event CallbackObserved(uint256 count, bool attemptedReentry, bool succeeded);

    constructor(address nft_, address token_, address coordinator_, uint256 burnUnits_) {
        nft = IOECLExperimentNFT(nft_);
        token = IOECLExperimentToken(token_);
        coordinator = IOECLExperimentCoordinator(coordinator_);
        burnUnits = burnUnits_;
    }

    function mintToSelf() external payable {
        require(msg.value == 0.12 ether, "Only exact local mint value");
        nft.mint{value: msg.value}("ipfs://oecl-eth-receiver");
    }

    function onERC721Received(address, address, uint256, bytes calldata)
        external pure returns (bytes4)
    {
        return this.onERC721Received.selector;
    }

    function configure(uint256 tokenId, Mode nextMode) external {
        targetedTokenId = tokenId;
        mode = nextMode;
        nft.approve(address(coordinator), tokenId);
        require(token.approve(address(coordinator), burnUnits), "Approval failed");
    }

    function execute(uint256 tokenId) external {
        coordinator.redeem(tokenId);
    }

    receive() external payable {
        callbackCount += 1;
        if (mode == Mode.REJECT_ETH) revert("Receiver rejected ETH");
        if (mode == Mode.TRY_REENTER) {
            attemptedReentry = true;
            (bool ok, bytes memory reason) = address(coordinator).call(
                abi.encodeWithSelector(IOECLExperimentCoordinator.redeem.selector, targetedTokenId)
            );
            reentrySucceeded = ok;
            reentryFailure = reason;
            require(!ok, "Unexpected reentrancy success");
        }
        emit CallbackObserved(callbackCount, attemptedReentry, reentrySucceeded);
    }
}
