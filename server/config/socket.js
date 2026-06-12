const { Server } = require('socket.io');

const {
    MAX_PAYLOAD_SIZE
} = require('../config/constants');

const { log } = require('../middleware/logger');

const roomHandler = require('./roomHandler');
const streamHandler = require('./streamHandler');
const commandHandler = require('./commandHandler');
const heartbeatHandler = require('./heartbeatHandler');

/**
 * NEXCONTROL SOCKET SERVER
 * Ultra Low Latency Optimized
 */

const initSocket = (server) => {

    const io = new Server(server, {

        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        },

        maxHttpBufferSize: MAX_PAYLOAD_SIZE,

        transports: ['websocket'],

        allowUpgrades: false,

        pingTimeout: 30000,

        pingInterval: 10000,

        perMessageDeflate: false,

        serveClient: false,

        connectTimeout: 20000
    });

    io.engine.on('connection_error', (err) => {

        log(
            'warn',
            `Connection Error: ${err.message}`
        );

    });

    io.on('connection', (socket) => {

        socket.setMaxListeners(25);

        log(
            'info',
            `Connected: ${socket.id}`
        );

        roomHandler(io, socket);

        streamHandler(io, socket);

        commandHandler(io, socket);

        heartbeatHandler(io, socket);

        socket.on('error', (err) => {

            log(
                'error',
                `Socket Error: ${err.message}`,
                socket.deviceId
            );

        });

    });

    log(
        'success',
        'Socket.IO Initialized'
    );

    return io;
};

module.exports = {
    initSocket
};