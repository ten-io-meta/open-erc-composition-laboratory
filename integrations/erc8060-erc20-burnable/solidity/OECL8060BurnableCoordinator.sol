// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IOECL8060Value is IERC721 {
    function valueOf(uint256 tokenId) external view returns (uint256);
    function burn(uint256 tokenId) external;
}
interface IOECLERC20Burnable {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function burn(uint256 amount) external;
    function totalSupply() external view returns (uint256);
}

/// @notice Experiment-only coordinator. Not a production router or proof that
/// arbitrary ERC8060 × ERC20 deployments can compose atomically.
/// @dev Must take NFT custody because ERC8060 burn requires msg.sender == owner.
contract OECL8060BurnableCoordinator is ReentrancyGuard {
    IOECL8060Value public immutable nft;
    IOECLERC20Burnable public immutable fungible;
    uint256 public immutable units;

    event ObservedJointBurn(address indexed caller, uint256 indexed tokenId, uint256 ethPaid, uint256 unitsBurned);

    constructor(address nft_, address fungible_, uint256 units_) {
        require(nft_ != address(0) && fungible_ != address(0), "Zero source");
        require(units_ > 0, "Zero amount");
        nft = IOECL8060Value(nft_);
        fungible = IOECLERC20Burnable(fungible_);
        units = units_;
    }

    function redeem(uint256 tokenId) external nonReentrant {
        require(nft.ownerOf(tokenId) == msg.sender, "Not NFT owner");
        uint256 value = nft.valueOf(tokenId);
        uint256 supplyBefore = fungible.totalSupply();

        nft.transferFrom(msg.sender, address(this), tokenId);
        require(fungible.transferFrom(msg.sender, address(this), units), "Transfer failed");

        // Both legs must be in one transaction, or all earlier state rolls back.
        nft.burn(tokenId);
        fungible.burn(units);
        require(fungible.totalSupply() == supplyBefore - units, "Unverified supply change");

        (bool paid, ) = payable(msg.sender).call{value: value}("");
        require(paid, "ETH payout rejected");
        emit ObservedJointBurn(msg.sender, tokenId, value, units);
    }

    receive() external payable {}
}
