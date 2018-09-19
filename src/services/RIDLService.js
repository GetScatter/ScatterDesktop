import {store} from '../store/store'
import PluginRepository from '../plugins/PluginRepository';
import {Blockchains} from '../models/Blockchains'
import {Popup} from '../models/popups/Popup'
import PopupService from '../services/PopupService';
import * as Actions from '../store/constants';
import * as ApiActions from '../models/api/ApiActions';
import ApiService from '../services/ApiService';
import Network from '../models/Network';
import ecc from 'eosjs-ecc';

// import ridl from '../../../../Frameworks/ridl/src/ridl'
import ridl from 'ridl'


const ridlNetwork = () => store.state.scatter.settings ? store.state.scatter.settings.networks.find(x => x.name === 'RIDL') : null;

let connectionAttempts = 0;

const updateIdentity = identity => {
    const scatter = store.state.scatter.clone();
    scatter.keychain.updateOrPushIdentity(identity);
    store.dispatch(Actions.SET_SCATTER, scatter);
};

const getIdAndAccount = async (identity, reject) => {
    const ridlId = await ridl.identity.get(identity.name);
    if(!ridlId) {
        identity.ridl = -1;
        updateIdentity(identity);
        console.error('No such identity')
        return reject(false);
    }

    const account = store.state.scatter.keychain.accounts.find(x => x.name === ridlId.account);
    if(!account) {
        console.error('The account bound to this Identity is no longer on the users keychain')
        return reject(false);
    }

    return {ridlId, account};
}

export default class RIDLService {

    constructor(){

    }

    static bindNetwork(){
        fetch('https://raw.githubusercontent.com/GetScatter/Endpoints/master/ridl.json').then(res => res.json()).then(async network => {
            network = Network.fromJson(network.testnet);

            const plugin = PluginRepository.plugin(network.blockchain);
            network.chainId = await plugin.getChainId(network);
            network.name = 'RIDL';

            const scatter = store.state.scatter.clone();

            const oldNetwork = scatter.settings.networks.find(x => x.name === 'RIDL');
            if(oldNetwork) network.id = oldNetwork.id;

            scatter.settings.updateOrPushNetwork(network);
            await store.dispatch(Actions.SET_SCATTER, scatter);

            return true;
        });
    }

    static getNetwork(){
        return ridlNetwork();
    }

    static async canConnect(type = null){
        if(connectionAttempts > 3) return false;
        connectionAttempts++;

        if(type === 'refreshing'){
            await this.bindNetwork();
            return await this.canConnect();
        }

        if(!ridlNetwork()){
            await this.bindNetwork();
        }

        console.log('net', ridlNetwork());
        if(!ridlNetwork()) return false;

        await ridl.init( ridlNetwork() );
        const connected = await ridl.canConnect();
        if(!connected){
            return await this.canConnect('refreshing');
        } else return connected;
    }

    static validName(name){
        return ridl.identity.validName(name);
    }

    static async getIdentity(identity){
        await ridl.init( ridlNetwork() );
        return ridl.identity.get(identity.name);
    }

    static async getFragmentTypes(){
        return ridl.reputation.getFragments();
    }

    static async identify(identity){
        return new Promise(async (resolve, reject) => {
            const existing = await ridl.identity.get(identity.name);
            console.log('existing', existing);

            // Exists and is already registered
            if(!!existing && existing.account !== 'ridlridlridl'){
                console.log('exists!', existing)
                PopupService.push(Popup.prompt('Identity Exists!', 'Looks like someone else has this identity name', 'ban', 'Okay'))
                //TODO: Allow claiming if the user things they own this or
            }

            // Exists and is only seeded, allow to attempt claiming
            else if (!!existing && existing.account === 'ridlridlridl'){

                PopupService.push(Popup.ridlRegister(async account => {
                    if(!account) return reject(false);

                    PopupService.push(Popup.textPrompt('Claim RIDL Identity',
                    `This Identity name is waiting to be claimed by it's owner. If you own it put in the private key linked to it to claim it.`,
                    'exclamation-triangle', 'Okay', {placeholder:'Private Key', type:'password'}, async key => {
                        if(!key) return reject(false);

                        const signProvider = payload => PluginRepository.plugin(Blockchains.EOSIO).passThroughProvider(payload, account, account.network(), reject);
                        await ridl.init( ridlNetwork(), account, signProvider );

                        const signedHash = ecc.Signature.signHash(existing.hash, key).toString();
                        if(!signedHash) return reject(false);

                        const claimed = await ridl.identity.claim(identity.name, identity.publicKey, signedHash);

                        if(!claimed) return reject(false);
                        identity.ridl = existing.expires;
                        updateIdentity(identity);

                        //5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3
                    }))


                }));

            }

            // Name is free!
            else if (!existing){

                PopupService.push(Popup.ridlRegister(async account => {
                    if(!account) return reject(false);

                    const signProvider = payload => PluginRepository.plugin(Blockchains.EOSIO).passThroughProvider(payload, account, account.network(), reject);
                    await ridl.init( ridlNetwork(), account, signProvider );

                    await ridl.identity.payAndIdentify(identity.name, identity.publicKey);
                    const paid = await ridl.identity.get(identity.name);
                    if(!paid) return console.error('Did not register ID');

                    console.log('paid', paid);

                    identity.ridl = paid.expires;
                    updateIdentity(identity);

                    PopupService.push(Popup.prompt('RIDL Identity Registered', 'You have registered this Identity with RIDL.', 'check', 'Okay'));

                    resolve(true);
                }));

            }
        })
    }

