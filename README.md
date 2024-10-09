# DAO-Test-Fractio Project

## Overview

DAO-Test-Fractio is a decentralized autonomous organization (DAO) implementation project built using Solidity smart contracts. This project demonstrates the core functionalities of a DAO for Fractio's platform, including membership management, proposal creation, voting, and execution.

## Project Structure

```
DAO-Test-Fractio/
│
├── contracts/
│   ├── Governance.sol
│   ├── GovernanceToken.sol
│   └── Migrations.sol
│
├── migrations/
│   ├── 1_initial_migration.js
│   └── 2_deploy_contracts.js
│
├── test/
│   ├── governance.test.js
│   └── GovernanceToken.test.js
│
├── .github/
│   └── dependabot.yml
│
├── .vscode/
│   └── (VS Code configuration files)
│
├── Dockerfile
├── Dockerfile.MACOS
├── update-docker-image.bat
├── truffle-config.js
├── package.json
├── package-lock.json
├── README.md
└── SECURITY.md
```

## Smart Contracts

### Governance.sol

The main smart contract for the DAO. It includes functionality for:

- Membership management (adding/removing members, updating KYC status)
- Proposal creation and voting
- Proposal execution
- Admin functions (setting quorum percentage and voting period)

### GovernanceToken.sol

An ERC20 token contract that represents voting power in the DAO. It includes:

- Minting functionality
- KYC status management
- Transfer restrictions based on KYC status

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/DAO-Test-Fractio.git
   cd DAO-Test-Fractio
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Install Truffle globally (if not already installed):
   ```
   npm install -g truffle
   ```

4. Compile the smart contracts:
   ```
   truffle compile
   ```

## Testing

Run the test suite using Truffle:

```
truffle test
```

All tests are currently passing, covering various aspects of the Governance and GovernanceToken contracts.

## Deployment

To deploy the smart contracts to a local blockchain (like Ganache):

1. Start Ganache (or your preferred local blockchain)

2. Deploy the contracts:
   ```
   truffle migrate
   ```

To deploy to a testnet or mainnet, update the `truffle-config.js` file with the appropriate network settings and use:

```
truffle migrate --network <network-name>
```

## Docker Support

The project includes Dockerfile and Dockerfile.MACOS for containerization.

### Building the Docker Image

```
docker build -t dao-test-fractio .
```

### Running the Docker Container

```
docker run -p 3000:3000 dao-test-fractio
```

### Automatic Docker Image Update

The project includes scripts to automatically update the Docker image after each `truffle migrate`.

#### For Unix-based systems (Linux, macOS):

1. Make the script executable:

   ```
   chmod +x update-docker-image.sh
   ```

2. Run the script:
   ```
   ./update-docker-image.sh
   ```

#### For Windows:

1. Ensure the script is named `update-docker-image.bat`

2. Run the script:
   ```
   .\update-docker-image.bat
   ```

These scripts will run `truffle migrate`, and if successful, they will rebuild the Docker image.

## Testing

The project includes a comprehensive test suite for the Governance and GovernanceToken contracts. To run the tests:

```
truffle console  # Runs truffle development console
test             # Runs the test script (no need for 'truffle' prefix in console)
```

## Security

Please refer to the `SECURITY.md` file for information on reporting vulnerabilities and our security policies.

## Future Development

- Frontend development using React
- Integration with Web3.js for interacting with the smart contracts
- Implementation of additional DAO features and improvements

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.