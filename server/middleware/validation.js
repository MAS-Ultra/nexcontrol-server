const { isValidDeviceId } = require('../utils/deviceValidator');

/**
 * NEXCONTROL INPUT VALIDATION
 * Production Optimized
 */

const validateRoomId = (req, res, next) => {
    try {
        const roomId = req.params.roomId;

        if (
            !roomId ||
            typeof roomId !== 'string' ||
            !isValidDeviceId(roomId)
        ) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Device ID'
            });
        }

        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Validation Error'
        });
    }
};

const validatePayload = (req, res, next) => {
    try {
        const body = req.body;

        if (!body) {
            return res.status(400).json({
                success: false,
                error: 'Payload missing'
            });
        }

        if (typeof body !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'Payload must be JSON'
            });
        }

        if (Array.isArray(body)) {
            return res.status(400).json({
                success: false,
                error: 'Payload cannot be array'
            });
        }

        if (Object.keys(body).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Empty payload'
            });
        }

        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Payload validation failed'
        });
    }
};

module.exports = {
    validateRoomId,
    validatePayload
};