const express = require('express');
const router = express.Router();

const statusService = require('../services/statusService');
const {
    validateRoomId,
    validatePayload
} = require('../middleware/validation');

const { log } = require('../middleware/logger');

/**
 * FILE EXPLORER ENDPOINTS
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
                'files',
                payload
            );

            log(
                'info',
                `Files synchronized (${payload.files?.length || 0} items)`,
                roomId
            );

            return res.status(200).json({
                success: true,
                timestamp: Date.now()
            });

        } catch (err) {
            log(
                'error',
                `File sync failed: ${err.message}`,
                req.params.roomId
            );

            return res.status(500).json({
                success: false,
                error: 'Failed to update file list'
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
                'files'
            );

            if (!data) {
                return res.status(404).json({
                    success: false,
                    error: 'No file data available'
                });
            }

            return res.status(200).json(data);

        } catch (err) {
            log(
                'error',
                `File fetch failed: ${err.message}`,
                req.params.roomId
            );

            return res.status(500).json({
                success: false,
                error: 'Failed to fetch files'
            });
        }
    }
);

module.exports = router;