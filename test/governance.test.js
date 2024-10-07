const Governance = artifacts.require('Governance');
const GovernanceToken = artifacts.require('GovernanceToken');

const { expect } = require('chai');
const { expectRevert, time } = require('@openzeppelin/test-helpers');
const truffleAssert = require('truffle-assertions');

contract('Governance', (accounts) => {
  let governance;
  let governanceToken;
  const [admin, member1, member2, nonMember] = accounts;

  beforeEach(async () => {
    // Deploy GovernanceToken first
    governanceToken = await GovernanceToken.new('Governance Token', 'GOV');

    // Deploy Governance with GovernanceToken address
    governance = await Governance.new(
      governanceToken.address,
      time.duration.days(1)
    );

    // Grant MINTER_ROLE and KYC_ROLE to the Governance contract
    await governanceToken.grantRole(
      await governanceToken.MINTER_ROLE(),
      governance.address,
      { from: admin }
    );
    await governanceToken.grantRole(
      await governanceToken.KYC_ROLE(),
      governance.address,
      { from: admin }
    );
  });

  describe('Membership Management', () => {
    it('should allow admin to add a member', async () => {
      await governance.addMember(member1, 1, { from: admin });
      const memberInfo = await governance.members(member1);
      console.log('Member Info:', memberInfo);
      expect(memberInfo.isApproved).to.be.true;
      expect(memberInfo.hasPassedKYC).to.be.false;
      expect(memberInfo.votingPower.toNumber()).to.equal(1);
      assert.isTrue(memberInfo.isApproved, 'Member should be approved');
      assert.isFalse(
        memberInfo.hasPassedKYC,
        'Member should not have passed KYC initially'
      );
      assert.equal(
        memberInfo.votingPower,
        1,
        'Member should have at least 1 voting power'
      );
    });

    it('should allow admin to remove a member', async () => {
      await governance.addMember(member1, 1, { from: admin });
      await governance.removeMember(member1, { from: admin });
      const memberInfo = await governance.members(member1);

      expect(memberInfo.isApproved).to.be.false;
      expect(memberInfo.hasPassedKYC).to.be.false; // This should be false as it was set to false when adding the member
      expect(memberInfo.votingPower.toNumber()).to.equal(1); // This will still be 1 as we don't change it in removeMember

      assert.isFalse(
        memberInfo.isApproved,
        'Member should not be approved after removal'
      );
    });

    it('should allow admin to update KYC status', async () => {
      await governance.addMember(member1, 1, { from: admin });
      await governance.updateKYCStatus(member1, true, { from: admin });
      const member = await governance.members(member1);
      assert.isTrue(member.hasPassedKYC, 'Member should have passed KYC');
    });

    it('should not allow non-admin to add or remove members', async () => {
      await truffleAssert.reverts(
        governance.addMember(member2, 1, { from: member1 }),
        'AccessControl: account ' +
          member1.toLowerCase() +
          ' is missing role ' +
          web3.utils.keccak256('ADMIN_ROLE')
      );
      await truffleAssert.reverts(
        governance.removeMember(admin, { from: member1 }),
        'AccessControl: account ' +
          member1.toLowerCase() +
          ' is missing role ' +
          web3.utils.keccak256('ADMIN_ROLE')
      );
    });
  });

  describe('Proposal Creation and Voting', () => {
    beforeEach(async () => {
      await governance.addMember(member1, 1, { from: admin });
      await governance.updateKYCStatus(member1, true, { from: admin });
      await governance.addMember(member2, 1, { from: admin });
      await governance.updateKYCStatus(member2, true, { from: admin });
      await governanceToken.mint(member1, 100, { from: admin });
      await governanceToken.mint(member2, 200, { from: admin });
    });

    it('should allow approved members to create proposals', async () => {
      await governance.createProposal('Test Proposal', { from: member1 });
      const proposal = await governance.proposals(0);
      assert.equal(
        proposal.description,
        'Test Proposal',
        'Proposal description should match'
      );
      assert.equal(proposal.proposer, member1, 'Proposer should be member1');
    });

    it('should not allow non-members to create proposals', async () => {
      await truffleAssert.reverts(
        governance.createProposal('Test Proposal', { from: nonMember }),
        'Only approved members can perform this action'
      );
    });

    it('should not allow members without KYC to create proposals', async () => {
      await governance.updateKYCStatus(member1, false, { from: admin });
      await truffleAssert.reverts(
        governance.createProposal('Test Proposal', { from: member1 }),
        'Member has not passed KYC'
      );
    });

    it('should allow members to vote on proposals', async () => {
      await governance.createProposal('Test Proposal', { from: member1 });
      await governance.vote(0, true, { from: member2 });
      const proposal = await governance.proposals(0);
      assert.equal(
        proposal.forVotes.toNumber(),
        200,
        'For votes should be 200'
      );
    });

    it('should not allow double voting', async () => {
      await governance.createProposal('Test Proposal', { from: member1 });
      await governance.vote(0, true, { from: member2 });
      await truffleAssert.reverts(
        governance.vote(0, true, { from: member2 }),
        'Already voted'
      );
    });
  });

  describe('Proposal Execution', () => {
    beforeEach(async () => {
      await governance.addMember(member1, 1, { from: admin });
      await governance.updateKYCStatus(member1, true, { from: admin });
      await governance.addMember(member2, 2, { from: admin });
      await governance.updateKYCStatus(member2, true, { from: admin });
      await governance.createProposal('Test Proposal', { from: member1 });
    });

    it('should not allow execution before voting period ends', async () => {
      await truffleAssert.reverts(
        governance.executeProposal(0, { from: member1 }),
        'Voting period has not ended'
      );
    });

    it('should execute proposal after voting period if quorum is reached and majority approves', async () => {
      await governance.vote(200, true, { from: member1 });
      await governance.vote(200, true, { from: member2 });

      // Get the current voting period
      const votingPeriod = await governance.votingPeriod();

      // Increase time by voting period + 1 second
      await web3.currentProvider.send(
        {
          jsonrpc: '2.0',
          method: 'evm_increaseTime',
          params: [votingPeriod.toNumber() + 1],
          id: new Date().getTime(),
        },
        () => {}
      );

      // Mine a new block to ensure the increased time takes effect
      await web3.currentProvider.send(
        {
          jsonrpc: '2.0',
          method: 'evm_mine',
          id: new Date().getTime(),
        },
        () => {}
      );

      await governance.executeProposal(0, { from: member1 });
      const proposal = await governance.proposals(0);
      assert.isTrue(proposal.executed, 'Proposal should be executed');
    });

    it('should not execute proposal if quorum is not reached', async () => {
      await governance.vote(0, true, { from: member1 });

      // Get the current voting period
      const votingPeriod = await governance.votingPeriod();

      // Increase time by voting period + 1 second
      await web3.currentProvider.send(
        {
          jsonrpc: '2.0',
          method: 'evm_increaseTime',
          params: [votingPeriod.toNumber() + 1],
          id: new Date().getTime(),
        },
        () => {}
      );

      // Mine a new block to ensure the increased time takes effect
      await web3.currentProvider.send(
        {
          jsonrpc: '2.0',
          method: 'evm_mine',
          id: new Date().getTime(),
        },
        () => {}
      );

      await truffleAssert.reverts(
        governance.executeProposal(0, { from: member1 }),
        'Quorum not reached'
      );
    });
  });

  describe('Admin Functions', () => {
    it('should allow admin to set quorum percentage', async () => {
      await governance.setQuorumPercentage(60, { from: admin });
      const newQuorum = await governance.quorumPercentage();
      assert.equal(
        newQuorum.toNumber(),
        60,
        'Quorum percentage should be updated'
      );
    });

    it('should allow admin to set voting period', async () => {
      const newPeriod = 5 * 24 * 60 * 60; // 5 days
      await governance.setVotingPeriod(newPeriod, { from: admin });
      const votingPeriod = await governance.votingPeriod();
      assert.equal(
        votingPeriod.toNumber(),
        newPeriod,
        'Voting period should be updated'
      );
    });

    it('should not allow non-admin to set quorum percentage or voting period', async () => {
      await truffleAssert.reverts(
        governance.setQuorumPercentage(60, { from: member1 }),
        'AccessControl: account ' +
          member1.toLowerCase() +
          ' is missing role ' +
          web3.utils.keccak256('ADMIN_ROLE')
      );
      await truffleAssert.reverts(
        governance.setVotingPeriod(5 * 24 * 60 * 60, { from: member1 }),
        'Only admin can perform this action'
      );
    });
  });
});
