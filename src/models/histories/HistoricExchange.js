import History, {HISTORY_TYPES} from "./History";

export default class HistoricExchange extends History {


	constructor(from, to, fromToken, toToken, orderDetails){
		super(HISTORY_TYPES.Exchange);
		this.from = from;
		this.to = to;
		this.fromToken = fromToken;
		this.toToken = toToken;
		this.orderDetails = orderDetails;
	}

	static placeholder(){ return new HistoricExchange(); }
	static fromJson(json){ return Object.assign(this.placeholder(), json); }

}