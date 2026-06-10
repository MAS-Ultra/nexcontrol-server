/**
 * NEXCONTROL MODULAR RELAY SERVER
 * -----------------------------------------
 * Lead Backend Architect: AI Assistant
 * Status: Production Ready
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');

const { PORT, VERSION } = require('./config/constants');
const { log } = require('./middleware/logger');
const { apiLimiter } = require('./middleware/rateLimit');
const { initSocket } = require('./socket/socket');
const roomService = require('./services/roomService');
const cleanupService = require('./services/cleanupService');
const { getRoomStats } = require('./utils/helpers');

// Routes
const appsRoutes = require('./routes/apps.routes');
const filesRoutes = require('./routes/files.routes');
const locationRoutes = require('./routes/location.routes');

const app = express();
const server = http.createServer(app);

// --- MIDDLEWARE ---
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '25mb' }));
app.use('/apps', apiLimiter);
app.use('/files', apiLimiter);
app.use('/location', apiLimiter);

// --- ROUTES ---
app.get('/', (req, res) => {
    const stats = getRoomStats(roomService.getAllRooms());
    res.json({
        status: 'NexControl Modular Server Operational',
        version: VERSION,
        uptime: process.uptime(),
        memory: process.memoryUsage().rss,
        stats: {
            ...stats,
            loadFactor: (stats.managers + stats.assistants) / 1000
        }
    });
});

app.use('/apps', appsRoutes);
app.use('/files', filesRoutes);
app.use('/location', locationRoutes);

// --- INITIALIZATION ---
const io = initSocket(server);
cleanupService.init(io);

// --- GRACEFUL SHUTDOWN ---
const shutdown = (signal) => {
    log('warn', `${signal} received. Closing server...`);
    server.close(() => {
        log('success', 'Server closed gracefully');
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// --- STARTUP ---
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 NEXCONTROL MODULAR RELAY v${VERSION}`);
    console.log(`📡 Status: OPERATIONAL`);
    console.log(`🔋 Port: ${PORT}`);
    console.log(`🛡️ Security: ENFORCED`);
    console.log(`⏱️ Heartbeat: 15s/30s\n`);
});
