const { EVENTS, ROLES } = require('../config/constants');

/**
 * VOLATILE BINARY DATA RELAY (CAMERA, SCREEN, AUDIO)
 */
module.exports = (io, socket) => {
    socket.on(EVENTS.CAMERA_FRAME, (data) => {
        if (socket.deviceId && socket.role === ROLES.ASSISTANT) {
            socket.volatile.to(socket.deviceId).emit(EVENTS.CAMERA_FRAME, data);
        }
    });

    socket.on(EVENTS.SCREEN_FRAME, (data) => {
        if (socket.deviceId && socket.role === ROLES.ASSISTANT) {
            socket.volatile.to(socket.deviceId).emit(EVENTS.SCREEN_FRAME, data);
        }
    });

    socket.on(EVENTS.AUDIO_CHUNK, (data) => {
        if (socket.deviceId && socket.role === ROLES.ASSISTANT) {
            socket.to(socket.deviceId).emit(EVENTS.AUDIO_CHUNK, data);
        }
    });
};
