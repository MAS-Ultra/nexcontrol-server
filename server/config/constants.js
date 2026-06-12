/**
 * NEXCONTROL SERVER CONSTANTS
 * Optimized for low latency streaming
 */

module.exports = {
    PORT: process.env.PORT || 3000,

    VERSION: '4.0.0',

    // Reduce buffer pressure
    MAX_PAYLOAD_SIZE: 2 * 1024 * 1024, // 2MB

    // Faster disconnect detection
    HEARTBEAT_TIMEOUT: 15000,

    // Cleanup intervals
    CLEANUP_INTERVAL: 30000,

    // Remove dead rooms faster
    STALE_ROOM_THRESHOLD: 15 * 60 * 1000,

    ID_PREFIX: 'NC-',

    ROLES: Object.freeze({
        MANAGER: 'manager',
        ASSISTANT: 'assistant'
    }),

    EVENTS: Object.freeze({
        JOIN_ROOM: 'join_room',
        ROOM_READY: 'room_ready',

        PARTNER_JOINED: 'partner_joined',
        PARTNER_LEFT: 'partner_left',

        PING_HEARTBEAT: 'ping_heartbeat',
        ASSISTANT_STATUS: 'assistant_status',

        CAMERA_FRAME: 'camera_frame',
        SCREEN_FRAME: 'screen_frame',
        AUDIO_CHUNK: 'audio_chunk',
        LOCATION: 'location_update',

        COMMAND: 'command',
        NOTIFICATION: 'notification'
    }),

    STREAM: Object.freeze({

        // Frame relay tuning
        CAMERA_MAX_FPS: 15,

        SCREEN_MAX_FPS: 12,

        AUDIO_PACKET_MS: 20,

        // Volatile events only
        USE_VOLATILE_STREAMS: true,

        // Drop stale frames
        FRAME_EXPIRY_MS: 500
    })
};