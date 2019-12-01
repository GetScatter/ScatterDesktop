const {getSimpleMode, getGeneralSetting} = require('./storage');
// getHost
module.exports = () => {
	if(process.env.LOCAL_TESTING) return process.env.LOCAL_TESTING;

	let host = getSimpleMode() ? process.env.WEB_HOST_SIMPLE_MODE : process.env.WEB_HOST;
	if(getGeneralSetting('testingMode') || process.env.FORCE_STAGING) host = 'staging.'+host;

	return `https://${host}`;
};
