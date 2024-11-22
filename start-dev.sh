#!/bin/bash

# Print colorful messages
print_message() {
    echo -e "\033[1;34m>>> $1\033[0m"
}

# Error handling
set -e
trap 'echo -e "\033[1;31mAn error occurred. Exiting...\033[0m"' ERR

# Check for EXPO_TOKEN environment variable
if [ -n "$EXPO_TOKEN" ]; then
    print_message "Logging into Expo..."
    echo "y" | npx expo login --non-interactive -t $EXPO_TOKEN
fi

# Update from git
print_message "Fetching latest changes from git..."
git fetch origin
git reset --hard origin/main

# Clean installation
print_message "Cleaning previous installation..."
rm -rf node_modules package-lock.json
rm -rf .expo
npm cache clean --force

# Install dependencies
print_message "Installing dependencies..."
npm install --legacy-peer-deps

# Start the app with debug logging
print_message "Starting Expo with debug logging..."
EXPO_DEBUG=1 EXPO_NO_DOTENV=1 npx expo start --tunnel --clear
