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

        if(!ridlNetwork()) return false;

        await ridl.init( ridlNetwork() );
        const connected = await ridl.canConnect();
        if(!connected){
            return await this.canConnect('refreshing');
        } else return connected;
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