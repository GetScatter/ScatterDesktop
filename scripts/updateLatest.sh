#!/bin/sh

# Updates repository and sets Scatter up to the most recent commit

echo "Pulling latest changes"
git reset --hard
git clean -xdf
git checkout master
git pull

echo "Installing dependencies"
rm -r node_modules
npm i

echo ""
echo "Updated to most recent commit! Run scripts/run.sh to start Scatter."
