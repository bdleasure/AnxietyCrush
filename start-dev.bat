@echo off
echo [94m>>> Fetching latest changes from git...[0m
git fetch origin
git reset --hard origin/main

echo [94m>>> Cleaning previous installation...[0m
rd /s /q node_modules 2>nul
del /f /q package-lock.json 2>nul
rd /s /q .expo 2>nul
call npm cache clean --force

echo [94m>>> Installing dependencies...[0m
call npm install --legacy-peer-deps

echo [94m>>> Starting Expo with tunnel mode...[0m
set EXPO_NO_DOTENV=1
call npx expo start --tunnel --clear
