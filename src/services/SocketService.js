import ApiService from '../services/ApiService';

let io = null;

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
        socket.emit('api', await ApiService.handler(Object.assign(request.data, {plugin:request.plugin})));
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
        namespace.on('connection', socket => {
            socketHandler(socket);
        })
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
