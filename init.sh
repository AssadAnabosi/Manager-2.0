#!/bin/bash

is_docker_installed() {
    if command -v docker &>/dev/null; then
        return
    # check for Windows OS using uname -s
    elif [ "$(uname -s)" = "CYGWIN" ] || [ "$(uname -s)" = "MINGW" ] || [ "$(uname -s)" = "MSYS" ]; then
        if where docker &>/dev/null; then
            return
        fi
    fi

    echo "Docker is not installed or not found in PATH. Please install Docker before proceeding."
    exit 1
}

build() {
    echo "Building..."
    docker build -t manager-api ./server
    docker build -t manager-web ./client
    echo "Build complete."
}

compose() {
    echo "Starting docker-compose..."
    # Fall back to docker-compose if docker compose is not found [older versions]
    if docker compose version &>/dev/null; then
        docker compose up --build -d
    else
        docker-compose up --build -d
    fi
    echo "Docker-compose finished."
}

is_docker_installed

# Prompt user if no argument is provided
if [ -z "$1" ]; then
    echo "No option provided. Please choose an option:"
    echo "0) Exit"
    echo "1) Build"
    echo "2) Compose"
    read -p "Enter your choice: " option
    case $option in
    0) exit 0 ;;
    1) build ;;
    2) compose ;;
    *)
        echo "Invalid choice."
        exit 1
        ;;
    esac
else
    case $1 in
    build) build ;;
    compose) compose ;;
    *)
        echo "Invalid option. Use 'build' or 'compose'."
        exit 1
        ;;
    esac
fi
