const GovernanceToken = artifacts.require('GovernanceToken');
const { expectRevert, time } = require('@openzeppelin/test-helpers');
const chai = require('chai');
const BN = require('bn.js');
const chaiBN = require('chai-bn')(BN);
chai.use(chaiBN);
const { expect } = chai;
const truffleAssert = require('truffle-assertions');

contract('GovernanceToken', function (accounts) {
  const [admin, user1, user2] = accounts;
  let token;
  let KYC_ROLE;

  beforeEach(async function () {
    // Deploy a new GovernanceToken before each test
    token = await GovernanceToken.new('Governance Token', 'GOV');

    // Get KYC role
    KYC_ROLE = await token.KYC_ROLE();

    // Ensure Admin has KYC role
    await token.grantRole(KYC_ROLE, admin, { from: admin });
  });

  describe('Deployment', function () {
    it('should assign the total supply of tokens to the owner', async function () {
      const ownerBalance = await token.balanceOf(admin);
      const totalSupply = await token.totalSupply();
      expect(ownerBalance).to.be.bignumber.equal(totalSupply);
    });
  });

  describe('Minting', function () {
    it('should allow minting by minter role', async function () {
      // Mint tokens to user1
      await token.mint(user1, 100, { from: admin });
      const balance = await token.balanceOf(user1);
      expect(balance).to.be.bignumber.equal('100');
    });

    it('should not allow minting by non-minter', async function () {
      // Attempt to mint tokens from a non-minter account (user1)
      const minterRole = await token.MINTER_ROLE();
      await truffleAssert.reverts(
        token.mint(user1, 100, { from: user1 }),
        `AccessControl: account ${user1.toLowerCase()} is missing role ${minterRole}`
      );
    });
  });

  describe('KYC', function () {
    it('should set KYC status', async function () {
      // Set KYC status for user1
      await token.setKYCStatus(user1, true, { from: admin });
      const kycStatus = await token.kycApproved(user1);
      expect(kycStatus).to.be.true;
    });

    it('should not allow non-KYC role to set KYC status', async function () {
      // Attempt to set KYC status from a non-KYC role account (user1)
      await expectRevert(
        token.setKYCStatus(user1, true, { from: user1 }),
        `AccessControl: account ${user1.toLowerCase()} is missing role ${KYC_ROLE}`
      );
    });
  });

  describe('Transfers', function () {
    beforeEach(async function () {
      // Mint tokens and set KYC status for users before transfer tests
      await token.mint(user1, 100, { from: admin });
      await token.setKYCStatus(user1, true, { from: admin });
      await token.setKYCStatus(user2, true, { from: admin });
    });

    it('should allow transfer between KYC approved accounts', async function () {
      // Transfer tokens from user1 to user2
      await token.transfer(user2, 50, { from: user1 });
      const balance1 = await token.balanceOf(user1);
      const balance2 = await token.balanceOf(user2);
      expect(balance1).to.be.bignumber.equal('50');
      expect(balance2).to.be.bignumber.equal('50');
    });

    it('should not allow transfer if sender is not KYC approved', async function () {
      // Set KYC status of user1 to false
      await token.setKYCStatus(user1, false, { from: admin });
      // Attempt to transfer tokens from non-KYC approved account
      await expectRevert(
        token.transfer(user2, 50, { from: user1 }),
        'KYC not approved'
      );
    });

    it('should not allow transfer if recipient is not KYC approved', async function () {
      // Set KYC status of user2 to false
      await token.setKYCStatus(user2, false, { from: admin });
      // Attempt to transfer tokens to non-KYC approved account
      await expectRevert(
        token.transfer(user2, 50, { from: user1 }),
        'KYC not approved'
      );
    });
  });
});
