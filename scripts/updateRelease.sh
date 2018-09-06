#!/bin/sh

# Updates repository and sets Scatter up to the most recent Release

echo "Pulling latest changes"
git checkout master
git reset --hard
git clean -xdf
git pull

release=`git tag -l | tail -n 1`
echo "Switching to release $release";
git checkout tags/$release --quiet

echo "Installing dependencies"
npm i

echo "Updated to most recent release! Run scripts/run.sh to start Scatter."
