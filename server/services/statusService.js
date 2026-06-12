const roomService = require('./roomService');

/**
 * NEXCONTROL STATUS SERVICE
 * Production Optimized
 */

class StatusService {

    constructor() {
        this.allowedTypes = new Set([
            'apps',
            'files',
            'location'
        ]);
    }

    updateAssistantStatus(deviceId, statusData = {}) {

        const room =
            roomService.getOrCreateRoom(deviceId);

        const now = Date.now();

        room.status = {
            ...room.status,
            ...statusData,
            status: 'online',
            lastSeen: now
        };

        room.lastActivity = now;

        return room.status;
    }

    setAssistantOffline(deviceId, reason = 'unknown') {

        const room =
            roomService.getRoom(deviceId);

        if (!room) {
            return null;
        }

        const now = Date.now();

        room.assistant = null;

        room.status = {
            ...room.status,
            status: 'offline',
            lastSeen: now,
            disconnectReason: reason
        };

        room.lastActivity = now;

        return room.status;
    }

    updateProData(deviceId, type, data) {

        if (!this.allowedTypes.has(type)) {
            return false;
        }

        const room =
            roomService.getOrCreateRoom(deviceId);

        const now = Date.now();

        room.proData[type] = {
            data,
            updatedAt: now
        };

        room.lastActivity = now;

        return true;
    }

    getProData(deviceId, type) {

        if (!this.allowedTypes.has(type)) {
            return null;
        }

        const room =
            roomService.getRoom(deviceId);

        if (!room) {
            return null;
        }

        return room.proData[type];
    }

    getAssistantStatus(deviceId) {

        const room =
            roomService.getRoom(deviceId);

        return room
            ? room.status
            : null;
    }
}

module.exports = new StatusService();