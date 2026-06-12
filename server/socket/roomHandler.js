const { log } = require('../middleware/logger');
const roomService = require('../services/roomService');
const statusService = require('../services/statusService');
const { isValidDeviceId } = require('../utils/deviceValidator');
const { ROLES, EVENTS } = require('../config/constants');

module.exports = (io, socket) => {

    socket.on(EVENTS.JOIN_ROOM, (payload = {}) => {

        try {

            let {
                roomId: deviceId,
                role
            } = payload;

            if (
                !deviceId ||
                typeof deviceId !== 'string'
            ) {
                return socket.disconnect(true);
            }

            if (
                role !== ROLES.MANAGER &&
                role !== ROLES.ASSISTANT
            ) {
                return socket.disconnect(true);
            }

            if (!isValidDeviceId(deviceId)) {
                return socket.disconnect(true);
            }

            const room =
                roomService.getOrCreateRoom(deviceId);

            const now = Date.now();

            // Remove old session
            if (role === ROLES.ASSISTANT) {

                if (
                    room.assistant &&
                    room.assistant.socketId !== socket.id
                ) {

                    io.sockets.sockets
                        .get(room.assistant.socketId)
                        ?.disconnect(true);

                    log(
                        'warn',
                        'Old Assistant Removed',
                        deviceId
                    );
                }

                room.assistant = {
                    socketId: socket.id,
                    startTime: now,
                    lastSeen: now
                };

                room.status.status = 'online';
                room.status.lastSeen = now;

            } else {

                if (
                    room.manager &&
                    room.manager.socketId !== socket.id
                ) {

                    io.sockets.sockets
                        .get(room.manager.socketId)
                        ?.disconnect(true);

                    log(
                        'warn',
                        'Old Manager Removed',
                        deviceId
                    );
                }

                room.manager = {
                    socketId: socket.id,
                    startTime: now
                };
            }

            room.lastActivity = now;

            socket.deviceId = deviceId;
            socket.role = role;

            socket.join(deviceId);

            log(
                'info',
                `${role} joined room`,
                deviceId
            );

            socket.to(deviceId)
                .emit(
                    EVENTS.PARTNER_JOINED,
                    { role }
                );

            if (
                room.assistant &&
                room.manager
            ) {

                io.to(deviceId)
                    .emit(
                        EVENTS.ROOM_READY,
                        {
                            roomId: deviceId
                        }
                    );

                log(
                    'success',
                    'Room Ready',
                    deviceId
                );
            }

            if (
                role === ROLES.MANAGER
            ) {

                socket.emit(
                    EVENTS.ASSISTANT_STATUS,
                    room.status
                );
            }

        } catch (err) {

            log(
                'error',
                `Join Error: ${err.message}`
            );

            socket.disconnect(true);
        }

    });

    socket.on('disconnect', (reason) => {

        try {

            const {
                deviceId,
                role
            } = socket;

            if (!deviceId) {
                return;
            }

            const room =
                roomService.getRoom(deviceId);

            if (!room) {
                return;
            }

            log(
                'warn',
                `Disconnected (${reason})`,
                deviceId
            );

            if (
                role === ROLES.ASSISTANT
            ) {

                const status =
                    statusService
                        .setAssistantOffline(
                            deviceId,
                            reason
                        );

                if (status) {

                    io.to(deviceId)
                        .emit(
                            EVENTS.ASSISTANT_STATUS,
                            status
                        );
                }

            } else {

                room.manager = null;
            }

            socket.to(deviceId)
                .emit(
                    EVENTS.PARTNER_LEFT,
                    {
                        role,
                        reason
                    }
                );

        } catch (err) {

            log(
                'error',
                `Disconnect Error: ${err.message}`
            );

        }

    });

};