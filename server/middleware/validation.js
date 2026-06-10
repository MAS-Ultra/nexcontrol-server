const { isValidDeviceId } = require('../utils/deviceValidator');

/**
 * REST API INPUT VALIDATION
 */
const validateRoomId = (req, res, next) => {
    const { roomId } = req.params;
    if (!isValidDeviceId(roomId)) {
        return res.status(400).json({ error: 'Invalid Device ID format' });
    }
    next();
};

const validatePayload = (req, res, next) => {
    if (!req.body) {
        return res.status(400).json({ error: 'Payload missing' });
    }
    next();
};

module.exports = {
    validateRoomId,
    validatePayload
};
