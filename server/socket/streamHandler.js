const { EVENTS, ROLES } = require('../config/constants');
const { log } = require('../middleware/logger');

/**
 * NEXCONTROL STREAM RELAY
 * Ultra Low Latency Optimized
 */

module.exports = (io, socket) => {

    const FRAME_EXPIRY_MS = 500;

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

        // Drop if no manager in room
        const room = io.sockets.adapter.rooms.get(socket.deviceId);
        if (!room || room.size < 2) {
            return;
        }

        // Frame expiry if timestamp exists
        if (data.timestamp && (Date.now() - data.timestamp > FRAME_EXPIRY_MS)) {
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

        // Drop if no manager in room
        const room = io.sockets.adapter.rooms.get(socket.deviceId);
        if (!room || room.size < 2) {
            return;
        }

        // Frame expiry if timestamp exists
        if (data.timestamp && (Date.now() - data.timestamp > FRAME_EXPIRY_MS)) {
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

        // Audio should be volatile to prevent clogging the pipe during congestion
        socket.volatile
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