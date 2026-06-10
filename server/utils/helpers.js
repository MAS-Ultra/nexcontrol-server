/**
 * HELPER UTILITIES
 */
const formatTimestamp = (date = new Date()) => {
    return date.toISOString();
};

const getRoomStats = (rooms) => {
    let managers = 0, assistants = 0;
    rooms.forEach(r => {
        if (r.manager) managers++;
        if (r.assistant) assistants++;
    });
    return { activeRooms: rooms.size, managers, assistants };
};

module.exports = {
    formatTimestamp,
    getRoomStats
};
