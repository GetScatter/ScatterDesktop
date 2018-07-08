import NodeRSA from 'node-rsa';

const pkcs = 'pkcs8';

export default class RSAService {

    static generateKeypair(){
        const key = new NodeRSA({ b: 512 });
        key.setOptions({ encryptionScheme: 'pkcs1' });
        const publicKey = key.exportKey(`${pkcs}-public-pem`);
        const privateKey = key.exportKey(`${pkcs}-private-pem`);
        return [key, publicKey, privateKey];
    }

    static privateToKey(data){
        const key = new NodeRSA({ b: 512 });
        key.importKey(data, pkcs);
        return key;
    }

    static publicToKey(data){
        const key = new NodeRSA({ b: 512 });
        key.importKey(data, `${pkcs}-public-pem`);
        return key;
    }

    static keyToPublicKey(key){
        return key.exportKey(`${pkcs}-public-pem`)
    }

    static encrypt(data, key){
        return key.encryptPrivate(JSON.stringify(data), 'base64', 'utf8');
    }

    static decrypt(data, key){
        try {return JSON.parse(key.decryptPublic(data, 'utf8'));}
        catch(e){ return null; }
    }

}