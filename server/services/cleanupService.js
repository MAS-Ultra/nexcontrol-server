const { log } = require('../middleware/logger');
const roomService = require('./roomService');
const { HEARTBEAT_TIMEOUT, STALE_ROOM_THRESHOLD } = require('../config/constants');

/**
 * BACKGROUND MAINTENANCE WORKERS
 */
class CleanupService {
    init(io) {
        this.io = io;
        setInterval(() => this.presenceMonitor(), 5000);
        setInterval(() => this.memoryPruner(), 60000);
        log('success', 'Cleanup Service Initialized');
    }

    presenceMonitor() {
        const now = Date.now();
        const rooms = roomService.getAllRooms();

        rooms.forEach((room, deviceId) => {
            if (room.assistant && (now - room.assistant.lastSeen > HEARTBEAT_TIMEOUT)) {
                log('error', 'Heartbeat Timeout - Pruning Assistant', deviceId);
                const socket = this.io.sockets.sockets.get(room.assistant.socketId);
                if (socket) socket.disconnect(true);

                room.assistant = null;
                room.status.status = 'offline';
                room.status.lastSeen = now;
                room.status.disconnectReason = 'heartbeat_timeout';
                this.io.to(deviceId).emit('assistant_status', room.status);
            }
        });
    }

    memoryPruner() {
        const now = Date.now();
        const rooms = roomService.getAllRooms();
        let pruned = 0;

        rooms.forEach((room, deviceId) => {
            const isActive = room.assistant || room.manager;
            if (!isActive && (now - room.lastActivity > STALE_ROOM_THRESHOLD)) {
                roomService.deleteRoom(deviceId);
                pruned++;
            }
        });

        if (pruned > 0) log('info', `Memory Cleanup: Pruned ${pruned} stale rooms`);
    }
}

module.exports = new CleanupService();
