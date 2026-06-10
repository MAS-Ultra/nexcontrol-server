/**
 * DEVICE VALIDATION LOGIC
 */
const { ID_PREFIX } = require('../config/constants');

const isValidDeviceId = (deviceId) => {
    return typeof deviceId === 'string' && deviceId.startsWith(ID_PREFIX);
};

module.exports = {
    isValidDeviceId
};
