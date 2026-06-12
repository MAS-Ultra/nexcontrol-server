const express = require('express');
const router = express.Router();

const statusService = require('../services/statusService');
const {
    validateRoomId,
    validatePayload
} = require('../middleware/validation');

const { log } = require('../middleware/logger');

/**
 * APP LIST ENDPOINTS
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
                'apps',
                payload
            );

            log('info', 'Apps synchronized', roomId);

            // Notify Manager via Socket
            const io = req.app.get('io');
            if (io) {
                io.to(roomId).emit('notification', {
                    type: 'sync',
                    target: 'apps',
                    timestamp: Date.now()
                });
            }

            return res.status(200).json({
                success: true,
                timestamp: Date.now()
            });

        } catch (err) {
            log('error', `Apps update failed: ${err.message}`);

            return res.status(500).json({
                success: false,
                error: 'Failed to update app list'
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
                'apps'
            );

            if (!data) {
                return res.status(404).json({
                    success: false,
                    error: 'No app data available'
                });
            }

            return res.status(200).json(data);

        } catch (err) {
            log('error', `Apps fetch failed: ${err.message}`);

            return res.status(500).json({
                success: false,
                error: 'Failed to fetch app list'
            });
        }
    }
);

module.exports = router;