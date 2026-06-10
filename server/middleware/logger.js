/**
 * CUSTOM LOGGING ENGINE
 */
const { formatTimestamp } = require('../utils/helpers');

const log = (level, msg, deviceId = 'SYSTEM') => {
    const icons = { info: 'ℹ️', warn: '⚠️', error: '❌', success: '✅', sync: '🔄' };
    console.log(`[${formatTimestamp()}] [${deviceId}] ${icons[level] || '🔹'} ${msg}`);
};

module.exports = { log };
