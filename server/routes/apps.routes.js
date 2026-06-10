const express = require('express');
const router = express.Router();
const statusService = require('../services/statusService');
const { validateRoomId, validatePayload } = require('../middleware/validation');
const { log } = require('../middleware/logger');

/**
 * APP LIST ENDPOINTS
 */
router.post('/:roomId', validateRoomId, validatePayload, (req, res) => {
    const { roomId } = req.params;
    statusService.updateProData(roomId, 'apps', req.body);
    log('success', 'App list updated', roomId);
    res.json({ success: true });
});

router.get('/:roomId', validateRoomId, (req, res) => {
    const { roomId } = req.params;
    const data = statusService.getProData(roomId, 'apps');
    if (!data) return res.status(404).json({ error: 'No app data available' });
    res.json(data);
});

module.exports = router;
