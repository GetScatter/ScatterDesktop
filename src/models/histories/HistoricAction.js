import History, {HISTORY_TYPES} from "./History";
import Account from "../Account";
import Token from "../Token";

export default class HistoricAction extends History {


	constructor(account, action, txid = ''){
		super(HISTORY_TYPES.Action, txid);
		this.account = account instanceof Account ? account.unique() : account;
		this.action = action;
	}

	clone(){ return HistoricAction.fromJson(JSON.parse(JSON.stringify(this))) }
	static placeholder(){ return new HistoricAction(); }
	static fromJson(json){ return Object.assign(this.placeholder(), json); }

}