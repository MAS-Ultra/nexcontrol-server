const { formatTimestamp } = require('../utils/helpers');

const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

const CURRENT_LEVEL =
    process.env.NODE_ENV === 'production'
        ? LOG_LEVELS.INFO
        : LOG_LEVELS.DEBUG;

function log(level, message, deviceId = 'SYSTEM') {

    const levelMap = {
        error: LOG_LEVELS.ERROR,
        warn: LOG_LEVELS.WARN,
        info: LOG_LEVELS.INFO,
        success: LOG_LEVELS.INFO,
        sync: LOG_LEVELS.DEBUG,
        debug: LOG_LEVELS.DEBUG
    };

    if ((levelMap[level] ?? LOG_LEVELS.INFO) > CURRENT_LEVEL) {
        return;
    }

    console.log(
        `[${formatTimestamp()}] [${level.toUpperCase()}] [${deviceId}] ${message}`
    );
}

module.exports = { log };