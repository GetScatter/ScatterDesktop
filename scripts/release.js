require('dotenv').config();
const childProcess = require('child_process');

const quit = msg => {
	console.error(msg);
	process.exit(0);
};

const platform = process.argv.slice(2)[0];
if(!platform) return quit('Please run as `yarn release [win/linux/mac]`');
console.log('Building for platform: ', platform);

if(process.env.LOCAL_TESTING) return quit('LOCAL_TESTING is enabled');
if(process.env.FORCE_STAGING) return quit('FORCE_STAGING is enabled');
if(!process.env.WEB_HOST || process.env.WEB_HOST.indexOf('staging') > -1) return quit('WEB_HOST is missing or is staging');
if(!process.env.WEB_HOST_SIMPLE_MODE || process.env.WEB_HOST_SIMPLE_MODE.indexOf('staging') > -1) return quit('WEB_HOST_SIMPLE_MODE is missing or is staging');

const run = (cmd, callback = () => {}) => {
	console.log('running: ', cmd)

	const p = childProcess.exec(cmd);
	p.stdout.on('data', ( data ) => console.log(data));
	p.on('error', function (err) { console.error(err); });
	p.on('exit', function (code) { console.log('exited', code); callback(); });
}

run(`yarn install`, () => {
	run(`electron-builder --${platform} --publish=never`);
})
