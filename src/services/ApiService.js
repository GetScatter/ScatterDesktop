import * as Actions from '../models/api/ApiActions';
import Action from '../models/api/Action'
import {store} from '../store/store'
import * as StoreActions from '../store/constants'
import ObjectHelpers from '../util/ObjectHelpers'
import Hasher from '../util/Hasher'
import IdGenerator from '../util/IdGenerator'

import {Popup} from '../models/popups/Popup';
import PopupService from '../services/PopupService';
import AccountService from '../services/AccountService';
import PermissionService from '../services/PermissionService';
import KeyPairService from '../services/KeyPairService';
import ResourceService from '../services/ResourceService';
import PluginRepository from '../plugins/PluginRepository';
import {blockchainName, Blockchains, BlockchainsArray} from '../models/Blockchains';

import Keypair from '../models/Keypair';
import Identity, {LocationInformation} from '../models/Identity';
import Account from '../models/Account';
import Error from '../models/errors/Error'
import Network from '../models/Network'

import {router} from "../vue/VueInitializer";

import {remote} from '../util/ElectronHelpers';
import HardwareService from "./HardwareService";
import {RouteNames} from "../vue/Routing";
import Token from "../models/Token";
import TransferService from "./TransferService";
import WindowService from "./WindowService";
const NotificationService = remote.getGlobal('appShared').NotificationService;
remote.getGlobal('appShared').ApiWatcher = (deepLink) => {
    ApiService.handleDeepLink(deepLink);
};


const updateIdentity = async result => {
	const identity = Identity.fromJson(result.identity);
	const location = LocationInformation.fromJson(result.location);
	if(result.missingFields){
		const scatter = store.state.scatter.clone();
		const oldIdentity = scatter.keychain.identities.find(x => x.id === identity.id);
		oldIdentity.personal = identity.personal;

		oldIdentity.locations = oldIdentity.locations.filter(x => x.id !== location.id);
		oldIdentity.locations.unshift(location);

		scatter.keychain.updateOrPushIdentity(oldIdentity);
		await store.dispatch(StoreActions.SET_SCATTER, scatter);
	}
	return true;
}

export default class ApiService {

