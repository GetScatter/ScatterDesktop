# Scatter Desktop
### Open Beta is now Live!

----------------



## Open Beta Rules

There are some safety rules right now while Scatter Desktop is in open-beta. Though the same security 
measures done on the chrome extension were taken it is always best not to use expose large quantities of funds 
to software that has not been tested by large numbers yet.

- **Use fresh keypairs and accounts**. Do not use accounts with keys linked to other accounts.
- **Do not send large amounts of funds** to the addresses or accounts you are using in Scatter Desktop.

## Installation

**Because we are in Open Beta none of these package are signed yet.** Make sure you only download 
Scatter Desktop from this GitHub, and **NOWHERE ELSE**.

### [CLICK HERE AND GRAB THE LATEST RELEASE](https://github.com/GetScatter/ScatterDesktop/releases)

## Setup

Scatter now has internal help / wizards to help you set up every step of the way.
Click the "Help" menu from the sidebar to get started.

## Running Scatter

- clone the repo
- optionally check out a specific release
- - Latest Release: `git tag -l | tail -n 1`
- - List releases: `git tag -l`
- - Check out a release: `git checkout tags/(releasenumber)`
- run `npm i` to install the dependencies
- run `npm start` to start the local server with hot-reloading
- run `electron .` or `./node_modules/bin/electron .` from the directory to start electron.
