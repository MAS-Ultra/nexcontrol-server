const express = require('express');
const router = express.Router();

const statusService = require('../services/statusService');
const { validateRoomId, validatePayload } = require('../middleware/validation');
const { log } = require('../middleware/logger');

/**
 * FILE EXPLORER ENDPOINTS
 */

router.post('/:roomId', validateRoomId, validatePayload, (req, res) => {
    const { roomId } = req.params;

    statusService.updateProData(roomId, 'files', req.body);

    log('success', 'File list updated', roomId);

    res.json({
        success: true
    });
});

router.get('/:roomId', validateRoomId, (req, res) => {
    const { roomId } = req.params;

    const data = statusService.getProData(roomId, 'files');

    if (!data) {
        return res.status(404).json({
            error: 'No file data available'
        });
    }

    res.json(data);
});

module.exports = router;