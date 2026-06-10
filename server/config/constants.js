/**
 * NEXCONTROL SERVER CONSTANTS
 */
module.exports = {
    PORT: process.env.PORT || 3000,
    VERSION: '3.1.0',
    MAX_PAYLOAD_SIZE: 25 * 1024 * 1024, // 25MB
    HEARTBEAT_TIMEOUT: 30000, // 30 seconds
    CLEANUP_INTERVAL: 60000, // 1 minute
    STALE_ROOM_THRESHOLD: 3600000, // 1 hour
    ID_PREFIX: 'NC-',
    ROLES: {
        MANAGER: 'manager',
        ASSISTANT: 'assistant'
    },
    EVENTS: {
        JOIN_ROOM: 'join_room',
        ROOM_READY: 'room_ready',
        PARTNER_JOINED: 'partner_joined',
        PARTNER_LEFT: 'partner_left',
        PING_HEARTBEAT: 'ping_heartbeat',
        ASSISTANT_STATUS: 'assistant_status',
        CAMERA_FRAME: 'camera_frame',
        SCREEN_FRAME: 'screen_frame',
        AUDIO_CHUNK: 'audio_chunk',
        COMMAND: 'command',
        NOTIFICATION: 'notification'
    }
};
