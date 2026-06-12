const { log } = require('../middleware/logger');
const roomService = require('./roomService');

const {
    HEARTBEAT_TIMEOUT,
    STALE_ROOM_THRESHOLD,
    EVENTS
} = require('../config/constants');

/**
 * NEXCONTROL CLEANUP SERVICE
 * Production Optimized
 */

class CleanupService {

    constructor() {
        this.io = null;
        this.presenceInterval = null;
        this.pruneInterval = null;
    }

    init(io) {

        if (this.presenceInterval || this.pruneInterval) {
            log('warn', 'Cleanup Service already initialized');
            return;
        }

        this.io = io;

        this.presenceInterval = setInterval(
            () => this.presenceMonitor(),
            5000
        );

        this.pruneInterval = setInterval(
            () => this.memoryPruner(),
            60000
        );

        log('success', 'Cleanup Service Initialized');
    }

    presenceMonitor() {

        try {

            const now = Date.now();
            const rooms = roomService.getAllRooms();

            for (const [deviceId, room] of rooms.entries()) {

                if (
                    room.assistant &&
                    (now - room.assistant.lastSeen > HEARTBEAT_TIMEOUT)
                ) {

                    log(
                        'warn',
                        'Assistant heartbeat timeout',
                        deviceId
                    );

                    try {

                        const socket =
                            this.io?.sockets?.sockets?.get(
                                room.assistant.socketId
                            );

                        if (socket) {
                            socket.disconnect(true);
                        }

                    } catch (_) {}

                    room.assistant = null;

                    room.status = {
                        ...room.status,
                        status: 'offline',
                        lastSeen: now,
                        disconnectReason: 'heartbeat_timeout'
                    };

                    this.io
                        ?.to(deviceId)
                        .emit(
                            EVENTS.ASSISTANT_STATUS,
                            room.status
                        );
                }
            }

        } catch (err) {

            log(
                'error',
                `Presence monitor failure: ${err.message}`
            );

        }
    }

    memoryPruner() {

        try {

            const now = Date.now();
            const rooms = roomService.getAllRooms();

            let removed = 0;

            for (const [deviceId, room] of rooms.entries()) {

                const isActive =
                    room.assistant ||
                    room.manager;

                if (
                    !isActive &&
                    (now - room.lastActivity >
                        STALE_ROOM_THRESHOLD)
                ) {

                    roomService.deleteRoom(deviceId);

                    removed++;
                }
            }

            if (removed > 0) {

                log(
                    'info',
                    `Removed ${removed} stale rooms`
                );

            }

        } catch (err) {

            log(
                'error',
                `Memory pruner failure: ${err.message}`
            );

        }
    }

    destroy() {

        if (this.presenceInterval) {
            clearInterval(this.presenceInterval);
            this.presenceInterval = null;
        }

        if (this.pruneInterval) {
            clearInterval(this.pruneInterval);
            this.pruneInterval = null;
        }

        log(
            'info',
            'Cleanup Service Stopped'
        );
    }
}

module.exports = new CleanupService();