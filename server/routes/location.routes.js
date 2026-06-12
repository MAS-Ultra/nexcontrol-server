const express = require('express');
const router = express.Router();

const statusService = require('../services/statusService');
const {
    validateRoomId,
    validatePayload
} = require('../middleware/validation');

const { log } = require('../middleware/logger');

/**
 * LOCATION TRACKING ENDPOINTS
 * Production Optimized
 */

router.post(
    '/:roomId',
    validateRoomId,
    validatePayload,
    (req, res) => {
        try {
            const { roomId } = req.params;

            const payload = {
                ...req.body,
                updatedAt: Date.now()
            };

            statusService.updateProData(
                roomId,
                'location',
                payload
            );

            log(
                'info',
                'Location synchronized',
                roomId
            );

            // Notify Manager via Socket
            const io = req.app.get('io');
            if (io) {
                io.to(roomId).emit('notification', {
                    type: 'sync',
                    target: 'location',
                    timestamp: Date.now()
                });
            }

            return res.status(200).json({
                success: true,
                timestamp: Date.now()
            });

        } catch (err) {

            log(
                'error',
                `Location update failed: ${err.message}`,
                req.params.roomId
            );

            return res.status(500).json({
                success: false,
                error: 'Failed to update location'
            });
        }
    }
);

router.get(
    '/:roomId',
    validateRoomId,
    (req, res) => {
        try {
            const { roomId } = req.params;

            const data = statusService.getProData(
                roomId,
                'location'
            );

            if (!data) {
                return res.status(404).json({
                    success: false,
                    error: 'No location data available'
                });
            }

            return res.status(200).json(data);

        } catch (err) {

            log(
                'error',
                `Location fetch failed: ${err.message}`,
                req.params.roomId
            );

            return res.status(500).json({
                success: false,
                error: 'Failed to fetch location'
            });
        }
    }
);

module.exports = router;