import ecc from 'eosjs-ecc';
const {PrivateKey} = ecc;

export default class Crypto {

    static async generatePrivateKey(){
        return PrivateKey.randomKey().toBuffer();
    }

}