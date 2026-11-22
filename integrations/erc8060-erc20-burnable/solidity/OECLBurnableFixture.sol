// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/// @notice Test-only deployable fixture of the audited OpenZeppelin ERC20Burnable
/// source profile. ERC20Burnable itself is abstract. NOT an additional ERC.
contract OECLBurnableFixture is ERC20Burnable {
    address public immutable fixtureDeployer;
    bool public failBurnForTest;

    constructor(uint256 initialSupply) ERC20("OECL Burnable Fixture", "OECLB") {
        fixtureDeployer = msg.sender;
        _mint(msg.sender, initialSupply);
    }

    function setFailBurnForTest(bool fail_) external {
        require(msg.sender == fixtureDeployer, "Fixture-only admin");
        failBurnForTest = fail_;
    }

    function burn(uint256 amount) public override {
        require(!failBurnForTest, "Injected second-leg burn failure");
        super.burn(amount);
    }
}
