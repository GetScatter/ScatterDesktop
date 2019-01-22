import ApiService from '../services/ApiService';
import AuthorizedApp from '../models/AuthorizedApp';
import {store} from '../store/store';
import * as Actions from '../store/constants';
const http = window.require('http');
const https = window.require('https');

import {Popup} from '../models/popups/Popup'
import PopupService from '../services/PopupService';

import {remote} from "../util/ElectronHelpers";
remote.getGlobal('appShared').QuitWatcher = () => {
	SocketService.broadcastEvent('dced', {});
};

let io = window.require('socket.io')();


let openConnections = {};

let rekeyPromise;
const getNewKey = socket => new Promise((resolve, reject) => {
    rekeyPromise = {resolve, reject};
    socket.emit('rekey');
});

const socketHandler = (socket) => {
	let origin = null;


    // When something connects we automatically
    // notify it of a successful connection
    socket.emit('connected');

    // All authenticated api requests pass through the 'api' route.
    socket.on('api', async request => {
	    if(!request.plugin || request.plugin.length > 35) return socket.emit('api', {id:request.id, result:null});
	    request.plugin = request.plugin.replace(/\s/g, "");

        // 2 way authentication
	    const existingApp = store.state.scatter.keychain.findApp(request.data.payload.origin);

	    const updateNonce = async () => {
		    const clone = store.state.scatter.clone();
		    existingApp.nextNonce = request.data.nextNonce;
		    clone.keychain.updateOrPushApp(existingApp);
		    return store.dispatch(Actions.SET_SCATTER, clone);
	    };

	    const removeAppPermissions = async () => {
		    const clone = store.state.scatter.clone();
		    clone.keychain.removeApp(existingApp);
		    return store.dispatch(Actions.SET_SCATTER, clone);
	    };


	    if(!existingApp) return;
	    if(!existingApp.checkKey(request.data.appkey)) return;
	    if(existingApp.nextNonce.length && !existingApp.checkNonce(request.data.nonce)) await removeAppPermissions();
	    else await updateNonce();

	    if(!origin){
		    origin = existingApp.origin;
		    openConnections[origin] = socket;
	    }

        socket.emit('api', await ApiService.handler(Object.assign(request.data, {plugin:request.plugin})));
    });

    socket.on('rekeyed', async request => {
        rekeyPromise.resolve(request);
    });

    socket.on('disconnect', async request => {
        delete openConnections[origin];
    });

    socket.on('pair', async request => {
        const scatter = store.state.scatter;
        const existingApp = scatter.keychain.findApp(request.data.origin);
        const linkApp = {
            type:'linkApp',
            payload:request.data
        };

        if(request.data.passthrough)
            return socket.emit('paired', existingApp && existingApp.checkKey(request.data.appkey));

        const addAuthorizedApp = async (newKey = null) => {
            const authedApp = new AuthorizedApp(request.data.origin, newKey ? newKey : request.data.appkey);
            const clone = scatter.clone();
            clone.keychain.updateOrPushApp(authedApp);
            await store.dispatch(Actions.SET_SCATTER, clone);
            socket.emit('paired', true);
        };

        const repair = async () => {
            const newKey = await getNewKey(socket);
            if(newKey.data.origin !== request.data.origin || newKey.data.appkey.indexOf('appkey:') === -1) return socket.emit('paired', false);
            return addAuthorizedApp(newKey.data.appkey)
        }

        if(existingApp){
            if(existingApp.checkKey(request.data.appkey)) return socket.emit('paired', true);
            else PopupService.push(Popup.popout(linkApp, async ({result}) => {
                if(result) return repair();
                else socket.emit('paired', false);
            }));
        }
        else return repair();
    });
};

const getCerts = async () => {
    return fetch('https://certs.get-scatter.com?rand='+Math.round(Math.random()*100 + 1))
        .then(res => res.json())
        .catch(() => console.error('Could not fetch certs. Probably due to a proxy, vpn, or firewall.'));
};


const ip = '127.0.0.1';
export default class SocketService {

    static async initialize(){

        const options = { pingTimeout:100000000000000000 };

        // HTTP protocol (port 50005)
        const httpServer = http.createServer();
        httpServer.listen(50005,ip);
        io.attach(httpServer,options);

        // HTTPS protocol (port 50006)
        const certs = await getCerts();
        if(certs && certs.hasOwnProperty('key') && certs.hasOwnProperty('cert')){
            const httpsServer = https.createServer(certs);
            httpsServer.listen(50006, ip);
            io.attach(httpsServer,options);
        } else {
            PopupService.push(Popup.prompt("Couldn't fetch certificates",
                'There was an issue trying to fetch the certificates which allow Scatter to run on SSL. This is usually caused by proxies, firewalls, and anti-viruses.'))
        }

	    const namespace = io.of(`/scatter`);
	    namespace.on('connection', socket => socketHandler(socket));
        return true;
    }

    static async close(){
        // Getting namespace
        if(!io) return;
        const socket = io.of(`/scatter`);

        // Disconnecting all active connections to this namespace
        Object.keys(socket.connected).map(socketId => {
            socket.connected[socketId].disconnect();
        });

        // Removing all event emitter listeners.
        socket.removeAllListeners();

        // Deleting the namespace from the array of
        // available namespaces for connections
        delete io.nsps[`/scatter`];

	    return true;
    }

    static sendEvent(event, payload, origin){
    	if(!openConnections.hasOwnProperty(origin)) return false;
    	const socket = openConnections[origin];
	    socket.emit('event', {event, payload});
	    return true;
    }

    static broadcastEvent(event, payload){
    	Object.keys(openConnections).map(origin => {
		    this.sendEvent(event, payload, origin);
	    });
    	return true;
    }

}
