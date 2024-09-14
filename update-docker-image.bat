@echo off

REM Run truffle migrate
call truffle migrate

REM Check if migration was successful
if %ERRORLEVEL% EQU 0 (
    echo Truffle migration successful. Rebuilding Docker image...
    
    REM Build the Docker image
    docker build -t dao-test .
    
    REM Check if Docker build was successful
    if %ERRORLEVEL% EQU 0 (
        echo Docker image rebuilt successfully.
    ) else (
        echo Error: Docker build failed.
        exit /b 1
    )
) else (
    echo Error: Truffle migration failed.
    exit /b 1
)