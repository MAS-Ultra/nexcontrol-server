const roomService = require('./roomService');

/**
 * DEVICE STATUS AND PRESENCE SERVICE
 */
class StatusService {
    updateAssistantStatus(deviceId, statusData) {
        const room = roomService.getOrCreateRoom(deviceId);
        room.status = {
            ...room.status,
            ...statusData,
            status: 'online',
            lastSeen: Date.now()
        };
        return room.status;
    }

    setAssistantOffline(deviceId, reason) {
        const room = roomService.getRoom(deviceId);
        if (room) {
            room.assistant = null;
            room.status.status = 'offline';
            room.status.lastSeen = Date.now();
            room.status.disconnectReason = reason;
            return room.status;
        }
        return null;
    }

    updateProData(deviceId, type, data) {
        const room = roomService.getOrCreateRoom(deviceId);
        room.proData[type] = data;
        room.lastActivity = Date.now();
    }

    getProData(deviceId, type) {
        const room = roomService.getRoom(deviceId);
        return room ? room.proData[type] : null;
    }
}

module.exports = new StatusService();
