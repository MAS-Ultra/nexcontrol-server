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

const {
    getRoomStats,
    bytesToMB
} = require('./utils/helpers');

const appsRoutes = require('./routes/apps.routes');
const filesRoutes = require('./routes/files.routes');
const locationRoutes = require('./routes/location.routes');

const app = express();

app.set('trust proxy', 1);

const server = http.createServer(app);

/**
 * SECURITY
 */

app.use(
    helmet({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: false
    })
);

app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST']
    })
);

/**
 * BODY PARSER
 */

app.use(
    express.json({
        limit: '5mb'
    })
);

/**
 * RATE LIMIT
 */

app.use('/apps', apiLimiter);
app.use('/files', apiLimiter);
app.use('/location', apiLimiter);

/**
 * HEALTH CHECK
 */

app.get('/health', (req, res) => {

    res.status(200).json({
        status: 'ok',
        timestamp: Date.now()
    });

});

/**
 * DASHBOARD
 */

app.get('/', (req, res) => {

    const stats =
        getRoomStats(
            roomService.getAllRooms()
        );

    const memory =
        process.memoryUsage();

    res.json({

        status: 'online',

        version: VERSION,

        uptime: Math.floor(
            process.uptime()
        ),

        memory: {
            rssMB: bytesToMB(memory.rss),
            heapUsedMB: bytesToMB(memory.heapUsed),
            heapTotalMB: bytesToMB(memory.heapTotal)
        },

        stats

    });

});

/**
 * ROOMS DISCOVERY
 */

app.get('/rooms', (req, res) => {
    const rooms = roomService.getAllRooms();
    const discoveryList = [];

    rooms.forEach((room, deviceId) => {
        if (room.assistant && room.status.status === 'online') {
            discoveryList.push({
                roomId: deviceId,
                lastSeen: room.status.lastSeen,
                model: room.status.model || 'Unknown Device'
            });
        }
    });

    res.json({
        rooms: discoveryList,
        count: discoveryList.length
    });
});

/**
 * ROUTES
 */

app.use('/apps', appsRoutes);
app.use('/files', filesRoutes);
app.use('/location', locationRoutes);

/**
 * SOCKET SERVER
 */

const io = initSocket(server);

/**
 * CLEANUP SERVICE
 */

cleanupService.init(io);

/**
 * SHUTDOWN
 */

function shutdown(signal) {

    log(
        'warn',
        `${signal} received`
    );

    server.close(() => {

        log(
            'success',
            'Server closed'
        );

        process.exit(0);
    });

    setTimeout(() => {

        process.exit(1);

    }, 10000);

}

process.on(
    'SIGTERM',
    () => shutdown('SIGTERM')
);

process.on(
    'SIGINT',
    () => shutdown('SIGINT')
);

/**
 * START
 */

server.listen(
    PORT,
    '0.0.0.0',
    () => {

        log(
            'success',
            `NexControl v${VERSION} running on ${PORT}`
        );

    }
);