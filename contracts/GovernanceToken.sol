// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract GovernanceToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant KYC_ROLE = keccak256("KYC_ROLE");

    // KYC status mapping
    mapping(address => bool) public kycApproved;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(KYC_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function setKYCStatus(address account, bool status) public onlyRole(KYC_ROLE) {
        kycApproved[account] = status;
    }

    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        require(kycApproved[_msgSender()] && kycApproved[recipient], "KYC not approved");
        return super.transfer(recipient, amount);
    }

    function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
        require(kycApproved[sender] && kycApproved[recipient], "KYC not approved");
        return super.transferFrom(sender, recipient, amount);
    }
}