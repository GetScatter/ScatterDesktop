import Identities from '../views/Identities.vue'
import Blockchains from '../views/Blockchains.vue'
import LinkedApps from '../views/LinkedApps.vue'
import Login from '../views/Login.vue'
import Settings from '../views/Settings.vue'
import PopOut from '../views/PopOut.vue'
import Permissions from '../views/Permissions.vue'


export const RouteNames = {
    LOGIN:'login',
    IDENTITIES:'identities',
    BLOCKCHAINS:'blockchains',
    LINKED_APPS:'linkedApps',
    PERMISSIONS:'permissions',
    SETTINGS:'settings',
    NOT_IDENTITIES:'not_identities',

    // POPOUT
    POP_OUT:'popout',
};

const RouteViews = {
    [RouteNames.LOGIN]:Login,
    [RouteNames.IDENTITIES]:Identities,
    [RouteNames.BLOCKCHAINS]:Blockchains,
    [RouteNames.LINKED_APPS]:LinkedApps,
    [RouteNames.PERMISSIONS]:Permissions,
    [RouteNames.SETTINGS]:Settings,
    [RouteNames.NOT_IDENTITIES]:Identities,
    [RouteNames.POP_OUT]:PopOut,
};

export const RouteDepth = {
    [RouteNames.LOGIN]:-1,
    [RouteNames.IDENTITIES]:0,
    [RouteNames.BLOCKCHAINS]:1,
    [RouteNames.LINKED_APPS]:2,
    [RouteNames.PERMISSIONS]:3,
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