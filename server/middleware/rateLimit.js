const rateLimit = require('express-rate-limit');

/**
 * NEXCONTROL API RATE LIMITER
 * Optimized for Production
 */

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minutes

    max: process.env.NODE_ENV === 'production'
        ? 2000
        : 10000,

    standardHeaders: true,
    legacyHeaders: false,

    skipSuccessfulRequests: false,

    message: {
        success: false,
        error: 'Rate limit exceeded'
    },

    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Too many requests',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

module.exports = {
    apiLimiter
};