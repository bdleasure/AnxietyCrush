#!/bin/bash
echo "Fetching latest changes..."
git fetch --all
echo "Resetting to origin/main..."
git reset --hard origin/main
echo "Done! Your Replit workspace is now synced with the latest changes."
