const rateLimit = require('express-rate-limit');

/**
 * API RATE LIMITING
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { apiLimiter };
