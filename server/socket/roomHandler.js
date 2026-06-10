const { log } = require('../middleware/logger');
const roomService = require('../services/roomService');
const statusService = require('../services/statusService');
const { isValidDeviceId } = require('../utils/deviceValidator');
const { ROLES, EVENTS } = require('../config/constants');

/**
 * ROOM JOIN AND COLLISION LOGIC
 */
module.exports = (io, socket) => {
    socket.on(EVENTS.JOIN_ROOM, ({ roomId: deviceId, role }) => {
        // 1. Validate Input
        if (!isValidDeviceId(deviceId)) {
            log('error', `Rejected Join: Invalid DeviceID Format (${deviceId})`);
            return socket.disconnect(true);
        }
        if (role !== ROLES.MANAGER && role !== ROLES.ASSISTANT) {
            log('error', 'Rejected Join: Invalid Role', deviceId);
            return socket.disconnect(true);
        }

        const room = roomService.getOrCreateRoom(deviceId);

        // 2. Handle Duplicate Sessions
        if (role === ROLES.ASSISTANT) {
            if (room.assistant && room.assistant.socketId !== socket.id) {
                log('warn', 'Assistant Collision: Evicting stale session', deviceId);
                io.sockets.sockets.get(room.assistant.socketId)?.disconnect(true);
            }
            room.assistant = { socketId: socket.id, startTime: Date.now(), lastSeen: Date.now() };
            room.status.status = 'online';
            room.status.lastSeen = Date.now();
        } else {
            if (room.manager && room.manager.socketId !== socket.id) {
                log('warn', 'Manager Collision: Evicting stale session', deviceId);
                io.sockets.sockets.get(room.manager.socketId)?.disconnect(true);
            }
            room.manager = { socketId: socket.id, startTime: Date.now() };
        }

        // 3. Assign Context
        socket.deviceId = deviceId;
        socket.role = role;
        socket.join(deviceId);

        log('success', `${role.toUpperCase()} Synchronized`, deviceId);

        // 4. Notify Partner
        socket.to(deviceId).emit(EVENTS.PARTNER_JOINED, { role });

        // 5. Handshake if Ready
        if (room.assistant && room.manager) {
            io.to(deviceId).emit(EVENTS.ROOM_READY, { roomId: deviceId });
            log('success', 'Handshake Complete', deviceId);
        }

        // 6. Sync Status for Manager
        if (role === ROLES.MANAGER) {
            socket.emit(EVENTS.ASSISTANT_STATUS, room.status);
        }
    });

    socket.on('disconnect', (reason) => {
        const { deviceId, role } = socket;
        if (!deviceId) return;

        log('warn', `Session Terminated (${reason})`, deviceId);

        if (role === ROLES.ASSISTANT) {
            const status = statusService.setAssistantOffline(deviceId, reason);
            if (status) {
                io.to(deviceId).emit(EVENTS.ASSISTANT_STATUS, status);
            }
        } else {
            const room = roomService.getRoom(deviceId);
            if (room) room.manager = null;
        }

        socket.to(deviceId).emit(EVENTS.PARTNER_LEFT, { role, reason });
    });
};
