import Onboarding from '../views/Onboarding.vue'
import Identities from '../views/Identities.vue'
import Blockchains from '../views/Blockchains.vue'
import Login from '../views/Login.vue'
import Settings from '../views/Settings.vue'
import PopOut from '../views/PopOut.vue'
import Permissions from '../views/Permissions.vue'
import Dashboard from '../views/Dashboard.vue'
import Help from '../views/Help.vue'
import Reputation from '../views/Reputation.vue'
import SetupAnIdentity from '../views/wizards/SetupAnIdentity.vue'
import LinkBlockchainAccount from '../views/wizards/LinkBlockchainAccount.vue'
import AddBlockchainNetwork from '../views/wizards/AddBlockchainNetwork.vue'
import ImportKeypair from '../views/wizards/ImportKeypair.vue'

import Home from '../views/Home.vue'
import Transfer from '../components/panels/Transfer.vue'
import Receive from '../components/panels/Receive.vue'




export const RouteNames = {
    LOGIN:'login',
    HOME:'home',
    TRANSFER:'transfer',
    RECEIVE:'receive',

    ONBOARDING:'onboarding',
    DASHBOARD:'dashboard',
    IDENTITIES:'identities',
    BLOCKCHAINS:'blockchains',
    PERMISSIONS:'permissions',
    REPUTATION:'reputation',
    HELP:'help',
    SETTINGS:'settings',
    NOT_IDENTITIES:'not_identities',

    // POPOUT
    POP_OUT:'popout',

    // WIZARDS
    WIZ_SETUP_ID:'wiz_setup_id',
    WIZ_SETUP_KEYPAIR:'wiz_setup_keypair',
    WIZ_LINK_BLOCKCHAIN_ACCOUNT:'wiz_link_block_acc',
    WIZ_ADD_BLOCKCHAIN_NETWORK:'wiz_add_block_net',
    WIZ_WEB_EXTENSION:'wiz_web_ext',
};

const RouteViews = {
    [RouteNames.LOGIN]:Login,
    [RouteNames.ONBOARDING]:Onboarding,
    [RouteNames.HOME]:Home,
    [RouteNames.TRANSFER]:Transfer,
    [RouteNames.RECEIVE]:Receive,

    [RouteNames.DASHBOARD]:Dashboard,
    [RouteNames.IDENTITIES]:Identities,
    [RouteNames.REPUTATION]:Reputation,
    [RouteNames.BLOCKCHAINS]:Blockchains,
    [RouteNames.PERMISSIONS]:Permissions,
    [RouteNames.HELP]:Help,
    [RouteNames.SETTINGS]:Settings,
    [RouteNames.NOT_IDENTITIES]:Identities,
    [RouteNames.POP_OUT]:PopOut,
    [RouteNames.WIZ_SETUP_ID]:SetupAnIdentity,
    [RouteNames.WIZ_SETUP_KEYPAIR]:ImportKeypair,
    [RouteNames.WIZ_LINK_BLOCKCHAIN_ACCOUNT]:LinkBlockchainAccount,
    [RouteNames.WIZ_ADD_BLOCKCHAIN_NETWORK]:AddBlockchainNetwork,
};

export class Routing {

    static builder(){
        const routeNames = Object.keys(RouteNames).map(key => RouteNames[key]);

        let routesBuilder = {};
        routeNames.map(routeName => {
            routesBuilder[routeName] = {
                path:routeName === RouteNames.LOGIN ? '' : '/'+routeName,
                name:routeName,
                component: RouteViews[routeName]
            }
        });

        return routesBuilder;
    }

    static routes(){
        return Object.keys(Routing.builder())
            .map(routeName => Routing.builder()[routeName]);
    }

    static isRestricted(routeName) {
        return ![
            RouteNames.LOGIN,
            RouteNames.POP_OUT,
            // RouteNames.LOAD_FROM_BACKUP
        ].includes(routeName)
    }

    static hasSidebar(routeName){
        return ![
            RouteNames.ONBOARDING,
            RouteNames.POP_OUT,
        ].includes(routeName)
    }

}
