/**
 * NEXCONTROL DEVICE VALIDATOR
 * Production Optimized
 */

const { ID_PREFIX } = require('../config/constants');

const DEVICE_ID_REGEX =
    /^NC-[A-Z0-9]{6,32}$/;

function isValidDeviceId(deviceId) {

    if (
        !deviceId ||
        typeof deviceId !== 'string'
    ) {
        return false;
    }

    if (
        deviceId.length < 9 ||
        deviceId.length > 35
    ) {
        return false;
    }

    if (
        !deviceId.startsWith(ID_PREFIX)
    ) {
        return false;
    }

    return DEVICE_ID_REGEX.test(deviceId);
}

function sanitizeDeviceId(deviceId) {

    if (
        typeof deviceId !== 'string'
    ) {
        return null;
    }

    return deviceId
        .trim()
        .toUpperCase();
}

module.exports = {
    isValidDeviceId,
    sanitizeDeviceId
};