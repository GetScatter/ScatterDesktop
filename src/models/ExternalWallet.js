import IdGenerator from '../util/IdGenerator';
import ecc from 'eosjs-ecc'

export const EXT_WALLET_TYPES = {
    DIY:'Scatter/LiquidEOS DIY Hardware Wallet'
};

export const EXT_WALLET_TYPES_ARR = Object.keys(EXT_WALLET_TYPES).map(x => EXT_WALLET_TYPES[x]);

export default class ExternalWallet {

    constructor(_type = EXT_WALLET_TYPES.DIY){
        this.id = IdGenerator.text(64);
        this.type = _type;
        this.interface = typeToInterface(_type);
    }

    static placeholder(){ return new ExternalWallet(); }
    static fromJson(json){
        let p = Object.assign(this.placeholder(), json);
        p.interface = typeToInterface(p.type);
        return p;
    }

}

const get = async route => {
    return Promise.race([
        fetch(route).then(res => res.json()).catch(() => null),
        new Promise(resolve => setTimeout(() => resolve(null), 60000))
    ])
}
const post = async (route, data) => {
    return Promise.race([
        fetch(route, {
            method: "POST",
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => res.json()).catch(() => null),
        new Promise(resolve => setTimeout(() => resolve(null), 120000))
    ])
};



const typeToInterface = type => {
    switch(type){
        case EXT_WALLET_TYPES.DIY:
            const url = 'http://raspberrypi.local:3000';
            return new ExternalWalletInterface({
                sign(publicKey, trx, abi){ return post(url, {publicKey, trx, abi}).then(res => {
                    if(!res || !res.hasOwnProperty('signature')) return null;
                    return res.signature;
                })},
                getPublicKey(){ return get(url).then(res => {
                    if(!res) return null;
                    return res.key
                })}
            });
            break;
    }
};

export class ExternalWalletInterface {

    constructor(handler){
        this.handler = handler;
    }

    async sign(publicKey, trx, abi){
        // return new Promise(resolve => {
        //     resolve(ecc.sign(trx.buf, '5KRg7HTvt98CSvrqsUqyH2TYm2agYZ1k6eWEWMpgg7WLRodMPWb'));
        // });
        return await this.handler.sign(publicKey, trx, abi);
    }

    async getPublicKey(){
        // return new Promise(resolve => {
        //     resolve('EOS5J8cV3ER6rEkFrGYL3SZr1YP3WiU7neqPEFnNfU4goEfX2PFpS')
        // });
        return await this.handler.getPublicKey();
    }

}

