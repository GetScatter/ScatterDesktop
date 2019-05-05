const PopOut = () => import('../views/PopOut')

const Login = () => import('../views/Login')
const Home = () => import('../views/Apps')
const App = () => import('../views/App')
const Assets = () => import('../views/Assets')
const Wallet = () => import('../views/Wallet')
const Account = () => import('../views/Account')
const Items = () => import('../views/Items')
const Transfer = () => import('../views/Transfer')
const Exchange = () => import('../views/Exchange')
const Receive = () => import('../views/Receive')
const Networks = () => import('../views/Networks')
const Contacts = () => import('../views/Contacts')



export const RouteNames = {
	POP_OUT:'popout',

	LOGIN:'login',
	HOME:'home',
	WALLET:'wallet',
	ITEMS:'items',
	NETWORKS:'networks',
	ASSETS:'assets',
	TRANSFER:'transfer',
	RECEIVE:'receive',
	EXCHANGE:'exchange',
	CONTACTS:'contacts',


	APP:'app',
	ACCOUNT:'account',
};

const RouteViews = {
	[RouteNames.LOGIN]:Login,
	[RouteNames.HOME]:Home,
	[RouteNames.WALLET]:Wallet,
	[RouteNames.ITEMS]:Items,
	[RouteNames.NETWORKS]:Networks,
	[RouteNames.ASSETS]:Assets,
	[RouteNames.TRANSFER]:Transfer,
	[RouteNames.RECEIVE]:Receive,
	[RouteNames.EXCHANGE]:Exchange,
	[RouteNames.CONTACTS]:Contacts,


	[RouteNames.APP]:App,
	[RouteNames.ACCOUNT]:Account,
	[RouteNames.POP_OUT]:PopOut,
};

const RoutePaths = {
	[RouteNames.HOME]: '/',
	[RouteNames.APP]: '/:applink',
	[RouteNames.ACCOUNT]: '/:unique',
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
