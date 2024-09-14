#!/bin/bash

# Compile the smart contracts
echo "Compiling smart contracts..."
truffle compile

# Check if compilation was successful
if [ $? -eq 0 ]; then
    echo "Compilation successful. Running truffle migrate..."
    
    # Run truffle migrate
    truffle migrate

    # Check if migration was successful
    if [ $? -eq 0 ]; then
        echo "Truffle migration successful. Rebuilding Docker image..."
        
        # Build the Docker image
        docker build -t dao-test .
        
        # Check if Docker build was successful
        if [ $? -eq 0 ]; then
            echo "Docker image rebuilt successfully."
        else
            echo "Error: Docker build failed."
            exit 1
        fi
    else
        echo "Error: Truffle migration failed."
        exit 1
    fi
else
    echo "Error: Compilation failed."
    exit 1
fi