/**
 * NEXCONTROL HELPER UTILITIES
 * Production Optimized
 */

function formatTimestamp(date = Date.now()) {
    return new Date(date).toISOString();
}

function getRoomStats(rooms) {

    let managers = 0;
    let assistants = 0;
    let onlineRooms = 0;

    for (const room of rooms.values()) {

        if (room.manager) {
            managers++;
        }

        if (room.assistant) {
            assistants++;
        }

        if (
            room.manager &&
            room.assistant
        ) {
            onlineRooms++;
        }
    }

    return {
        totalRooms: rooms.size,
        onlineRooms,
        managers,
        assistants
    };
}

function safeJsonParse(data, fallback = null) {

    try {
        return JSON.parse(data);
    } catch {
        return fallback;
    }

}

function bytesToMB(bytes) {

    return (
        bytes /
        1024 /
        1024
    ).toFixed(2);

}

module.exports = {
    formatTimestamp,
    getRoomStats,
    safeJsonParse,
    bytesToMB
};