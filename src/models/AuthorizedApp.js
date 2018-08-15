import Hasher from '../util/Hasher';

export default class AuthorizedApp {

    constructor(_origin, _appkey){
        this.origin = _origin;
        this.appkey = _appkey;
        this.createdAt = +new Date();
    }

    static placeholder(){ return new AuthorizedApp(); }
    static fromJson(json){ return Object.assign(this.placeholder(), json); }
    checkKey(hashed){ return hashed === this.hashed(); }
    hashed(){ return Hasher.insecureHash(this.appkey); }
}