    static async release(identity){
        return new Promise(async (resolve, reject) => {
            const {ridlId, account} = await getIdAndAccount(identity, reject);

            const signProvider = payload => PluginRepository.plugin(Blockchains.EOSIO).passThroughProvider(payload, account, account.network(), reject);
            await ridl.init( ridlNetwork(), account, signProvider );

            const signedHash = await ApiService[ApiActions.REQUEST_ARBITRARY_SIGNATURE]({
                plugin:'Scatter',
                payload:{
                    origin:'RIDL',
                    publicKey:identity.publicKey,
                    data:ridlId.hash,
                    whatFor:'RIDL Identity Release',
                    isHash:true
                },
                type:ApiActions.REQUEST_ARBITRARY_SIGNATURE
            }, identity.publicKey).then(res => res.result).catch(err => console.error(err));

            if(!signedHash) return reject(false);

            const released = await ridl.identity.release(identity.name, signedHash);
            if(!released){
                console.error('Could not release Identity')
                return reject(false);
            }

            identity.ridl = -1;
            updateIdentity(identity);

            PopupService.push(Popup.prompt('RIDL Identity Released', 'You have released this Identity from RIDL, others may now claim it.', 'check', 'Okay'));

            resolve(true);
        })
    }

    static async repute(identity, entity, fragments){
        return new Promise(async (resolve, reject) => {
            const {ridlId, account} = await getIdAndAccount(identity, reject);

            const formattedFragments = ridl.reputation.formatFragments(fragments);

            const signProvider = payload => PluginRepository.plugin(Blockchains.EOSIO).passThroughProvider(payload, account, account.network(), reject);
            await ridl.init( ridlNetwork(), account, signProvider );

            const reputed = await ridl.reputation.repute(identity.name, entity, formattedFragments);
            if(!reputed.hasOwnProperty('transaction_id')) return reject(false);
            resolve(reputed.transaction_id);
        })
    }

    static async loadTokens(account, identityName, quantity){
        return new Promise(async (resolve, reject) => {
            const signProvider = payload => PluginRepository.plugin(Blockchains.EOSIO).passThroughProvider(payload, account, account.network(), reject);
            await ridl.init( ridlNetwork(), account, signProvider );

            const loaded = await ridl.identity.loadTokens(identityName, quantity);
            if(!loaded.hasOwnProperty('transaction_id')) return reject(false);
            resolve(loaded.transaction_id);
        })
    }

    static buildEntityName(type, entityName, user = null){
        return `${type}::${entityName}${user && user.length ? '::'+user : ''}`.toLowerCase().trim();
    }

    static async getReputableEntity(entity){
        await ridl.init( ridlNetwork() );
        return ridl.reputation.getEntity(entity);
    }

    static async getReputation(entity){
        await ridl.init( ridlNetwork() );
        return ridl.reputation.getEntityReputation(entity);
    }

    static async shouldWarn(entity){
        await ridl.init( ridlNetwork() );
        const reputable = await this.getReputableEntity(entity);
        if(!reputable) return false;

        const reputation = await this.getReputation(entity);
        if(!reputation || !reputation.hasOwnProperty('fragments')) return false;

        const maliciousFragments = ['scam', 'privacy', 'security'];
        return reputation.fragments
            .filter(x => maliciousFragments.includes(x.type))
            .filter(x => x.reputation < -0.01)
            .map(x => {x.total_reputes = reputation.total_reputes; return x;});
    }

}