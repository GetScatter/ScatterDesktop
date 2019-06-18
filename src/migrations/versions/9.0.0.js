import PluginRepository from '../../plugins/PluginRepository';
import {Blockchains} from '../../models/Blockchains'
import Crypto from '../../util/Crypto';
import {BlockchainsArray} from '../../models/Blockchains';
import {ipcAsync} from "../../util/ElectronHelpers";

export const m9_0_0 = async scatter => {
	const seed = await ipcAsync('seed');

    scatter.keychain.keypairs.map(x => {
        if(x.hasOwnProperty('publicKeys') && x.publicKeys.length) return false;



        x.decrypt(seed);

        if(!x.external) {
            x.privateKey = Crypto.privateKeyToBuffer(x.privateKey, x.blockchain);
            x.keyHash = Crypto.bufferToHash(x.privateKey);
            x.publicKeys = BlockchainsArray.map(b => (
                {blockchain:b.value, key:PluginRepository.plugin(b.value).privateToPublic(x.privateKey)}
            ));
        } else {
            x.publicKeys = [{blockchain:x.blockchain, key:x.publicKey}];
        }

        const oldUnique = `${x.blockchain}:${x.publicKey.toLowerCase()}`;
        delete x.publicKey;
        delete x.blockchain;

        scatter.keychain.accounts.map(account => {
            if(account.keypairUnique === oldUnique) {
                account.keypairUnique = x.id;
            }
        });

        x.encrypt(seed);
    });

    // Wiping out permissions
    scatter.keychain.permissions = [];

    return true;
};