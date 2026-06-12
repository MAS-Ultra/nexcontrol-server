const { log } = require('../middleware/logger');

/**
 * NEXCONTROL ROOM SERVICE
 * Production Optimized
 */

class RoomService {

    constructor() {
        this.rooms = new Map();
    }

    getOrCreateRoom(deviceId) {

        let room = this.rooms.get(deviceId);

        if (!room) {

            const now = Date.now();

            room = {
                assistant: null,
                manager: null,

                status: {
                    status: 'offline',
                    lastSeen: now
                },

                proData: {
                    apps: null,
                    location: null,
                    files: null
                },

                createdAt: now,
                lastActivity: now
            };

            this.rooms.set(deviceId, room);

            log(
                'info',
                `Room Created (Total: ${this.rooms.size})`,
                deviceId
            );
        }

        room.lastActivity = Date.now();

        return room;
    }

    getRoom(deviceId) {
        return this.rooms.get(deviceId) || null;
    }

    deleteRoom(deviceId) {

        const deleted = this.rooms.delete(deviceId);

        if (deleted) {

            log(
                'info',
                `Room Deleted (Total: ${this.rooms.size})`,
                deviceId
            );

        }

        return deleted;
    }

    getAllRooms() {
        return this.rooms;
    }

    getRoomCount() {
        return this.rooms.size;
    }

    roomExists(deviceId) {
        return this.rooms.has(deviceId);
    }

    touch(deviceId) {

        const room = this.rooms.get(deviceId);

        if (room) {
            room.lastActivity = Date.now();
        }

        return room;
    }
}

module.exports = new RoomService();