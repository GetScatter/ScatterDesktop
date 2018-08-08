import IdGenerator from '../util/IdGenerator';

export const EXT_WALLET_TYPES = {
    DIY:'Scatter/LiquidEOS DIY Hardware Wallet'
};

export const EXT_WALLET_TYPES_ARR = Object.keys(EXT_WALLET_TYPES).map(x => EXT_WALLET_TYPES[x]);

export default class ExternalWallet {

    constructor(_type = EXT_WALLET_TYPES.TEST){
        this.id = IdGenerator.text(64);
        this.type = _type;
        this.interface = typeToInterface(_type);
    }

}

const get = async route => fetch(route);
const post = async (route, data) => fetch('julia.php', {
    method: "POST",
    headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
}).then(res => res.json());

const typeToInterface = type => {
    switch(type){
        case EXT_WALLET_TYPES.TEST:
            const url = 'http://raspberrypi.local:3000';
            return new ExternalWalletInterface({
                sign(publicKey, trx, abi){ return post(url, {publicKey, trx, abi}) },
                getPublicKey(){ return get(url) }
            });
            break;
    }
};

export class ExternalWalletInterface {

    constructor(handler){
        this.handler = handler;
    }

    async sign(publicKey, trx, abi){
        return await this.handler.sign(publicKey, trx, abi);
    }

    async getPublicKey(){
        return await this.handler.getPublicKey();
    }

}

