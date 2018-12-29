import IdGenerator from "../../util/IdGenerator";

export const HISTORY_TYPES = {
	Transfer:'transfer',
	Exchange:'exchange'
};

export default class History {

	constructor(type){
		this.id = IdGenerator.text(24);
		this.type = type;
		this.timestamp = +new Date();
	}
}