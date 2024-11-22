#!/bin/bash

# Ensure scripts are executable
chmod +x start-dev.sh reset-replit.sh

# Run the specified script
if [ "$1" = "start" ]; then
    ./start-dev.sh
elif [ "$1" = "reset" ]; then
    ./reset-replit.sh
else
    echo "Usage: ./setup-permissions.sh [start|reset]"
    echo "  start - Run start-dev.sh"
    echo "  reset - Run reset-replit.sh"
fi
