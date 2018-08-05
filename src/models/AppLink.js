import IdGenerator from '../util/IdGenerator'

export class AppLinkPairing {

    constructor(plugin, pin){
        this.plugin = plugin;
        this.pin = pin;
        this.createdAt = +new Date();
    }

    unique(){ return this.plugin }
    static placeholder(){ return new AppLinkPairing(); }
    static fromJson(json){ return Object.assign(AppLinkPairing.placeholder(), json); }

}

export default class AppLink {

    constructor(_name = ''){
        this.id = IdGenerator.text(64);
        this.name = _name;

        // Listening to all links simultaneously will be very costly.
        // The user should pick and choose which are enabled by default.
        // For instance web, and maybe the game they play every day.
        this.enabledByDefault = false;
        this.isListening = false;

        // App Link Pairing
        this.whitelist = [];

        // Array<plugin | string>
        this.blacklist = [];
    }

    static placeholder(){ return new AppLink(); }
    static fromJson(json){
        let p = Object.assign(AppLink.placeholder(), json);
        if(json.hasOwnProperty('whitelist')) p.whitelist = json.whitelist.map(x => AppLinkPairing.fromJson(x));
        return p;
    }
    clone(){ return AppLink.fromJson(JSON.parse(JSON.stringify(this))) }
    static defaultAppLink(){
        return AppLink.fromJson({
            id:'scatter',
            name:'Scatter Default App Link',
            enabledByDefault:true,
            isListening:true
        })
    }

    isDefault(){
        return this.id === 'scatter';
    }

    nextId(){
        this.id = IdGenerator.text(64);
    }

}