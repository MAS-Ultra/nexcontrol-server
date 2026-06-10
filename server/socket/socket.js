const { Server } = require('socket.io');
const { MAX_PAYLOAD_SIZE } = require('../config/constants');
const { log } = require('../middleware/logger');

const roomHandler = require('./roomHandler');
const streamHandler = require('./streamHandler');
const commandHandler = require('./commandHandler');
const heartbeatHandler = require('./heartbeatHandler');

/**
 * SOCKET.IO INITIALIZATION
 */
const initSocket = (server) => {
    const io = new Server(server, {
        cors: { origin: '*', methods: ['GET', 'POST'] },
        maxHttpBufferSize: MAX_PAYLOAD_SIZE,
        pingTimeout: 20000,
        pingInterval: 10000,
        transports: ['websocket', 'polling']
    });

    io.on('connection', (socket) => {
        log('info', `Underlying Connection Established: ${socket.id}`);

        // Register Handlers
        roomHandler(io, socket);
        streamHandler(io, socket);
        commandHandler(io, socket);
        heartbeatHandler(io, socket);
    });

    return io;
};

module.exports = { initSocket };
