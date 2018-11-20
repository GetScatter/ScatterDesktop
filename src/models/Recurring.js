export default class Recurring {

	constructor(){
		// { account:unique, timestamp, proxy }
		this.proxies = [];
		this.payments = [];
	}

	static placeholder(){ return new Recurring(); }
	static fromJson(json){ return Object.assign(this.placeholder(), json); }
}