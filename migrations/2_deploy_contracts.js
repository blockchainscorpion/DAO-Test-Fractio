const GovernanceToken = artifacts.require('GovernanceToken');
const Governance = artifacts.require('Governance');

module.exports = async function (deployer, network, accounts) {
  // Deploy GovernanceToken
  await deployer.deploy(GovernanceToken, 'Governance Token', 'GOV');
  const governanceToken = await GovernanceToken.deployed();

  // Deploy Governance with GovernanceToken address and voting period (e.g., 1 day in seconds)
  const votingPeriod = 86400; // 1 day in seconds
  await deployer.deploy(Governance, governanceToken.address, votingPeriod);
};
