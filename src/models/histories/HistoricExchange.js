import History, {HISTORY_TYPES} from "./History";
import Account from "../Account";
import Token from "../Token";

export default class HistoricExchange extends History {


	constructor(from, to, fromToken, toToken, orderDetails, txid = ''){
		super(HISTORY_TYPES.Exchange, txid);
		this.from = from;
		this.to = to;
		this.fromToken = fromToken;
		this.toToken = toToken;
		this.orderDetails = orderDetails;
		this.status = 'pending';
	}

	static placeholder(){ return new HistoricExchange(); }
	static fromJson(json){
		let p = Object.assign(this.placeholder(), json);
		p.from = Account.fromJson(json.from);
		p.fromToken = Token.fromJson(json.fromToken);
		p.toToken = Token.fromJson(json.toToken);
		return p;
	}

}