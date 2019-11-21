const childProcess = require('child_process');


const packages = [
	'core',
	'eosio',
	'tron',
	'bitcoin',
	'ethereum',
];

const args = process.argv.slice(2);
const isLocal = args[0] || false;

let installString = `yarn add `;

packages.map(pack => {
	installString += `${isLocal ? 'file:../../Libraries/walletpack/packages/' : '@walletpack/'}${pack} `
});

console.log(installString);
const p = childProcess.exec(installString);
p.on('error', function (err) { console.error(err); });
p.on('exit', function (code) { console.log('exited', code); });

