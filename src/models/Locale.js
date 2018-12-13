export default class Locale {

	constructor(){
		this.raw = null;
		this.name = null;
		this.methods = {};
		this.locales = {};
	}
	static placeholder(){ return new Locale(); }
	static fromJson(json){ return Object.assign(this.placeholder(), json); }

	static fromRaw(raw){
		if(!raw) return this.placeholder();

		const p = this.placeholder();
		p.raw = raw;
		p.name = raw.name;

		raw.methods.map(x => {
			p.methods[x.name] = new Function(x.args, x.body);
		});

		Object.keys(raw.locales).map(key => {
			p.locales[key] = (x) => {
				const parseString = s => {
					s = s.replace('{x}', x);
					Object.keys(p.methods).map(method => s = s.replace(`{${method}}`, p.methods[method](x)));
					return s;
				};

				if(typeof raw.locales[key] === 'string') return parseString(raw.locales[key]);
				else return raw.locales[key].map(x => parseString(x));
			}
		});

		return p;
	}

	parsed(){
		return Locale.fromRaw(JSON.parse(this.raw));
	}

}