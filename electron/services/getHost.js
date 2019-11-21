const {getSimpleMode} = require('./storage');
// getHost
module.exports = () => {
	if(process.env.LOCAL_TESTING) return process.env.LOCAL_TESTING;
	return getSimpleMode() ? process.env.WEB_HOST_SIMPLE_MODE : process.env.WEB_HOST;

};
