const GovernanceToken = artifacts.require('GovernanceToken');
const Governance = artifacts.require('Governance');

module.exports = async function (deployer, network, accounts) {
  // Deploy GovernanceToken
  await deployer.deploy(GovernanceToken, 'Governance Token', 'GOV');
  const governanceToken = await GovernanceToken.deployed();

  // Deploy Governance with GovernanceToken address and voting period (e.g., 1 day in seconds)
  const votingPeriod = 3 * 24 * 60 * 60; // 1 day in seconds
  await deployer.deploy(Governance, governanceToken.address, votingPeriod);
  // Deploy Governance with GovernanceToken address and voting period (e.g., 3 days in seconds)
};
