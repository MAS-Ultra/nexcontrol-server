const { log } = require('../middleware/logger');

/**
 * ROOM STATE MANAGEMENT SERVICE
 */
class RoomService {
    constructor() {
        this.rooms = new Map();
    }

    getOrCreateRoom(deviceId) {
        if (!this.rooms.has(deviceId)) {
            this.rooms.set(deviceId, {
                assistant: null, // { socketId, startTime, lastSeen }
                manager: null,   // { socketId, startTime }
                status: { status: 'offline', lastSeen: Date.now() },
                proData: { apps: [], location: null, files: null },
                lastActivity: Date.now()
            });
            log('success', 'Room Created', deviceId);
        }
        const room = this.rooms.get(deviceId);
        room.lastActivity = Date.now();
        return room;
    }

    getRoom(deviceId) {
        return this.rooms.get(deviceId);
    }

    deleteRoom(deviceId) {
        return this.rooms.delete(deviceId);
    }

    getAllRooms() {
        return this.rooms;
    }
}

module.exports = new RoomService();
