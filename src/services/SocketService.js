import ApiService from '../services/ApiService';
import AuthorizedApp from '../models/AuthorizedApp';
import {store} from '../store/store';
import * as Actions from '../store/constants';
import Hasher from '../util/Hasher';
import Error from '../models/errors/Error';

import {Popup} from '../models/popups/Popup'
import PopupService from '../services/PopupService';

let io = null;

let rekeyPromise;
const getNewKey = socket => new Promise((resolve, reject) => {
    rekeyPromise = {resolve, reject};
    socket.emit('rekey');
});

const socketHandler = (socket) => {

    // TODO: Testing the event system.
    // Events are sent to the plugins to notify them of changes
    // such as identity changes, key removals, account un-linking
    // and scatter being locked.
    // setInterval(() => {
    //     if(authenticated)
    //         socket.emit('event', 'evented');
    // }, 2000);


    // When something connects we automatically
    // notify it of a successful connection
    socket.emit('connected');

    // All authenticated api requests pass through the 'api' route.
    socket.on('api', async request => {
        if(request.data.hasOwnProperty('appkey')){
            const existingApp = store.state.scatter.keychain.findApp(request.data.payload.origin);
            if(!existingApp) return;
            if(!existingApp.checkKey(request.data.appkey)) return;
        }

        socket.emit('api', await ApiService.handler(Object.assign(request.data, {plugin:request.plugin})));
    });

    socket.on('rekeyed', async request => {
        rekeyPromise.resolve(request);
    });

    socket.on('pair', async request => {
        const scatter = store.state.scatter;
        const existingApp = scatter.keychain.findApp(request.data.origin);
        const linkApp = {
            type:'linkApp',
            payload:request.data
        };

        const addAuthorizedApp = (newKey = null) => {
            const authedApp = new AuthorizedApp(request.data.origin, newKey ? newKey : request.data.appkey);
            const clone = scatter.clone();
            clone.keychain.updateOrPushApp(authedApp);
            store.dispatch(Actions.SET_SCATTER, clone);
            socket.emit('paired', true);
        };

        if(existingApp){
            if(request.data.appkey.indexOf('appkey:') > -1){
                PopupService.push(Popup.popout(linkApp, ({result}) => {
                    if(result) addAuthorizedApp(null);
                    else socket.emit('paired', false);
                }))
            } else {
                if(!existingApp) return socket.emit('paired', false);
                return socket.emit('paired', existingApp.checkKey(request.data.appkey));
            }
        }

        else {
            PopupService.push(Popup.popout(linkApp, async ({result}) => {
                if(result) {
                    if(request.data.appkey.indexOf('appkey:') === -1) {
                        const newKey = await getNewKey(socket);
                        if(newKey.data.origin !== request.data.origin || newKey.data.appkey.indexOf('appkey:') === -1) return socket.emit('paired', false);
                        addAuthorizedApp(newKey.data.appkey)
                    } else {
                        addAuthorizedApp();
                    }
                }
                else socket.emit('paired', false);
            }))

        }
    });

    socket.on('disconnect', () => {

    });
};

export default class SocketService {

    static initialize(){
        const server = window.require('http').createServer();
        server.listen(50005, 'localhost');
        io = window.require('socket.io').listen(server);
    }

    static open(){
        const namespace = io.of(`/scatter`);
        namespace.on('connection', socket => socketHandler(socket))
    }

    static close(){
        // Getting namespace
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
    }

}
