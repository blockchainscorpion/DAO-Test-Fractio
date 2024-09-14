# DAO-Test Project

## Overview

DAO-Test-Fractio is a decentralized autonomous organization (DAO) implementation project built using Solidity smart contracts and a React frontend. This project aims to demonstrate the core functionalities of a DAO for Fractio's platform, including membership management, proposal creation, voting, and execution.

## Project Structure

```
DAO-Test/
│
├── contracts/
│   └── Governance.sol
│
├── migrations/
│   └── 2_deploy_contracts.js
│
├── test/
│   └── governance.js
│
├── Dockerfile
├── update-docker-image.sh
├── truffle-config.js
├── package.json
└── README.md
```

## Smart Contracts

### Governance.sol

This is the main smart contract for the DAO. It includes functionality for:

- Membership management (adding/removing members, updating KYC status)
- Proposal creation
- Voting on proposals
- Proposal execution
- Admin functions (setting quorum percentage and voting period)

## Setup and Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/DAO-Test.git
   cd DAO-Test
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

5. Run tests:
   ```
   truffle test
   ```

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

# DAO-Test Project

## Docker

This project includes a Dockerfile for easy containerization.

### Building the Docker Image

To build the Docker image:

```
docker build -t dao-test .
```

### Running the Docker Container

To run the Docker container:

```
docker run -p 3000:3000 dao-test
```

### Automatic Docker Image Update

The project includes a script to automatically update the Docker image after each `truffle migrate`.

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
   update-docker-image.bat
   ```

This script will run `truffle migrate`, and if successful, it will rebuild the Docker image.

## Testing

The project includes a comprehensive test suite for the Governance contract. To run the tests:

```
truffle test
```

## Future Development

- Frontend development using React
- Integration with Web3.js for interacting with the smart contract
- Implementation of additional DAO features and improvements

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Project Structure

```
DAO-Test/
│
├── contracts/
│   └── Governance.sol
│
├── migrations/
│   └── 2_deploy_contracts.js
│
├── test/
│   └── governance.js
│
├── truffle-config.js
├── package.json
└── README.md
```

## Smart Contracts

### Governance.sol

This is the main smart contract for the DAO. It includes functionality for:

- Membership management (adding/removing members, updating KYC status)
- Proposal creation
- Voting on proposals
- Proposal execution
- Admin functions (setting quorum percentage and voting period)

## Setup and Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/DAO-Test.git
   cd DAO-Test
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

5. Run tests:
   ```
   truffle test
   ```

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

## Testing

The project includes a comprehensive test suite for the Governance contract. To run the tests:

```
truffle test
```

## Future Development

- Frontend development using React
- Integration with Web3.js for interacting with the smart contract
- Implementation of additional DAO features and improvements

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
