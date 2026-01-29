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

app.use(requestLogger);
app.use(requestId);

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Express Middleware Demo</title>
    <style>
        body { font-family: monospace; padding: 2rem; background: #1a1a2e; color: #eee; }
        h1 { color: #00d9ff; }
    </style>
</head>
<body>
    <h1>Express Middleware Chain Demo</h1>
    <p>Request ID: ${res.locals.requestId}</p>
</body>
</html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
