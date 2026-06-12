const { EVENTS, ROLES } = require('../config/constants');
const roomService = require('../services/roomService');
const statusService = require('../services/statusService');
const { log } = require('../middleware/logger');

/**
 * NEXCONTROL HEARTBEAT HANDLER
 * Production Optimized
 */

module.exports = (io, socket) => {

    socket.on(EVENTS.PING_HEARTBEAT, (data = {}) => {

        try {

            if (
                !socket.deviceId ||
                socket.role !== ROLES.ASSISTANT
            ) {
                return;
            }

            const room =
                roomService.getRoom(
                    socket.deviceId
                );

            if (!room || !room.assistant) {
                return;
            }

            const now = Date.now();

            room.lastActivity = now;
            room.assistant.lastSeen = now;

            if (
                typeof data !== 'object' ||
                Array.isArray(data)
            ) {
                return;
            }

            const updatedStatus =
                statusService.updateAssistantStatus(
                    socket.deviceId,
                    data
                );

            socket.volatile
                .to(socket.deviceId)
                .emit(
                    EVENTS.ASSISTANT_STATUS,
                    updatedStatus
                );

        } catch (err) {

            log(
                'error',
                `Heartbeat error: ${err.message}`,
                socket.deviceId
            );

        }

    });

};