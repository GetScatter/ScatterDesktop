// const Terms = () => import('../views/Terms')
// const Onboarding = () => import('../views/Onboarding')
// const Settings = () => import('../views/Settings')
const PopOut = () => import('../views/PopOut')
//
// const Identity = () => import('../views/Identity')
// const Transfer = () => import('../views/Transfer')
// const Tokens = () => import('../views/Tokens')
// const Token = () => import('../views/Token')
// const Permission = () => import('../views/Permission')
//
//
// const NewKeypair = () => import('../views/NewKeypair')
// const Keypair = () => import('../views/Keypair')

const Login = () => import('../views/Login')
const Home = () => import('../views/Apps')
const App = () => import('../views/App')
const Assets = () => import('../views/Assets')
const Wallet = () => import('../views/Wallet')
const Account = () => import('../views/Account')
const Items = () => import('../views/Items')
const Transfer = () => import('../views/Transfer')
const Networks = () => import('../views/Networks')
const ImportKey = () => import('../views/ImportKey')



export const RouteNames = {
	POP_OUT:'popout',

    LOGIN:'login',
    HOME:'home',
    WALLET:'wallet',
    ITEMS:'items',
    NETWORKS:'networks',
    ASSETS:'assets',
    TRANSFER:'transfer',


    APP:'app',
    ACCOUNT:'account',
    IMPORT_KEY:'importKey',

    // NEW_KEYPAIR:'newKeypair',
    // KEYPAIR:'keypair',
    // IDENTITY:'identity',
    // TOKENS:'tokens',
    // TOKEN:'token',
    // TRANSFER:'transfer',
    // PERMISSION:'permission',
    // TERMS:'terms',
    // ONBOARDING:'onboarding',
    // SETTINGS:'settings',
    //
    // // POPOUT
};

const RouteViews = {
    [RouteNames.LOGIN]:Login,
    [RouteNames.HOME]:Home,
    [RouteNames.WALLET]:Wallet,
    [RouteNames.ITEMS]:Items,
    [RouteNames.NETWORKS]:Networks,
    [RouteNames.ASSETS]:Assets,
    [RouteNames.TRANSFER]:Transfer,


    [RouteNames.APP]:App,
    [RouteNames.ACCOUNT]:Account,
    [RouteNames.IMPORT_KEY]:ImportKey,
    [RouteNames.POP_OUT]:PopOut,
};

const RoutePaths = {
	[RouteNames.HOME]: '/',
	[RouteNames.APP]: '/:applink',
	[RouteNames.ACCOUNT]: '/:unique',
	// [RouteNames.KEYPAIR]: '/keypair/:id',
	// [RouteNames.PERMISSION]: '/permission/:origin',
	// [RouteNames.SETTINGS]: '/settings/:panel',
	// [RouteNames.TOKEN]: '/token/:id',
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
