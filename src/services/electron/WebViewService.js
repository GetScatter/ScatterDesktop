let webView;
export default class WebViewService {

	static set(_wv){
		console.log('setting wv', webView, _wv)
		webView = _wv;
	}

	static get(){
		return webView;
	}

}