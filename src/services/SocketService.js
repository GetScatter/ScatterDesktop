import {store} from '../store/store'
import * as Actions from '../store/constants'

import {Popup} from '../models/popups/Popup';
import PopupService from '../services/PopupService';
import WindowService from '../services/WindowService';
import ApiService from '../services/ApiService';
import RSAService from '../services/RSAService';
import {AppLinkPairing} from '../models/AppLink';

let io = null;

const socketIsOpen = appLink => Object.keys(io.nsps).includes(`/${appLink.id}`);
const getAllLinkedApps = () => store.state.scatter ? store.state.scatter.keychain.linkedApps : [];

const appLinkConnections = {};
const authentications = {};

const socketHandler = (socket) => {


    const getAppLink = () => getAllLinkedApps().find(x => x.id === socket.nsp.name.replace('/',''));
    const getPairing = plugin => getAppLink().whitelist.find(x => x.plugin === plugin);

    authentications[getAppLink().id] = {};

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


    socket.on('identify', data => {
        // Only specified origins
        if(!data.hasOwnProperty('plugin') || data.plugin.length < 3) return false;
        // Only specified pins ( 64 char min, RSA type pkcs8 public key )
        if(!data.hasOwnProperty('pin') || data.pin.length < 64) return false;

        const scatter = store.state.scatter.clone();
        const appLink = getAppLink();
        const pairing = AppLinkPairing.fromJson({plugin:data.plugin, pin:data.pin});

        const updateScatter = () => {
            scatter.keychain.updateOrPushAppLink(appLink);
            return store.dispatch(Actions.SET_SCATTER, scatter);
        };

        const allow = whitelist => {
            appLinkConnections[getAppLink().id] = (appLinkConnections[getAppLink().id] || 0) + 1;
            socket.emit('auth', true);
        };

        // Origin is blacklisted
        if(appLink.blacklist.includes(data.plugin)) return;

        const whitelist = appLink.whitelist.find(x => x.unique() === pairing.unique());
        if(whitelist){
            // Mismatched pin
            if(whitelist.pin !== data.pin) return;

            // Whitelist passes, letting the client through.
            else return allow(whitelist);
        }

        WindowService.flashWindow();
        PopupService.push(Popup.prompt("App Requesting Access", `${data.plugin} is requesting access to use Scatter`, "eye", "Allow", async accepted => {
            if(!accepted) {
                // blacklisting app
                appLink.blacklist.push(data.plugin);
                await updateScatter();
                socket.emit('auth', false);
                return socket.disconnect();
            }

            // Whitelisting app
            appLink.whitelist.push(pairing);
            await updateScatter();

            allow();

        }, "Blacklist"))
    });


    // All authenticated api requests pass through the 'api' route.
    socket.on('api', async request => {
        const pairing = getPairing(request.plugin);
        if(!pairing) return;
        const key = RSAService.publicToKey(pairing.pin);
        const decrypted = RSAService.decrypt(request.data, key);
        if(!decrypted) return;
        socket.emit('api', await ApiService.handler(Object.assign(decrypted, {plugin:pairing.plugin})));
    });


    socket.on('disconnect', () => {
        appLinkConnections[getAppLink().id] =
            (appLinkConnections[getAppLink().id] || 1) - 1;
    });
};

export default class SocketService {

    static initialize(){
        io = window.require('socket.io').listen(50005);
    }

    static getConnectionCount(appLink){
        return appLinkConnections[appLink.id] || 0;
    }

    static open(appLink){
        if(socketIsOpen(appLink)) return false;

        PopupService.push(Popup.snackbar("Application Link Activated: " + appLink.name));

        const namespace = io.of(`/${appLink.id}`);
        namespace.on('connection', socket => {
            socketHandler(socket);
        })
    }

    static close(appLink){
        if(!socketIsOpen(appLink)) return false;

        PopupService.push(Popup.snackbar("Application Link Deactivated: " + appLink.name));

        // Getting namespace
        const socket = io.of(`/${appLink.id}`);

        // Disconnecting all active connections to this namespace
        Object.keys(socket.connected).map(socketId => {
            socket.connected[socketId].disconnect();
        });

        // Removing all event emitter listeners.
        socket.removeAllListeners();

        // Deleting the namespace from the array of
        // available namespaces for connections
        delete io.nsps[`/${appLink.id}`];
    }

    static openAllDefaults(){
        const appLinks = getAllLinkedApps();
        appLinks.map(app => {
            if(app.enabledByDefault)
                this.open(app);
            else app.isListening = false;
        });
    }

    static closeAll(){
        const appLinks = getAllLinkedApps();
        appLinks.map(app => this.close(app));
        io.close();
        io = null;
    }

}