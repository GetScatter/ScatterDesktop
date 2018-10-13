import * as Actions from '../models/api/ApiActions';
import Action from '../models/api/Action'
import {store} from '../store/store'
import * as StoreActions from '../store/constants'
import ObjectHelpers from '../util/ObjectHelpers'
import Hasher from '../util/Hasher'
import IdGenerator from '../util/IdGenerator'
import Crypto from '../util/Crypto'

import {Popup} from '../models/popups/Popup';
import PopupService from '../services/PopupService';
import AccountService from '../services/AccountService';
import PermissionService from '../services/PermissionService';
import KeyPairService from '../services/KeyPairService';
import ResourceService from '../services/ResourceService';
import PluginRepository from '../plugins/PluginRepository';
import {Blockchains} from '../models/Blockchains';

import Keypair from '../models/Keypair';
import Identity from '../models/Identity';
import {IdentityRequiredFields} from '../models/Identity';
import Account from '../models/Account';
import Error from '../models/errors/Error'
import Network from '../models/Network'

const {remote} = window.require('electron');
remote.getGlobal('appShared').ApiWatcher = (deepLink) => {
    console.log('using api from deep link', deepLink);
    ApiService.handleDeepLink(deepLink);
};

export default class ApiService {

    static handleDeepLink(deepLink){
        if(!deepLink) return;
        let [type, payload] = deepLink.toString().split('scatter://')[1].split('/?payload=');
        type = type.replace('/', '');
        if(payload) payload = decodeURI(payload);

        try { payload = JSON.parse(payload); } catch(e){}

        // Special case for transfers which just makes URLs prettier
        if(type === 'transfer'){
            type = 'requestTransfer';
            let [to, amount, blockchain, chainId, memo] = payload.split('/');
            if(!to || !blockchain || !chainId) return false;
            if(!memo) memo = '';

            const plugin = PluginRepository.plugin(blockchain);
            const token = plugin.defaultToken();
            const decimals = plugin.defaultDecimals();

            const network = store.state.scatter.settings.networks.find(x => x.blockchain === blockchain && x.chainId === chainId);
            if(!network) return;

            payload = {
                type,
                payload:{
                    network,
                    to,
                    amount,
                    options:{contract:token.account, symbol:token.symbol, memo, decimals}
                }
            };
        }

        if(typeof ApiService[type] !== 'undefined') ApiService[type](payload);
    }

    static async handler(request){
        const action = Action.fromJson(request);

        // Only accept pre-defined messages.
        if(!Object.keys(Actions).map(key => Actions[key]).includes(request.type)) return;

        return await this[request.type](request);
    }


    /***
     * Checks if an Identity has permissions for the origin
     * @param request
     * @returns {Promise.<*>}
     */
    static async [Actions.IDENTITY_FROM_PERMISSIONS](request){
        const perm = PermissionService.identityFromPermissions(request.payload.origin, true);
        return {id:request.id, result:PermissionService.identityFromPermissions(request.payload.origin, true)};
    }

    /***
     * Prompts the users for an Identity if there is no permission, otherwise returns the permission without
     * a prompt based on origin.
     * @param request
     * @returns {Promise}
     */
    static async [Actions.GET_OR_REQUEST_IDENTITY](request){
        return new Promise((resolve) => {

            const possibleId = PermissionService.identityFromPermissions(request.payload.origin);
            if(possibleId) return resolve({id:request.id, result:possibleId});

            PopupService.push(Popup.popout(request, ({result}) => {
                if(!result) return resolve({id:request.id, result:Error.signatureError("identity_rejected", "User rejected the provision of an Identity")});

                const identity = Identity.fromJson(result.identity);
                const accounts = (result.accounts || []).map(x => Account.fromJson(x));
                PermissionService.addIdentityOriginPermission(identity, accounts, request.payload.fields, request.payload.origin);


                // const returnableIdentity = Identity.asReturnedFields(request.payload.fields, identity);
                const returnableIdentity = identity.asOnlyRequiredFields(request.payload.fields);
                returnableIdentity.accounts = accounts.map(x => x.asReturnable());

                resolve({id:request.id, result:returnableIdentity});
            }));
        })
    }

