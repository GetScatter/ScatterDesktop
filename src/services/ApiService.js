import * as Actions from '../models/api/ApiActions';
import Action from '../models/api/Action'
import {store} from '../store/store'
import * as StoreActions from '../store/constants'
import ObjectHelpers from '../util/ObjectHelpers'

import {Popup} from '../models/popups/Popup';
import PopupService from '../services/PopupService';
import PermissionService from '../services/PermissionService';
import KeyPairService from '../services/KeyPairService';
import PluginRepository from '../plugins/PluginRepository';
import {Blockchains} from '../models/Blockchains';

import Identity from '../models/Identity';
import {IdentityRequiredFields} from '../models/Identity';
import Account from '../models/Account';
import Error from '../models/errors/Error'
import Network from '../models/Network'

export default class ApiService {

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

            const plugin = PluginRepository.plugin(Blockchains.EOS);
            const signed = await plugin.signer({data:request.payload.origin}, identity.publicKey, true);
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
     * Prompts the user to add a new network to their Scatter.
     * @param request
     * @returns {Promise.<void>}
     */
    static async [Actions.REQUEST_ADD_NETWORK](request){
        return new Promise(resolve => {

            request.payload.network = Network.fromJson(request.payload.network);
            request.payload.network.name = request.payload.origin;

            if(!request.payload.network.isValid())
                return resolve({id:request.id, result:new Error("bad_network", "The network being suggested is invalid")});

            if(store.state.scatter.settings.networks.find(x => x.unique() === request.payload.network.unique()))
                return resolve({id:request.id, result:true});

            PopupService.push(Popup.popout(request, async ({result}) => {
                if(!result) return resolve({id:request.id, result:false});


                const scatter = store.state.scatter.clone();
                scatter.settings.networks.push(request.payload.network);
                store.dispatch(StoreActions.SET_SCATTER, scatter);

                resolve({id:request.id, result:true});
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

            // Convert buf and abi to messages
            switch(blockchain){
                case Blockchains.EOS: payload.messages = await plugin.requestParser(payload, Network.fromJson(payload.network)); break;
                case Blockchains.ETH: payload.messages = await plugin.requestParser(payload, payload.hasOwnProperty('abi') ? payload.abi : null); break;
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
                        return keypair.external.interface.sign(x.publicKey, payload, payload.abi);
                    } else return plugin.signer(payload, x.publicKey)
                }));
                if(signatures.length !== participants.length) return resolve({id:request.id, result:Error.signatureAccountMissing()});
                if(signatures.some(x => !x)) return resolve({id:request.id, result:Error.signatureError('missing_sig', 'A signature for this request was missing')});

                const returnedFields = Identity.asReturnedFields(requiredFields, identity, selectedLocation);

                resolve({id:request.id, result:{signatures, returnedFields}});
            };

            const hasHardwareKeys = participants.some(x => KeyPairService.isHardware(x.publicKey));
            const needToSelectLocation = requiredFields.hasOwnProperty('location') && requiredFields.location.length && identity.locations.length > 1;
            if(!hasHardwareKeys && !needToSelectLocation && identity.locations.length === 1 && PermissionService.isWhitelistedTransaction(origin, identity, participants, payload.messages, requiredFields)){
                return await signAndReturn(identity.locations[0]);
            }

            PopupService.push(Popup.popout(request, async ({result}) => {
                if(!result) return resolve({id:request.id, result:Error.signatureError("signature_rejected", "User rejected the signature request")});

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
            console.log('pl', request.payload);

            if(identityKey) payload.identityKey = identityKey;
            else {
                const possibleId = PermissionService.identityFromPermissions(origin, false);
                if (!possibleId) return resolve({id: request.id, result: Error.identityMissing()});
                payload.identityKey = possibleId.publicKey;
            }

            const keypair = KeyPairService.getKeyPairFromPublicKey(publicKey);
            if(!keypair) return resolve({id:request.id, result:Error.signatureError("signature_rejected", "User rejected the signature request")});

            // Blockchain specific plugin
            const plugin = PluginRepository.plugin(keypair.blockchain);

            // Convert buf and abi to messages
            payload.messages = [{
                code:`${keypair.blockchain.toUpperCase()} Blockchain`,
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

    /***
     * Tells the user that they need to update their Scatter in order to
     * use the origin.
     * @param request
     * @returns {Promise.<void>}
     */
    static async [Actions.REQUEST_VERSION_UPDATE](request){

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