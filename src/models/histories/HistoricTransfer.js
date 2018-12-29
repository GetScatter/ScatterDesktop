import History, {HISTORY_TYPES} from "./History";

export default class HistoricTransfer extends History {


	constructor(from, to, token, amount, memo = null){
		super(HISTORY_TYPES.Transfer);
		this.from = from;
		this.to = to;
		this.token = token;
		this.amount = amount;
		this.memo = memo;
	}

	static placeholder(){ return new HistoricTransfer(); }
	static fromJson(json){ return Object.assign(this.placeholder(), json); }

}