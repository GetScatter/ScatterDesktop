import PopOut from '../views/PopOut';
import Scatter from '../views/Scatter';
import Login from '../views/Login';

export const RouteNames = {
	POP_OUT:'popout',
	SCATTER:'scatter',
	LOGIN:'login',
};

const RouteViews = {
	[RouteNames.LOGIN]:Login,
	[RouteNames.SCATTER]:Scatter,
	[RouteNames.POP_OUT]:PopOut,
};

const RoutePaths = {
	[RouteNames.SCATTER]: '/',
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
		].includes(routeName)
	}

}
