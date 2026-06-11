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
        let finalRoomId = deviceId;

        // --- GLOBAL AUTO-CONNECT LOGIC ---
        // If the user wants devices to automatically find each other,
        // we can use a "Lobby" system or simply default to the first available room.
        // For this specific request: "Check if a room exists, if so join it, else create one"

        const allRooms = roomService.getAllRooms();
        let existingRoomId = null;

        // Look for any active room that needs a partner
        for (const [id, room] of allRooms.entries()) {
            if (role === ROLES.ASSISTANT && !room.assistant) {
                existingRoomId = id;
                break;
            }
            if (role === ROLES.MANAGER && !room.manager) {
                existingRoomId = id;
                break;
            }
        }

        if (existingRoomId) {
            finalRoomId = existingRoomId;
            log('info', `Auto-Linking ${role} to existing room: ${finalRoomId}`);
        } else {
            log('info', `No existing partner room found for ${role}. Using/Creating: ${finalRoomId}`);
        }

        // 1. Validate Input (Using the potentially new finalRoomId)
        if (!isValidDeviceId(finalRoomId)) {
            log('error', `Rejected Join: Invalid DeviceID Format (${finalRoomId})`);
            return socket.disconnect(true);
        }
        if (role !== ROLES.MANAGER && role !== ROLES.ASSISTANT) {
            log('error', 'Rejected Join: Invalid Role', deviceId);
            return socket.disconnect(true);
        }

        const room = roomService.getOrCreateRoom(finalRoomId);

        // 2. Handle Duplicate Sessions
        if (role === ROLES.ASSISTANT) {
            if (room.assistant && room.assistant.socketId !== socket.id) {
                log('warn', 'Assistant Collision: Evicting stale session', finalRoomId);
                io.sockets.sockets.get(room.assistant.socketId)?.disconnect(true);
            }
            room.assistant = { socketId: socket.id, startTime: Date.now(), lastSeen: Date.now() };
            room.status.status = 'online';
            room.status.lastSeen = Date.now();
        } else {
            if (room.manager && room.manager.socketId !== socket.id) {
                log('warn', 'Manager Collision: Evicting stale session', finalRoomId);
                io.sockets.sockets.get(room.manager.socketId)?.disconnect(true);
            }
            room.manager = { socketId: socket.id, startTime: Date.now() };
        }

        // 3. Assign Context
        socket.deviceId = finalRoomId;
        socket.role = role;
        socket.join(finalRoomId);

        log('success', `${role.toUpperCase()} Synchronized`, finalRoomId);

        // 4. Notify Partner
        socket.to(finalRoomId).emit(EVENTS.PARTNER_JOINED, { role });

        // 5. Handshake if Ready
        if (room.assistant && room.manager) {
            io.to(finalRoomId).emit(EVENTS.ROOM_READY, { roomId: finalRoomId });
            log('success', 'Handshake Complete', finalRoomId);
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
