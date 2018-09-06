#!/bin/sh

# Starts scatter from the current directory. You may want to run scripts/updateRelease.sh or scripts/updateLatest.sh first!

# The first time you run npm start it will download a bunch of stuff, and electron will show a white screen,
# killing the script and running a second time should work. Todo: Detect and handle this better


echo "Launching server..."
npm start &

echo "Launching Scatter GUI..."
echo "If this fails install Electron and retry: 'npm i -g electron'"

electron .
