import IdGenerator from '../util/IdGenerator';
import ecc from 'eosjs-ecc'

import {Blockchains} from './Blockchains'
import LedgerWallet from './hardware/LedgerWallet';
import LiquidEOS from './hardware/LiquidEOS';

export const EXT_WALLET_TYPES = {
    LEDGER:'Ledger Nano S',
    LIQUID_EOS:'Scatter/LiquidEOS DIY Hardware Wallet'
};

export const EXT_WALLET_TYPES_ARR = Object.keys(EXT_WALLET_TYPES).map(x => EXT_WALLET_TYPES[x]);

export default class ExternalWallet {

    constructor(_type = EXT_WALLET_TYPES.LEDGER, _blockchain = Blockchains.EOSIO){
        this.id = IdGenerator.text(64);
        this.type = _type;
        this.blockchain = _blockchain;
        this.interface = getInterface(_type, _blockchain);
        this.addressIndex = 0;
    }

    static placeholder(){ return new ExternalWallet(); }
    static fromJson(json){
        let p = Object.assign(this.placeholder(), json);
        p.interface = getInterface(p.type, p.blockchain);
        p.interface.setAddressIndex(p.addressIndex);
        return p;
    }
}

const getInterface = (type, blockchain) => {
    switch(type){
        case EXT_WALLET_TYPES.LEDGER: return LedgerWallet.typeToInterface(blockchain);
        case EXT_WALLET_TYPES.LIQUID_EOS: return LiquidEOS.typeToInterface();
    }
}

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

    canConnect(){
        return this.handler.canConnect();
    }

    setAddressIndex(path){
        return this.handler.setAddressIndex(path);
    }

    availableBlockchains(){
        return this.handler.availableBlockchains();
    }

    reset(){
        return this.handler.reset();
    }

}