    static async handleDeepLink(deepLink){
        if(!deepLink || Array.isArray(deepLink)) return;
        let [type, payload] = deepLink.toString().split('scatter://')[1].split('/?payload=');
        type = type.replace('/', '');
        if(payload) payload = decodeURI(payload);

        try { payload = JSON.parse(payload); } catch(e){}

        // Special case for transfers which just makes URLs prettier
        if(type === 'transfer'){
            type = 'requestTransfer';
            let [to, amount, memo, chainId] = payload.split('/');
            if(!to || !to.length) return false;

            // Inferring blockchain from recipient
            let blockchain, plugin;
            BlockchainsArray.map(({value}) => {
                if(blockchain) return;
                plugin = PluginRepository.plugin(value);
                if(plugin.isValidRecipient(to)) blockchain = value;
            });
            if(!blockchain) return false;

            if(!chainId || !chainId.length) chainId = PluginRepository.plugin(blockchain).getEndorsedNetwork().chainId;
            if(!memo) memo = '';
            if(!amount || !amount.length) amount = 0;

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











	/******************************************************************************/
	/**                                                                          **/
	/**                                                                          **/
	/**                              POPOUT METHODS                              **/
	/**                    These routes cause popups for the user                **/
	/**                                                                          **/
	/**                                                                          **/
	/******************************************************************************/


    static async [Actions.GET_OR_REQUEST_IDENTITY](request){
        return new Promise((resolve) => {
	        const badResult = (msg = 'Invalid format') => resolve({id:request.id, result:Error.malicious(msg)});
	        if(Object.keys(request.payload).length !== 2) return badResult();
	        if(!request.payload.hasOwnProperty('fields')) return badResult();
	        if(typeof request.payload.fields !== 'object') return badResult();

            const possibleId = PermissionService.identityFromPermissions(request.payload.origin);
            if(possibleId) return resolve({id:request.id, result:possibleId});

            const requiredNetworks = (request.payload.fields.hasOwnProperty('accounts') ? request.payload.fields.accounts : []).map(x => Network.fromJson(x)).map(x => x.unique());
            const existingNetworkIds = store.state.scatter.settings.networks.map(x => x.unique());
            if(!requiredNetworks.every(x => existingNetworkIds.includes(x))){
	            return resolve({id:request.id, result:Error.noNetwork()});
            }

            PopupService.push(Popup.popout(request, async ({result}) => {
                if(!result) return resolve({id:request.id, result:Error.signatureError("identity_rejected", "User rejected the provision of an Identity")});

                await updateIdentity(result);
	            const identity = Identity.fromJson(result.identity);
	            const location = LocationInformation.fromJson(result.location);

                const accounts = (result.accounts || []).map(x => Account.fromJson(x));
                PermissionService.addIdentityOriginPermission(identity, accounts, request.payload.fields, request.payload.origin);

                const returnableIdentity = identity.asOnlyRequiredFields(request.payload.fields, location);
                returnableIdentity.accounts = accounts.map(x => x.asReturnable());

                AccountService.incrementAccountLogins(accounts);

                resolve({id:request.id, result:returnableIdentity});
            }));
        })
    }

	static async [Actions.REQUEST_SIGNATURE](request){
		return new Promise(async resolve => {

			const {payload} = request;
			const {origin, requiredFields, blockchain} = payload;

			const possibleId = PermissionService.identityFromPermissions(origin, false);
			if(!possibleId) return resolve({id:request.id, result:Error.identityMissing()});
			payload.identityKey = possibleId.publicKey;

			// Blockchain specific plugin
			const plugin = PluginRepository.plugin(blockchain);

			const network = store.state.scatter.settings.networks.find(x => x.unique() === Network.fromJson(payload.network).unique());
			if(!network) return resolve({id:request.id, result:Error.noNetwork()});

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
			let identity;
			const fillIdentity = () => identity = store.state.scatter.keychain.identities.find(x => x.publicKey === possibleId.publicKey);
			fillIdentity();


			const signAndReturn = async (selectedLocation) => {
				const signatures = await Promise.all(participants.map(async account => {
					if(KeyPairService.isHardware(account.publicKey)){
						return HardwareService.sign(account, payload);
					} else return plugin.signer(payload, account.publicKey)
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

				if(store.state.scatter.settings.showNotifications)
					NotificationService.pushNotification('Signed Transaction', `${origin} - ${participants.map(x => x.sendable()).join(',')}`);

				return await signAndReturn(identity.locations[0]);
			}

			PopupService.push(Popup.popout(request, async ({result}) => {
				if(!result) return resolve({id:request.id, result:Error.signatureError("signature_rejected", "User rejected the signature request")});

				await updateIdentity(result);
				fillIdentity();

				if(result.needResources) await Promise.all(result.needResources.map(async account => await ResourceService.addResources(account)));
				await PermissionService.addIdentityRequirementsPermission(origin, identity, requiredFields);
				await PermissionService.addActionPermissions(origin, identity, participants, result.whitelists);
				await signAndReturn(result.selectedLocation);
			}));
		});
	}

	static async [Actions.REQUEST_ARBITRARY_SIGNATURE](request, identityKey = null){
		return new Promise(async resolve => {

			const {payload} = request;
			const {origin, publicKey, data} = request.payload;

			if(data.split(' ').some(x => x.length > 12))
				return resolve({id:request.id, result:Error.malicious('You can not sign strings where any of the words are over 12 characters.')});


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
				code:`${blockchainName(blockchain)} Key`,
				type:'Arbitrary Signature',
				data:{
					signing:data
				}
			}];

			PopupService.push(Popup.popout(Object.assign(request, {}), async ({result}) => {
				if(!result || (!result.accepted || false)) return resolve({id:request.id, result:Error.signatureError("signature_rejected", "User rejected the signature request")});

				resolve({id:request.id, result:await plugin.signer(payload, publicKey, true, false)});
			}));
		});
	}

	static async [Actions.REQUEST_TRANSFER](request){
		return new Promise(resolve => {
			let {to, network, amount, options} = request.payload;
			if(!options) options = {};

			network = store.state.scatter.settings.networks.find(x => x.unique() === Network.fromJson(network).unique());
			if(!network) return resolve({id:request.id, result:Error.noNetwork()});

			let symbol = '';
			if(options.hasOwnProperty('symbol')) symbol = options.symbol;
			symbol = network.systemToken().symbol;

			let contract = '';
			if(options.hasOwnProperty('contract')) contract = options.contract;
			contract = network.systemToken().contract;

			request.payload.memo = network.blockchain === 'eos'
				? options.hasOwnProperty('memo') ? options.memo : ''
				: '';

			request.payload.symbol = symbol;
			request.payload.contract = contract;

			PopupService.push(Popup.popout(request, async ({result}) => {
				if(!result) return resolve({id:request.id, result:Error.signatureError("signature_rejected", "User rejected the transfer request")});
				const account = Account.fromJson(result.account);
				const plugin = PluginRepository.plugin(network.blockchain);
				const options = request.payload || {};
				const token = Token.fromJson({
					contract:contract,
					blockchain:network.blockchain,
					symbol,
					decimals:options.decimals || PluginRepository.plugin(network.blockchain).defaultDecimals(),
					chainId:account.network().chainId
				});
				const sent = await PluginRepository.plugin(network.blockchain).transfer({
					account,
					to,
					amount:result.amount,
					token,
					memo:request.payload.memo,
					promptForSignature:false
				}).catch(error => ({error}));

				if(!sent.hasOwnProperty('error')){
					TransferService.transferSuccessPopup(sent, network.blockchain);
					WindowService.flashWindow();
				}


				resolve({id:request.id, result:sent})
			}));
		})
	}

    static async [Actions.GET_PUBLIC_KEY](request){
        return new Promise((resolve, reject) => {
            const badResult = (msg = 'Invalid format') => resolve({id:request.id, result:Error.malicious(msg)});
            if(Object.keys(request.payload).length !== 2) return badResult();
            if(!request.payload.hasOwnProperty('blockchain')) return badResult();
            if(typeof request.payload.blockchain !== 'string') return badResult();
            if(!BlockchainsArray.map(x => x.value).includes(request.payload.blockchain)) return badResult('no such blockchain');

            PopupService.push(Popup.popout(request, async ({result}) => {
                if(!result) return resolve({id:request.id, result:Error.rejected()});

                const keypair = Keypair.fromJson(result.keypair);
                const publicKey = keypair.publicKeys.find(x => x.blockchain === request.payload.blockchain).key;

                if(result.isNew) {
                    await KeyPairService.saveKeyPair(keypair);
	                router.push({name:RouteNames.KEYPAIR, params:{id:keypair.id}});
                    resolve({id:request.id, result:publicKey});
                }
                else resolve({id:request.id, result:publicKey});
            }));
        })
    }











    /******************************************************************************/
	/**                                                                          **/
	/**                                                                          **/
	/**                              HELPER METHODS                              **/
	/**                     These routes do not cause popups                     **/
	/**                                                                          **/
	/**                                                                          **/
	/******************************************************************************/


	static async [Actions.IDENTITY_FROM_PERMISSIONS](request){
		const perm = PermissionService.identityFromPermissions(request.payload.origin, true);
		return {id:request.id, result:PermissionService.identityFromPermissions(request.payload.origin, true)};
	}

	static async [Actions.AUTHENTICATE](request){
		return new Promise(async resolve => {
			const identity = PermissionService.identityFromPermissions(request.payload.origin);
			if(!identity) return resolve({id:request.id, result:Error.identityMissing()});

			const nonceError = new Error('invalid_nonce', 'You must provide a 12 character nonce for authentication');
			if(!request.payload.hasOwnProperty('nonce')) return resolve({id:request, result:nonceError});
			if(request.payload.nonce.length !== 12) return resolve({id:request, result:nonceError});

			const publicKey = request.payload.hasOwnProperty('publicKey') && request.payload.publicKey && request.payload.publicKey.length
				? request.payload.publicKey
				: identity.publicKey;

			const keypair = KeyPairService.getKeyPairFromPublicKey(publicKey);
			if(!keypair) return resolve({id:request.id, result:Error.noKeypair()});

			const isHash = request.payload.hasOwnProperty('data') && request.payload.data && request.payload.data.length;
			const toSign = isHash ? request.payload.data : origin;

			// Prevention of origins being able to send data buffers to be
			// signed by the identity which could change to a real balance holding
			// key in the future.
			const data = Hasher.unsaltedQuickHash(
				Hasher.unsaltedQuickHash(toSign) +
				Hasher.unsaltedQuickHash(request.payload.nonce)
			);

			const plugin = PluginRepository.plugin(Blockchains.EOSIO);
			const signed = await plugin.signer({data}, publicKey, true, !!isHash);
			resolve({id:request.id, result:signed});
		})
	}

	static async [Actions.FORGET_IDENTITY](request){
		await PermissionService.removeIdentityPermission(request.payload.origin);
		return {id:request.id, result:true};
	}

    static async [Actions.LINK_ACCOUNT](request){
        return new Promise(async (resolve, reject) => {
	        const badResult = (msg = 'Invalid format') => resolve({id:request.id, result:Error.malicious(msg)});
	        if(Object.keys(request.payload).length !== 3) return badResult();
	        if(!request.payload.hasOwnProperty('account')) return badResult();
	        if(!request.payload.hasOwnProperty('network')) return badResult();
	        if(!request.payload.account.hasOwnProperty('publicKey')) return badResult();

            const scatter = store.state.scatter.clone();
            let {account, network, origin} = request.payload;

	        network = store.state.scatter.settings.networks.find(x => x.unique() === Network.fromJson(network).unique());
	        if(!network) return resolve({id:request.id, result:Error.noNetwork()});

            const keypair = scatter.keychain.keypairs.find(x => x.publicKeys.some(y => y.key === account.publicKey));
            if(!keypair) return resolve({id:request.id, result:Error.noKeypair()});

            const newAccount = Account.fromJson({
	            keypairUnique:keypair.unique(),
	            networkUnique:network.unique(),
	            publicKey:account.publicKey,
	            name:account.name || '',
	            authority:account.authority || '',
	            fromOrigin:origin,
            });

	        // Applications can only add one network every hour.
	        if(scatter.keychain.accounts.find(x => x.fromOrigin === origin && x.createdAt > (+new Date() - (3600*1000))))
		        return resolve({id:request.id, result:new Error("link_account_timeout", "You can only add 1 account every hour.")});

            await AccountService.addAccount(newAccount);
            return resolve({id:request.id, result:true});
        })
    }

    static async [Actions.SUGGEST_NETWORK](request){
        return new Promise(async resolve => {
	        const badResult = (msg = 'Invalid format') => resolve({id:request.id, result:Error.malicious(msg)});
	        if(Object.keys(request.payload).length !== 2) return badResult();
	        if(!request.payload.hasOwnProperty('network')) return badResult();

            let {network} = request.payload;

            network = Network.fromJson(network);
            network.name = request.payload.origin + IdGenerator.text(4);

	        if(network.hasOwnProperty('token') && network.token){
		        network.token.blockchain = network.blockchain;
		        network.token.name = network.token.name.length ? network.token.name : network.token.symbol;
	        }

            if(!network.isValid())
                return resolve({id:request.id, result:new Error("bad_network", "The network being suggested is invalid")});

            if(store.state.scatter.settings.networks.find(x => x.unique() === network.unique()))
                return resolve({id:request.id, result:true});

            // Applications can only add one network every 12 hours.
            if(store.state.scatter.settings.networks.find(x => x.fromOrigin === request.payload.origin && x.createdAt > (+new Date() - ((3600 * 12)*1000))))
                return resolve({id:request.id, result:new Error("network_timeout", "You can only add 1 network every 12 hours.")});

            network.fromOrigin = request.payload.origin;
            const scatter = store.state.scatter.clone();
            scatter.settings.networks.push(network);
            await store.dispatch(StoreActions.SET_SCATTER, scatter);
            await AccountService.importAllAccountsForNetwork(network);

            resolve({id:request.id, result:true});
        })
    }

    static async [Actions.HAS_ACCOUNT_FOR](request){
        return new Promise(resolve => {
	        const badResult = (msg = 'Invalid format') => resolve({id:request.id, result:Error.malicious(msg)});
	        if(Object.keys(request.payload).length !== 2) return badResult();
	        if(!request.payload.hasOwnProperty('network')) return badResult();

	        let {network} = request.payload;

	        network = store.state.scatter.settings.networks.find(x => x.unique() === Network.fromJson(network).unique());
	        if(!network) return resolve({id:request.id, result:Error.noNetwork()});

            resolve({id:request.id, result:!!store.state.scatter.keychain.accounts.find(x => x.networkUnique === network.unique())});
        })
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

    static async [Actions.GET_VERSION](request){
        return new Promise(resolve => {
            resolve({id:request.id, result:store.state.scatter.meta.version});
        })
    }


}
