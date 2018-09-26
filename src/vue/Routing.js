import Onboarding from '../views/Onboarding.vue'
import Login from '../views/Login.vue'
import Settings from '../views/Settings.vue'
import PopOut from '../views/PopOut.vue'

import Home from '../views/Home.vue'
import Identity from '../views/Identity.vue'
import Transfer from '../views/Transfer.vue'
import Receive from '../views/Receive.vue'
import Permission from '../views/Permission.vue'
import Tokens from '../views/Tokens.vue'




export const RouteNames = {
    LOGIN:'login',
    HOME:'home',
    IDENTITY:'identity',
    TRANSFER:'transfer',
    RECEIVE:'receive',
    TOKENS:'tokens',
    PERMISSION:'permission',
    ONBOARDING:'onboarding',
    SETTINGS:'settings',

    // POPOUT
    POP_OUT:'popout',
};

const RouteViews = {
    [RouteNames.LOGIN]:Login,
    [RouteNames.ONBOARDING]:Onboarding,
    [RouteNames.HOME]:Home,
    [RouteNames.IDENTITY]:Identity,
    [RouteNames.TRANSFER]:Transfer,
    [RouteNames.TOKENS]:Tokens,
    [RouteNames.RECEIVE]:Receive,
    [RouteNames.PERMISSION]:Permission,

    [RouteNames.SETTINGS]:Settings,
    [RouteNames.POP_OUT]:PopOut,
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
