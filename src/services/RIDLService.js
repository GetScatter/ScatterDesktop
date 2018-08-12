import {store} from '../store/store'
import PluginRepository from '../plugins/PluginRepository';
import {Blockchains} from '../models/Blockchains'
import {Popup} from '../models/popups/Popup'
import PopupService from '../services/PopupService';
import * as Actions from '../store/constants';
import * as ApiActions from '../models/api/ApiActions';
import ApiService from '../services/ApiService';
import KeyPairService from '../services/KeyPairService';
import ecc from 'eosjs-ecc';


// import ridl from '../../../../Frameworks/ridl/src/ridl'
import ridl from 'ridl'


const ridlNetwork = () => store.state.scatter.settings.networks.find(x => x.name === 'RIDLTestnet');


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

            // Exists and is already registered
            if(!!existing && parseInt(existing.expires) > 0){
                console.log('exists!', existing)
                PopupService.push(Popup.prompt('Identity Exists!', 'Looks like someone else has this identity name', 'ban', 'Okay'))
                //TODO: Allow claiming if the user things they own this or
            }

            // Exists and is only seeded, allow to attempt claiming
            else if (!!existing && parseInt(existing.expires) === 0){
                console.log('seeded, can claim', existing)
            }

            // Name is free!
            else if (!existing){
                const ridlNetworkAccounts = store.state.scatter.keychain.accounts.filter(x => x.networkUnique === ridlNetwork().unique());

                PopupService.push(Popup.selector('Select an Account', 'RIDL requires an EOS account to be able to send transactions. Please select one from below.',
                    'ban', ridlNetworkAccounts, acc => acc.formatted(), async account => {

                        const signProvider = payload => PluginRepository.plugin(Blockchains.EOS).passThroughProvider(payload, account, account.network(), reject);
                        await ridl.init( ridlNetwork(), account, signProvider );

                        await ridl.identity.payAndIdentify(identity.name, identity.publicKey);
                        const paid = await ridl.identity.get(identity.name);
                        if(!paid) return console.error('Did not register ID');

                        console.log('paid', paid);

                        identity.ridl = paid.expires;
                        updateIdentity(identity);
                        resolve(true);
                    }))

            }
        })
    }

    static async release(identity){
        return new Promise(async (resolve, reject) => {
            const {ridlId, account} = await getIdAndAccount(identity, reject);

            const signProvider = payload => PluginRepository.plugin(Blockchains.EOS).passThroughProvider(payload, account, account.network(), reject);
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
            resolve(true);
        })
    }

    static async repute(identity, entity, fragments){
        return new Promise(async (resolve, reject) => {
            const {ridlId, account} = await getIdAndAccount(identity, reject);

            const formattedFragments = ridl.reputation.formatFragments(fragments);

            const signProvider = payload => PluginRepository.plugin(Blockchains.EOS).passThroughProvider(payload, account, account.network(), reject);
            await ridl.init( ridlNetwork(), account, signProvider );

            const reputed = await ridl.reputation.repute(identity.name, entity, formattedFragments);
            if(!reputed.hasOwnProperty('transaction_id')) return reject(false);
            resolve(reputed.transaction_id);
        })
    }

    static async getReputableEntity(entity){
        return ridl.reputation.getEntity(entity);
    }

    static async getReputation(entity){
        return ridl.reputation.getEntityReputation(entity);
    }

}