const { EVENTS, ROLES } = require('../config/constants');
const { log } = require('../middleware/logger');

/**
 * NEXCONTROL STREAM RELAY
 * Ultra Low Latency Optimized
 */

module.exports = (io, socket) => {

    socket.on(EVENTS.CAMERA_FRAME, (data) => {

        if (
            !socket.deviceId ||
            socket.role !== ROLES.ASSISTANT
        ) {
            return;
        }

        if (!data) {
            return;
        }

        socket.volatile
            .to(socket.deviceId)
            .emit(
                EVENTS.CAMERA_FRAME,
                data
            );
    });

    socket.on(EVENTS.SCREEN_FRAME, (data) => {

        if (
            !socket.deviceId ||
            socket.role !== ROLES.ASSISTANT
        ) {
            return;
        }

        if (!data) {
            return;
        }

        socket.volatile
            .to(socket.deviceId)
            .emit(
                EVENTS.SCREEN_FRAME,
                data
            );
    });

    socket.on(EVENTS.AUDIO_CHUNK, (data) => {

        if (
            !socket.deviceId ||
            socket.role !== ROLES.ASSISTANT
        ) {
            return;
        }

        if (!data) {
            return;
        }

        // Audio shouldn't be volatile
        socket
            .to(socket.deviceId)
            .emit(
                EVENTS.AUDIO_CHUNK,
                data
            );
    });

    socket.on(EVENTS.LOCATION, (data) => {

        if (
            !socket.deviceId ||
            socket.role !== ROLES.ASSISTANT
        ) {
            return;
        }

        if (!data) {
            return;
        }

        socket
            .to(socket.deviceId)
            .emit(
                EVENTS.LOCATION,
                data
            );
    });

};