    /***
     * Signs the origin with the Identity's private key.
     * @param request
     * @returns {Promise}
     */
    static async [Actions.AUTHENTICATE](request){
        return new Promise(async resolve => {
            const identity = PermissionService.identityFromPermissions(request.payload.origin);
            if(!identity) return resolve({id:request.id, result:Error.identityMissing()});

            const nonceError = new Error('invalid_nonce', 'You must provide a 12 character nonce for authentication');
            if(!request.payload.hasOwnProperty('nonce')) return resolve({id:request, result:nonceError});
            if(request.payload.nonce.length !== 12) return resolve({id:request, result:nonceError});

            // Prevention of origins being able to send data buffers to be
            // signed by the identity which could change to a real balance holding
            // key in the future.
            const data = Hasher.unsaltedQuickHash(
                Hasher.unsaltedQuickHash(request.payload.origin) +
                Hasher.unsaltedQuickHash(request.payload.nonce)
            );

            const plugin = PluginRepository.plugin(Blockchains.EOSIO);
            const signed = await plugin.signer({data}, identity.publicKey, true);
            resolve({id:request.id, result:signed});
        })
    }

    /***
     * Removes the identity permission for an origin from the user's Scatter,
     * effectively logging them out.
     * @param request
     * @returns {Promise.<*>}
     */
    static async [Actions.FORGET_IDENTITY](request){
        await PermissionService.removeIdentityPermission(request.payload.origin);
        return {id:request.id, result:true};
    }

    /***
     * Allows apps to request that the user provide a user-selected Public Key
     * to the app. ( ONBOARDING HELPER )
     * @param request
     * @returns {Promise.<*>}
     */
    static async [Actions.GET_PUBLIC_KEY](request){
        return new Promise((resolve, reject) => {
            PopupService.push(Popup.popout(request, async ({result}) => {
                if(!result) return resolve({id:request.id, result:null});

                const keypair = Keypair.fromJson(result.keypair);
                const publicKey = keypair.publicKeys.find(x => x.blockchain === request.payload.blockchain).key;

                if(result.isNew) {
                    await KeyPairService.saveKeyPair(keypair);
                    await AccountService.importAllAccounts(keypair);
                    resolve({id:request.id, result:publicKey});
                }
                else resolve({id:request.id, result:publicKey});
            }));
        })
    }

    /***
     * Allows the app to suggest that the user link new accounts on top of
     * public keys ( ONBOARDING HELPER )
     * @param request
     * @returns {Promise.<*>}
     */
    static async [Actions.LINK_ACCOUNT](request){
        return new Promise(async (resolve, reject) => {
            const scatter = store.state.scatter;
            let {publicKey, network, origin} = request.payload;

            network = Network.fromJson(Object.assign(network, {name:origin}));
            if(!network.isValid()) return resolve({id:request.id, result:Error.badNetwork()});

            const keypair = scatter.keychain.keypairs.find(x => x.publicKeys.map(x => x.key).includes(publicKey));
            if(!keypair) return resolve({id:request.id, result:Error.noKeypair()});

            let existingNetwork = scatter.settings.networks.find(x => x.unique() === network.unique());
            if(!existingNetwork) return resolve({id:request.id, result:Error.noNetwork()});

            await AccountService.importAllAccountsForNetwork(network);
            return resolve({id:request.id, result:true});
        })
    }

    /***
     * Prompts the user to add a new network to their Scatter.
     * @param request
     * @returns {Promise.<void>}
     */
    static async [Actions.REQUEST_ADD_NETWORK](request){
        return new Promise(async resolve => {

            let {network} = request.payload;

            network = Network.fromJson(network);
            network.name = request.payload.origin + IdGenerator.text(4);

            if(!network.isValid())
                return resolve({id:request.id, result:new Error("bad_network", "The network being suggested is invalid")});

            if(store.state.scatter.settings.networks.find(x => x.unique() === network.unique()))
                return resolve({id:request.id, result:true});

            // Applications can only add one network every 24 hours.
            if(store.state.scatter.settings.networks.find(x => x.fromOrigin === request.payload.origin && x.createdAt > (+new Date() - ((3600 * 12)*1000))))
                return resolve({id:request.id, result:new Error("network_timeout", "You can only add 1 network every 24 hours.")});

            network.fromOrigin = request.payload.origin;
            const scatter = store.state.scatter.clone();
            scatter.settings.networks.push(network);
            await store.dispatch(StoreActions.SET_SCATTER, scatter);
            await AccountService.importAllAccountsForNetwork(network);

            resolve({id:request.id, result:true});
        })
    }

