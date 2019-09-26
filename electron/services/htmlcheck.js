const {GET} = require("@walletpack/core/services/apis/BackendApiService");
const sha256 = require('eosjs-ecc').sha256;
const HOST = `http://localhost:8081/`;

const getIndexHTML = () => {
	return fetch(HOST).then(x => x.text()).catch(() => null);
};

const getJavaScriptSource = filename => {
	return fetch(`${HOST}/${filename}`).then(x => x.text()).catch(() => null);
};

class WebHashChecker {

	static async check(){
		const html = await getIndexHTML();
		console.log('html', html);
		if(!html) return {error:'Could not get Scatter Embed "html" hash.'};

		const mainBundle = await getJavaScriptSource('main.bundle.js');
		if(!mainBundle) return {error:'Could not get Scatter Embed "mainBundle" hash.'};

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

		const apiHash = await GET(`embed/hash`).then(x => x.json()).catch(() => null);
		if(!apiHash) return {error:'Could not get Scatter Embed hash from API.'};

		console.log(bundleSources, bundleHash);
		return apiHash === bundleHash;
	}

}

module.exports = WebHashChecker;