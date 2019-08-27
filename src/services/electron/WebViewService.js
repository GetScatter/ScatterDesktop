let webView;
export default class WebViewService {

	static set(_wv){
		webView = _wv;
	}

	static get(){
		return webView;
	}

}