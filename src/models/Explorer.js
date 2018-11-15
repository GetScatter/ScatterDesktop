import IdGenerator from '../util/IdGenerator'

export default class Explorer {

    constructor(){
        this.raw = null;
        this.name = null;
        this.account = null;
        this.transaction = null;
        this.block = null;
    }

    static placeholder(){ return new Explorer(); }
    static fromJson(json){ return Object.assign(this.placeholder(), json); }
    static fromRaw(rawExplorer){
        return this.fromJson({
	        raw:rawExplorer,
	        name:rawExplorer.name,
	        account:x => rawExplorer.account.replace('{x}', x),
	        transaction:x => rawExplorer.transaction.replace('{x}', x),
	        block:x => rawExplorer.block.replace('{x}', x),
        });
    }

    parsed(){
    	return Explorer.fromRaw(this.raw);
    }
}
