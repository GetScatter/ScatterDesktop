const {app} = window.require('electron').remote;

export default class Meta {

    constructor(){
        this.version = app.getVersion();
        this.lastVersion = '0';
        this.acceptedTerms = false;
    }

    getVersion(){
        return app.getVersion()
    }

    regenerateVersion(){
        this.version = app.getVersion();
    }

    needsUpdating(){
        return this.version !== this.lastVersion;
    }

    static placeholder(){ return new Meta(); }
    static fromJson(json){ return Object.assign(this.placeholder(), json); }
}