    /***
     * Allows dapps to see if a user has an account for a specific blockchain.
     * DOES NOT PROMPT and does not return an actual account, just a boolean.
     * @param request
     * @returns {Promise.<void>}
     */
    static async [Actions.HAS_ACCOUNT_FOR](request){
        return new Promise(resolve => {
            request.payload.network = Network.fromJson(request.payload.network);
            const {network} = request.payload;
            const {blockchain} = network;

            if(!network.isValid()) return resolve({id:request.id, result:new Error("bad_network", "The network provided is invalid")});

            const existingNetwork = store.state.scatter.settings.networks.find(x => x.unique() === network.unique());
            if(!existingNetwork) return resolve({id:request.id, result:Error.noNetwork()});

            resolve({id:request.id, result:!!store.state.scatter.keychain.accounts.find(x => x.blockchain() === blockchain && x.networkUnique === existingNetwork.unique())});
        })
    }

    static async [Actions.REQUEST_TRANSFER](request){
        return new Promise(resolve => {
            let {to, network, amount, options} = request.payload;
            if(!options) options = {};

            network = Network.fromJson(network);
            if(!network.isValid()) return resolve({id:request.id, result:Error.badNetwork()});

            let symbol = '';
            if(options.hasOwnProperty('symbol')) symbol = options.symbol;
            else {
                // TODO: Support fork chains
                switch(network.blockchain){
                    case Blockchains.EOSIO: symbol = 'EOS';
                }
            }

            let contract = '';
            if(options.hasOwnProperty('contract')) contract = options.contract;
            else {
                // TODO: Support fork chains
                switch(network.blockchain){
                    case Blockchains.EOSIO: contract = 'eosio.token';
                }
            }

            request.payload.memo = network.blockchain === 'eos'
                ? options.hasOwnProperty('memo') ? options.memo : ''
                : '';

            request.payload.symbol = symbol;
            request.payload.contract = contract;

            PopupService.push(Popup.popout(request, async ({result}) => {
                if(!result) return resolve({id:request.id, result:Error.signatureError("signature_rejected", "User rejected the transfer request")});
                const account = Account.fromJson(result.account);
                const plugin = PluginRepository.plugin(network.blockchain);
                const sent = await PluginRepository.plugin(network.blockchain).transfer({
                    account,
                    to,
                    amount:result.amount,
                    contract,
                    symbol,
                    memo:request.payload.memo,
                    promptForSignature:false
                });
                resolve({id:request.id, result:sent})
            }));
        })
    }

    /***
     * Requests a signature, prompts the user to confirm but signing happens
     * within the base application and not the popup itself.
     * @param request
     * @returns {Promise.<void>}
     */
    static async [Actions.REQUEST_SIGNATURE](request){

        return new Promise(async resolve => {

            const {payload} = request;
            const {origin, requiredFields, blockchain} = request.payload;

            const possibleId = PermissionService.identityFromPermissions(origin, false);
            if(!possibleId) return resolve({id:request.id, result:Error.identityMissing()});
            payload.identityKey = possibleId.publicKey;

            // Blockchain specific plugin
            const plugin = PluginRepository.plugin(blockchain);

            const network = Network.fromJson(payload.network);

            // Convert buf and abi to messages
            switch(blockchain){
                case Blockchains.EOSIO: payload.messages = await plugin.requestParser(payload, network); break;
                case Blockchains.ETH:
                case Blockchains.TRX:
                    payload.messages = await plugin.requestParser(payload, payload.hasOwnProperty('abi') ? payload.abi : null); break;
            }


            const availableAccounts = possibleId.accounts.map(x => x.formatted());
            const participants = ObjectHelpers.distinct(plugin.actionParticipants(payload))
                .filter(x => availableAccounts.includes(x))
                .map(x => possibleId.accounts.find(acc => acc.formatted() === x));

            // Must have the proper account participants.
            if(!participants.length) return resolve({id:request.id, result:Error.signatureAccountMissing()});
            payload.participants = participants;

            // Getting the identity for this transaction
            const identity = store.state.scatter.keychain.identities.find(x => x.publicKey === possibleId.publicKey);


            const signAndReturn = async (selectedLocation) => {
                const signatures = await Promise.all(participants.map(x => {
                    if(KeyPairService.isHardware(x.publicKey)){
                        const keypair = KeyPairService.getKeyPairFromPublicKey(x.publicKey);
                        return keypair.external.interface.sign(x.publicKey, payload, payload.abi, network);
                    } else return plugin.signer(payload, x.publicKey)
                }));

                if(signatures.length !== participants.length) return resolve({id:request.id, result:Error.signatureAccountMissing()});
                if(signatures.length === 1 && signatures[0] === null) return resolve({id:request.id, result:Error.signatureError("signature_rejected", "User rejected the signature request")});
                if(signatures.some(x => !x)) return resolve({id:request.id, result:Error.signatureError('missing_sig', 'A signature for this request was missing')});

                const returnedFields = Identity.asReturnedFields(requiredFields, identity, selectedLocation);

                resolve({id:request.id, result:{signatures, returnedFields}});
            };

            // Only allowing whitelist permissions for origin authed apps
            const existingApp = store.state.scatter.keychain.findApp(origin);

            const hasHardwareKeys = participants.some(x => KeyPairService.isHardware(x.publicKey));
            const needToSelectLocation = requiredFields.hasOwnProperty('location') && requiredFields.location.length && identity.locations.length > 1;
            if(existingApp
                && !hasHardwareKeys
                && (!needToSelectLocation
                || needToSelectLocation && identity.locations.length === 1)
                && PermissionService.isWhitelistedTransaction(origin, identity, participants, payload.messages, requiredFields)){
                return await signAndReturn(identity.locations[0]);
            }

            PopupService.push(Popup.popout(request, async ({result}) => {
                if(!result) return resolve({id:request.id, result:Error.signatureError("signature_rejected", "User rejected the signature request")});

                if(result.needResources) await Promise.all(result.needResources.map(async account => await ResourceService.addResources(account)));
                await PermissionService.addIdentityRequirementsPermission(origin, identity, requiredFields);
                await PermissionService.addActionPermissions(origin, identity, participants, result.whitelists);
                await signAndReturn(result.selectedLocation);
            }));
        });
    }

