import PluginRepository from '../../plugins/PluginRepository';
import {Blockchains} from '../../models/Blockchains'
import {store} from '../../store/store'
import Crypto from '../../util/Crypto';
import {BlockchainsArray} from '../../models/Blockchains';

export const m8_10_0 = async scatter => {

    scatter.keychain.keypairs.map(x => {
        x.decrypt(store.state.seed);
        if(!x.external) {
            x.privateKey = Crypto.privateKeyToBuffer(x.privateKey, x.blockchain);

            x.publicKeys = BlockchainsArray.map(x => {
                return {blockchain:x.value, key:PluginRepository.plugin(x.value).privateToPublic(x.privateKey)};
            });
        } else {
            x.publicKeys = [{blockchain:x.blockchain, key:x.publicKey}];
        }

        const oldUnique = `${x.blockchain}:${x.publicKey.toLowerCase()}`;
        delete x.publicKey;
        delete x.blockchain;

        scatter.keychain.accounts.map(account => {
            if(account.keypairUnique === oldUnique) {
                delete account.publicKey;
                account.keypairUnique = x.id;
            }
        });

        x.encrypt(store.state.seed);
    })

    // Wiping out permissions
    scatter.keychain.permissions = [];

    return true;
};