// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GovernanceToken.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Governance is AccessControl {
    GovernanceToken public governanceToken;

    struct Member {
        bool isApproved;
        bool hasPassedKYC;
        uint256 votingPower;
    }

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        bool executed;
    }

    mapping(address => Member) public members;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => mapping(uint256 => bool)) public hasVoted;
    mapping(address => address) public delegates;

    uint256 public proposalCount;
    uint256 public votingPeriod = 3 days;
    uint256 public quorumPercentage = 10;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event MemberAdded(address member);
    event MemberRemoved(address member);
    event KYCStatusUpdated(address member, bool status);
    event ProposalCreated(uint256 indexed proposalId, address proposer, string description);
    event Voted(uint256 indexed proposalId, address voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);
    event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate);

    constructor(address _governanceToken) {
        governanceToken = GovernanceToken(_governanceToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function addMember(address _member) external onlyRole(ADMIN_ROLE) {
        require(!members[_member].isApproved, "Member already exists");
        members[_member] = Member(true, false, 0);
        emit MemberAdded(_member);
    }

    function removeMember(address _member) external onlyRole(ADMIN_ROLE) {
        require(members[_member].isApproved, "Member does not exist");
        delete members[_member];
        emit MemberRemoved(_member);
    }

    function updateKYCStatus(address _member, bool _status) external onlyRole(ADMIN_ROLE) {
        require(members[_member].isApproved, "Member does not exist");
        members[_member].hasPassedKYC = _status;
        governanceToken.setKYCStatus(_member, _status);
        emit KYCStatusUpdated(_member, _status);
    }

    function createProposal(string memory _description) external {
        require(members[msg.sender].isApproved, "Not a member");
        require(members[msg.sender].hasPassedKYC, "KYC not passed");
        require(votingPower(msg.sender) > 0, "No voting power");
        
        uint256 proposalId = proposalCount++;
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            description: _description,
            forVotes: 0,
            againstVotes: 0,
            startTime: block.timestamp,
            executed: false
        });

        emit ProposalCreated(proposalId, msg.sender, _description);
    }

    function vote(uint256 _proposalId, bool _support) external {
        require(members[msg.sender].isApproved, "Not a member");
        require(members[msg.sender].hasPassedKYC, "KYC not passed");
        require(!hasVoted[msg.sender][_proposalId], "Already voted");
        require(block.timestamp <= proposals[_proposalId].startTime + votingPeriod, "Voting period has ended");

        uint256 weight = votingPower(msg.sender);
        require(weight > 0, "No voting power");

        if (_support) {
            proposals[_proposalId].forVotes += weight;
        } else {
            proposals[_proposalId].againstVotes += weight;
        }

        hasVoted[msg.sender][_proposalId] = true;
        emit Voted(_proposalId, msg.sender, _support, weight);
    }

    function executeProposal(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp > proposal.startTime + votingPeriod, "Voting period has not ended");
        require(!proposal.executed, "Proposal already executed");

        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        uint256 quorumVotes = (governanceToken.totalSupply() * quorumPercentage) / 100;

        require(totalVotes >= quorumVotes, "Quorum not reached");
        require(proposal.forVotes > proposal.againstVotes, "Proposal not passed");

        proposal.executed = true;
        emit ProposalExecuted(_proposalId);

        // Here you would implement the actual execution of the proposal
    }

    function delegate(address delegatee) external {
        require(members[msg.sender].isApproved, "Not a member");
        require(members[msg.sender].hasPassedKYC, "KYC not passed");
        require(delegatee != address(0), "Cannot delegate to zero address");
        address currentDelegate = delegates[msg.sender];
        delegates[msg.sender] = delegatee;
        emit DelegateChanged(msg.sender, currentDelegate, delegatee);
    }

    function votingPower(address account) public view returns (uint256) {
        address delegatee = delegates[account];
        if (delegatee == address(0)) {
            return governanceToken.balanceOf(account) + members[account].votingPower;
        } else {
            return governanceToken.balanceOf(delegatee) + members[delegatee].votingPower;
        }
    }

    function setVotingPeriod(uint256 _votingPeriod) external onlyRole(ADMIN_ROLE) {
        votingPeriod = _votingPeriod;
    }

    function setQuorumPercentage(uint256 _quorumPercentage) external onlyRole(ADMIN_ROLE) {
        require(_quorumPercentage > 0 && _quorumPercentage <= 100, "Invalid quorum percentage");
        quorumPercentage = _quorumPercentage;
    }

    function setMemberVotingPower(address _member, uint256 _votingPower) external onlyRole(ADMIN_ROLE) {
        require(members[_member].isApproved, "Member does not exist");
        members[_member].votingPower = _votingPower;
    }
}