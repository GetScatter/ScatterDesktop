const Onboarding = () => import('../views/Onboarding')
const Login = () => import('../views/Login')
const Settings = () => import('../views/Settings')
const PopOut = () => import('../views/PopOut')

const Identity = () => import('../views/Identity')
const Transfer = () => import('../views/Transfer')
const Receive = () => import('../views/Receive')
const Permission = () => import('../views/Permission')


const Home = () => import('../views/Home')
const NewKeypair = () => import('../views/NewKeypair')
const Keypair = () => import('../views/Keypair')




export const RouteNames = {
    LOGIN:'login',
    HOME:'home',
    NEW_KEYPAIR:'newKeypair',
    KEYPAIR:'keypair',
    IDENTITY:'identity',
    TRANSFER:'transfer',
    RECEIVE:'receive',
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
    [RouteNames.NEW_KEYPAIR]:NewKeypair,
    [RouteNames.KEYPAIR]:Keypair,
    [RouteNames.IDENTITY]:Identity,
    [RouteNames.TRANSFER]:Transfer,
    [RouteNames.RECEIVE]:Receive,
    [RouteNames.PERMISSION]:Permission,

    [RouteNames.SETTINGS]:Settings,
    [RouteNames.POP_OUT]:PopOut,
};

const RoutePaths = {
	[RouteNames.HOME]: '/',
	[RouteNames.KEYPAIR]: '/keypair/:id',
	[RouteNames.PERMISSION]: '/permission/:origin',
};

export class Routing {

    static builder(){
        const routeNames = Object.keys(RouteNames).map(key => RouteNames[key]);

        let routesBuilder = {};
        routeNames.map(routeName => {
            routesBuilder[routeName] = {
	            path:RoutePaths.hasOwnProperty(routeName) ? RoutePaths[routeName] : `/${routeName}`,
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
