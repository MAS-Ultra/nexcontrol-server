const { EVENTS, ROLES } = require('../config/constants');
const roomService = require('../services/roomService');
const statusService = require('../services/statusService');

/**
 * HEARTBEAT AND REAL-TIME STATUS SYNC
 */
module.exports = (io, socket) => {
    socket.on(EVENTS.PING_HEARTBEAT, (data) => {
        if (!socket.deviceId || socket.role !== ROLES.ASSISTANT) return;

        const room = roomService.getRoom(socket.deviceId);
        if (!room) return;

        room.lastActivity = Date.now();
        room.assistant.lastSeen = Date.now();

        // Update and relay status
        if (data && typeof data === 'object') {
            const updatedStatus = statusService.updateAssistantStatus(socket.deviceId, data);
            socket.volatile.to(socket.deviceId).emit(EVENTS.ASSISTANT_STATUS, updatedStatus);
        }
    });
};
