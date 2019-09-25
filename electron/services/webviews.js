
let webviews = {};
class WebViews {

	static set(key, wv){
		console.log('setting wv', key, wv);
		webviews[key] = wv;
		return true;
	}

	static get(key){
		return webviews[key];
	}

}

module.exports = WebViews;