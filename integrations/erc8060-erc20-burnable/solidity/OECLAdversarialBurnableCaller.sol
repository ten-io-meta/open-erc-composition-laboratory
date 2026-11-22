// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

interface IOECLMintNft {
    function mint(string calldata uri) external payable;
    function approve(address to, uint256 tokenId) external;
}
interface IOECLApproveToken {
    function approve(address spender, uint256 amount) external returns (bool);
}
interface IOECLRedeemCaller {
    function redeem(uint256 tokenId) external;
}

/// @notice EVM test fixture that rejects ETH payouts or probes reentrancy.
/// Never deploy in user-facing protocol production.
contract OECLAdversarialBurnableCaller is IERC721Receiver {
    IOECLMintNft public immutable nft;
    IOECLApproveToken public immutable fungible;
    IOECLRedeemCaller public immutable coordinator;
    uint8 public mode; // 0 normal; 1 reject; 2 attempt nested redeem
    bool public nestedRejected;

    constructor(address nft_, address token_, address coordinator_) {
        nft = IOECLMintNft(nft_);
        fungible = IOECLApproveToken(token_);
        coordinator = IOECLRedeemCaller(coordinator_);
    }

    function configure(uint8 nextMode) external {
        require(nextMode <= 2, "Invalid mode");
        mode = nextMode;
    }

    function mintAndApprove(uint256 tokenId, uint256 amount) external payable {
        nft.mint{value: msg.value}("ipfs://oecl-independent-evm");
        nft.approve(address(coordinator), tokenId);
        require(fungible.approve(address(coordinator), amount), "Approval failed");
    }

    function execute(uint256 tokenId) external {
        coordinator.redeem(tokenId);
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    receive() external payable {
        if (mode == 1) revert("Intentional receiver rejection");
        if (mode == 2) {
            (bool ok, ) = address(coordinator).call(
                abi.encodeWithSelector(IOECLRedeemCaller.redeem.selector, uint256(1))
            );
            require(!ok, "Unexpected nested success");
            nestedRejected = true;
        }
    }
}
