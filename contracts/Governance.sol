// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Governance {
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        uint256 startTime;
        uint256 endTime;
    }

    struct Member {
        bool isApproved;
        bool hasPassedKYC;
        uint256 votingPower;
    }

    Proposal[] public proposals;
    mapping(address => Member) public members;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    uint256 public quorumPercentage = 50; // 50% quorum
    uint256 public votingPeriod = 3 days;
    uint256 public totalVotingPower;

    address public admin;

    event ProposalCreated(uint256 proposalId, address proposer, string description);
    event Voted(uint256 proposalId, address voter, bool support);
    event ProposalExecuted(uint256 proposalId);
    event MemberAdded(address member);
    event MemberRemoved(address member);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyMember() {
        require(members[msg.sender].isApproved, "Only approved members can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
        members[msg.sender] = Member(true, true, 1);
        totalVotingPower = 1;
    }

    function addMember(address _newMember, uint256 _votingPower) external onlyAdmin {
        require(!members[_newMember].isApproved, "Member already exists");
        members[_newMember] = Member(true, false, _votingPower);
        totalVotingPower += _votingPower;
        emit MemberAdded(_newMember);
    }

    function removeMember(address _member) external onlyAdmin {
        require(members[_member].isApproved, "Member does not exist");
        totalVotingPower -= members[_member].votingPower;
        delete members[_member];
        emit MemberRemoved(_member);
    }

    function updateKYCStatus(address _member, bool _kycPassed) external onlyAdmin {
        require(members[_member].isApproved, "Member does not exist");
        members[_member].hasPassedKYC = _kycPassed;
    }

    function createProposal(string memory _description) external onlyMember {
        require(members[msg.sender].hasPassedKYC, "Member has not passed KYC");
        uint256 proposalId = proposals.length;
        proposals.push(Proposal({
            id: proposalId,
            proposer: msg.sender,
            description: _description,
            forVotes: 0,
            againstVotes: 0,
            executed: false,
            startTime: block.timestamp,
            endTime: block.timestamp + votingPeriod
        }));
        emit ProposalCreated(proposalId, msg.sender, _description);
    }

    function vote(uint256 _proposalId, bool _support) external onlyMember {
        require(members[msg.sender].hasPassedKYC, "Member has not passed KYC");
        require(_proposalId < proposals.length, "Proposal does not exist");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");
        require(block.timestamp <= proposals[_proposalId].endTime, "Voting period has ended");

        Proposal storage proposal = proposals[_proposalId];
        if (_support) {
            proposal.forVotes += members[msg.sender].votingPower;
        } else {
            proposal.againstVotes += members[msg.sender].votingPower;
        }
        hasVoted[_proposalId][msg.sender] = true;
        emit Voted(_proposalId, msg.sender, _support);
    }

    function executeProposal(uint256 _proposalId) external onlyMember {
        require(_proposalId < proposals.length, "Proposal does not exist");
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(block.timestamp > proposal.endTime, "Voting period has not ended");

        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        require(totalVotes >= (totalVotingPower * quorumPercentage) / 100, "Quorum not reached");

        if (proposal.forVotes > proposal.againstVotes) {
            proposal.executed = true;
            // Execute the proposal (implementation depends on the specific actions required)
            emit ProposalExecuted(_proposalId);
        }
    }

    function setQuorumPercentage(uint256 _newQuorumPercentage) external onlyAdmin {
        require(_newQuorumPercentage > 0 && _newQuorumPercentage <= 100, "Invalid quorum percentage");
        quorumPercentage = _newQuorumPercentage;
    }

    function setVotingPeriod(uint256 _newVotingPeriod) external onlyAdmin {
        require(_newVotingPeriod > 0, "Invalid voting period");
        votingPeriod = _newVotingPeriod;
    }
}