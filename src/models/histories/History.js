import IdGenerator from "../../util/IdGenerator";

export const HISTORY_TYPES = {
	Transfer:'transfer',
	Exchange:'exchange',
	Action:'action'
};

export default class History {

	constructor(type, txid = ''){
		this.id = IdGenerator.text(24);
		this.type = type;
		this.timestamp = +new Date();
		this.txid = typeof txid === 'string' ? txid : '';
	}
}