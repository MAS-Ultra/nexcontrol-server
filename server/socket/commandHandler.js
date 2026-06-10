const { EVENTS, ROLES } = require('../config/constants');
const { log } = require('../middleware/logger');

/**
 * COMMAND AND NOTIFICATION RELAY
 */
module.exports = (io, socket) => {
    socket.on(EVENTS.COMMAND, (data) => {
        if (socket.deviceId && socket.role === ROLES.MANAGER) {
            log('sync', `Relaying Command: ${data.type}`, socket.deviceId);
            socket.to(socket.deviceId).emit(EVENTS.COMMAND, data);
        }
    });

    socket.on(EVENTS.NOTIFICATION, (data) => {
        if (socket.deviceId && socket.role === ROLES.ASSISTANT) {
            socket.to(socket.deviceId).emit(EVENTS.NOTIFICATION, data);
        }
    });
};