    static async [Actions.CREATE_TRANSACTION](request){
        return new Promise(async resolve => {

            const {payload} = request;
            const {blockchain, actions, account, network} = payload;

            const plugin = PluginRepository.plugin(blockchain);
            const transaction = await plugin.createTransaction(actions, Account.fromJson(account), Network.fromJson(network));
            const result = Object.assign(transaction, {
                network,
                blockchain,
                requiredFields:[],
            });

            resolve({id:request.id, result});
        });
    }

    /***
     * Requests an arbitrary signature of data.
     * @param request
     * @param identityKey
     * @returns {Promise.<void>}
     */
    static async [Actions.REQUEST_ARBITRARY_SIGNATURE](request, identityKey = null){
        return new Promise(async resolve => {

            const {payload} = request;
            const {origin, publicKey, data, whatFor, isHash} = request.payload;

            if(identityKey) payload.identityKey = identityKey;
            else {
                const possibleId = PermissionService.identityFromPermissions(origin, false);
                if (!possibleId) return resolve({id: request.id, result: Error.identityMissing()});
                payload.identityKey = possibleId.publicKey;
            }

            const keypair = KeyPairService.getKeyPairFromPublicKey(publicKey);
            if(!keypair) return resolve({id:request.id, result:Error.signatureError("signature_rejected", "User rejected the signature request")});

            const blockchain = keypair.publicKeys.find(x => x.key === publicKey).blockchain;

            // Blockchain specific plugin
            const plugin = PluginRepository.plugin(blockchain);

            // Convert buf and abi to messages
            payload.messages = [{
                code:`${blockchain.toUpperCase()} Blockchain`,
                type:'Arbitrary Signature',
                data:{
                    signing:data
                }
            }];

            PopupService.push(Popup.popout(Object.assign(request, {}), async ({result}) => {
                if(!result || (!result.accepted || false)) return resolve({id:request.id, result:Error.signatureError("signature_rejected", "User rejected the signature request")});

                resolve({id:request.id, result:await plugin.signer(payload, publicKey, true, isHash)});
            }));
        });
    }

    static async [Actions.GET_ENCRYPTION_KEY](request){
        return new Promise(async resolve => {

            const {payload} = request;
            const {fromPublicKey, toPublicKey, nonce} = request.payload;

            let keypair = KeyPairService.getKeyPairFromPublicKey(fromPublicKey);
            if(!keypair) return resolve({id:request.id, result:Error.signatureError("no_from_key", "This user does not have the FROM key")});

            // ... popup prompt for authorization

            keypair = KeyPairService.getKeyPairFromPublicKey(fromPublicKey, true);
            const encryptionKey = Crypto.getEncryptionKey(keypair.privateKey, toPublicKey, nonce);
            return resolve({id:request.id, result:encryptionKey});
        });
    }

    /***
     * Gets the Scatter version
     * @param request
     * @returns {Promise.<void>}
     */
    static async [Actions.GET_VERSION](request){
        return new Promise(resolve => {
            resolve({id:request.id, result:store.state.scatter.meta.version});
        })
    }


}