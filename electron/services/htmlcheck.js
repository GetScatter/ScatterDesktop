const {dialog} = require('electron');
const {GET} = require("@walletpack/core/services/apis/BackendApiService");
const sha256 = require('eosjs-ecc').sha256;
const HOST = process.env.WEB_HOST;

const getIndexHTML = () => {
	return fetch(HOST).then(x => x.text()).catch(() => null);
};

const getJavaScriptSource = filename => {
	return fetch(`${HOST}/${filename}`).then(x => x.text()).catch(() => null);
};

class WebHashChecker {

	static async check(){
		const ERR_TITLE = 'Scatter Embed Check Failure';
		const BASIC_ERR = `Your desktop client could not make a connection with our web wallet embed, so it can't verify that it is safe to use. If you are in a country which restricts IPs such as China or Russia, you may need to enable a proxy.`;
		const html = await getIndexHTML();
		if(!html) return dialog.showErrorBox(
			ERR_TITLE,
			BASIC_ERR
		);

		const mainBundle = await getJavaScriptSource('main.bundle.js');
		if(!mainBundle) return dialog.showErrorBox(
			ERR_TITLE,
			BASIC_ERR
		);

		const bundleSources = {};
		for(let i = 0; i < 30; i++){
			const src = await getJavaScriptSource(`${i}.bundle.js`);
			if(!src) console.error('no source for ', i);
			else {
				bundleSources[i] = sha256(src);
			}
		}

		const bundleHash = sha256([sha256(html), sha256(mainBundle)].concat(Object.keys(bundleSources).sort().map(key => {
			return bundleSources[key];
		})).join(''));

		// Don't do checks when running on localhost as the hash is variable
		if(process.env.WEB_HOST.indexOf('http://localhost:') === 0) return true;

		const apiHash = await GET(`embed/hash`).then(x => x.json()).catch(() => null);
		if(!apiHash) return dialog.showErrorBox(
			ERR_TITLE,
			`Scatter failed to make a connection with our API which is used to verify the hash of the web wallet embed. If you are in a country which restricts IPs such as China or Russia, you may need to enable a proxy.`
		);

		if(apiHash !== bundleHash) return dialog.showErrorBox(
			ERR_TITLE,
			`The hash created from the web wallet embed does not match the hash returned from our secure API. This could be due to an update happening right now. Please try again in a moment. If this problem persists please contact support immediately at support@get-scatter.com, or on Telegram on the @Scatter channel, or Twitter at @Get_Scatter.`
		);

		return true;
	}

}

module.exports = WebHashChecker;