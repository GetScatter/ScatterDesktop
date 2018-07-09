import Identities from '../views/Identities.vue'
import Blockchains from '../views/Blockchains.vue'
import LinkedApps from '../views/LinkedApps.vue'
import Login from '../views/Login.vue'
import Settings from '../views/Settings.vue'
import PopOut from '../views/PopOut.vue'
import Permissions from '../views/Permissions.vue'
import Help from '../views/Help.vue'
import SetupAnIdentity from '../views/wizards/SetupAnIdentity.vue'
import LinkBlockchainAccount from '../views/wizards/LinkBlockchainAccount.vue'
import AddBlockchainNetwork from '../views/wizards/AddBlockchainNetwork.vue'
import AddApplicationLink from '../views/wizards/AddApplicationLink.vue'
import ImportKeypair from '../views/wizards/ImportKeypair.vue'
import GetWebExtensions from '../views/wizards/GetWebExtensions.vue'


export const RouteNames = {
    LOGIN:'login',
    IDENTITIES:'identities',
    BLOCKCHAINS:'blockchains',
    LINKED_APPS:'linkedApps',
    PERMISSIONS:'permissions',
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
    WIZ_ADD_APPLICATION_LINK:'wiz_add_app_link',
    WIZ_WEB_EXTENSION:'wiz_web_ext',
};

const RouteViews = {
    [RouteNames.LOGIN]:Login,
    [RouteNames.IDENTITIES]:Identities,
    [RouteNames.BLOCKCHAINS]:Blockchains,
    [RouteNames.LINKED_APPS]:LinkedApps,
    [RouteNames.PERMISSIONS]:Permissions,
    [RouteNames.HELP]:Help,
    [RouteNames.SETTINGS]:Settings,
    [RouteNames.NOT_IDENTITIES]:Identities,
    [RouteNames.POP_OUT]:PopOut,
    [RouteNames.WIZ_SETUP_ID]:SetupAnIdentity,
    [RouteNames.WIZ_SETUP_KEYPAIR]:ImportKeypair,
    [RouteNames.WIZ_LINK_BLOCKCHAIN_ACCOUNT]:LinkBlockchainAccount,
    [RouteNames.WIZ_ADD_BLOCKCHAIN_NETWORK]:AddBlockchainNetwork,
    [RouteNames.WIZ_ADD_APPLICATION_LINK]:AddApplicationLink,
    [RouteNames.WIZ_WEB_EXTENSION]:GetWebExtensions,
};

export const RouteDepth = {
    [RouteNames.LOGIN]:-1,
    [RouteNames.IDENTITIES]:0,
    [RouteNames.BLOCKCHAINS]:1,
    [RouteNames.LINKED_APPS]:2,
    [RouteNames.PERMISSIONS]:3,
    [RouteNames.HELP]:4,
    [RouteNames.SETTINGS]:7,
    [RouteNames.NOT_IDENTITIES]:3,
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
            RouteNames.POP_OUT,
        ].includes(routeName)
    }

}