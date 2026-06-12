const { EVENTS, ROLES } = require('../config/constants');
const { log } = require('../middleware/logger');

/**
 * NEXCONTROL COMMAND HANDLER
 * Production Optimized
 */

module.exports = (io, socket) => {

    socket.on(EVENTS.COMMAND, (data) => {

        try {

            if (
                !socket.deviceId ||
                socket.role !== ROLES.MANAGER
            ) {
                return;
            }

            if (
                !data ||
                typeof data !== 'object' ||
                !data.type
            ) {
                return;
            }

            // Command relay
            socket
                .to(socket.deviceId)
                .emit(EVENTS.COMMAND, data);

            // Log only important commands
            if (
                process.env.NODE_ENV !== 'production'
            ) {
                log(
                    'debug',
                    `Command: ${data.type}`,
                    socket.deviceId
                );
            }

        } catch (err) {

            log(
                'error',
                `Command relay failed: ${err.message}`,
                socket.deviceId
            );

        }

    });

    socket.on(EVENTS.NOTIFICATION, (data) => {

        try {

            if (
                !socket.deviceId ||
                socket.role !== ROLES.ASSISTANT
            ) {
                return;
            }

            if (
                !data ||
                typeof data !== 'object'
            ) {
                return;
            }

            // Notification relay
            socket.volatile
                .to(socket.deviceId)
                .emit(EVENTS.NOTIFICATION, data);

        } catch (err) {

            log(
                'error',
                `Notification relay failed: ${err.message}`,
                socket.deviceId
            );

        }

    });

};