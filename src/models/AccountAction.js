export default class AccountAction {
    constructor(title = '', description = '', icon = '', onclick = () => {}, danger = false){
        this.title = title;
        this.buttonText = description;
        this.icon = icon;
        this.onclick = onclick;
        this.isDangerous = danger;
    }

	static placeholder(){ return new AccountAction(); }
	static fromJson(json){ return Object.assign(this.placeholder(), json); }
}
