#!/bin/sh

# Updates repository and sets Scatter up to the most recent Release

echo "Pulling latest changes"
git reset --hard
git clean -xdf
git checkout master
git pull

release=`git tag -l | tail -n 1`
echo "Switching to release $release";
git checkout tags/$release --quiet

echo "Installing dependencies"
rm -r node_modules
npm i

echo ""
echo "Updated to most recent release! Run scripts/run.sh to start Scatter."
