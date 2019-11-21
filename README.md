# Scatter Desktop

Scatter desktop is a cutting-egde wallet for blockchain as well as a global local-machine authentication provider.

## Installation

#### [CLICK HERE AND GRAB THE LATEST RELEASE](https://github.com/GetScatter/ScatterDesktop/releases)
Once you have a release build just install it and away you go.



### Running in development mode

This runs best with `node v10.15.3` and `electron v5.0.1`

- clone the repo
- run `yarn install` to install the dependencies.
- run `electron .` or `./node_modules/.bin/electron .` from the directory to start electron.

You will also need [ScatterEmbed](https://github.com/GetScatter/ScatterEmbed) running locally as this desktop client simply runs the wallet
software that protects keys and controls encryption.

Edit the `.env` file to point to your locally running version of Scatter Embed, or leave it as-is to run it with our live version.



### Building

- `npm run release-mac` or `npm run release-windows` or `npm run release-linux` ( you must build from the target machine )




