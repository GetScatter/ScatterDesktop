export default class AccountAction {
    constructor(title = '', description = '', onclick = () => {}){
        this.title = title;
        this.description = description;
        this.onclick = onclick;
    }

	static placeholder(){ return new AccountAction(); }
	static fromJson(json){ return Object.assign(this.placeholder(), json); }
}
