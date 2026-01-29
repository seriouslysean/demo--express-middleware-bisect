import crypto from 'crypto';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Request Logger Middleware
function requestLogger(req, res, next) {
    const start = performance.now();
    res.on('finish', () => {
        const duration = Math.round(performance.now() - start);
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });
    next();
}

// Request ID Middleware
function requestId(req, res, next) {
    req.id = crypto.randomUUID();
    res.locals.requestId = req.id;
    next();
}

// Response Time Middleware
function responseTime(req, res, next) {
    const start = performance.now();
    res.on('finish', () => {
        const duration = (performance.now() - start).toFixed(2);
        res.setHeader('X-Response-Time', `${duration}ms`);
    });
    next();
}

// Set Defaults Middleware
function setDefaults(config) {
    return (req, res, next) => {
        res.locals.appName = config.appName;
        res.locals.version = config.version;
        res.locals.middlewareChain = [];
        next();
    };
}

app.use(requestLogger);
app.use(requestId);
app.use(responseTime);
app.use(setDefaults({
    appName: 'Express Middleware Demo',
    version: '1.0.0',
}));

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>${res.locals.appName}</title>
    <style>
        body { font-family: monospace; padding: 2rem; background: #1a1a2e; color: #eee; }
        h1 { color: #00d9ff; }
    </style>
</head>
<body>
    <h1>${res.locals.appName}</h1>
    <p>Version: ${res.locals.version}</p>
    <p>Request ID: ${res.locals.requestId}</p>
</body>
</html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
