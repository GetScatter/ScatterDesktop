import History, {HISTORY_TYPES} from "./History";
import Account from "../Account";
import Token from "../Token";

export default class HistoricTransfer extends History {


	constructor(from, to, token, amount, memo = null, txid = ''){
		super(HISTORY_TYPES.Transfer, txid);
		this.from = from;
		this.to = to;
		this.token = token;
		this.amount = amount;
		this.memo = memo;
	}

	static placeholder(){ return new HistoricTransfer(); }
	static fromJson(json){
		let p = Object.assign(this.placeholder(), json);
		p.from = Account.fromJson(json.from);
		p.token = Token.fromJson(json.token);
		return p;
	}

}