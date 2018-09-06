#!/bin/sh

# Updates repository and sets Scatter up to the most recent commit

echo "Pulling latest changes"
git checkout master
git reset --hard
git clean -xdf
git pull

echo "Installing dependencies"
npm i

echo "Updated to most recent commit! Run scripts/run.sh to start Scatter."
