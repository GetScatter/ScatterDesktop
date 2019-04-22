export default class Firewall {

	constructor(){
		this.enabled = false;

		this.lastKnownBlock = 0;
	}

	static placeholder(){ return new Firewall(); }
	static fromJson(json){ return Object.assign(this.placeholder(), json); }
	clone(){ return Firewall.fromJson(JSON.parse(JSON.stringify(this))) }

}