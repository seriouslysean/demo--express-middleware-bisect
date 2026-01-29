import crypto from 'crypto';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Helper to track middleware execution
function trackMiddleware(name, data) {
    return (req, res, next) => {
        if (res.locals.middlewareChain) {
            res.locals.middlewareChain.push({ name, data: data(req, res) });
        }
        next();
    };
}

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

// CSP Nonce Middleware
function setCspNonce(req, res, next) {
    let nonce = '';
    try {
        nonce = crypto.randomBytes(24).toString('base64');
    } catch (e) {
        console.error('Error generating CSP nonce:', e);
    }
    res.locals.cspNonce = nonce;
    next();
}

// User Agent Parser Helpers
function extractBrowser(ua) {
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
}

function extractOS(ua) {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
}

// User Agent Parser Middleware
function parseUserAgent(req, res, next) {
    const ua = req.get('User-Agent') || 'Unknown';
    res.locals.userAgent = {
        raw: ua,
        browser: extractBrowser(ua),
        os: extractOS(ua),
    };
    next();
}

app.use(requestLogger);
app.use(requestId);
app.use(trackMiddleware('requestId', (req) => `Generated ID: ${req.id}`));
app.use(responseTime);
app.use(trackMiddleware('responseTime', () => 'Timing response...'));
app.use(setDefaults({
    appName: 'Express Middleware Demo',
    version: '1.0.0',
}));
app.use(trackMiddleware('setDefaults', (req, res) => `App: ${res.locals.appName} v${res.locals.version}`));
app.use(setCspNonce);
app.use(trackMiddleware('setCspNonce', (req, res) => `Nonce: ${res.locals.cspNonce.substring(0, 8)}...`));
app.use(parseUserAgent);
app.use(trackMiddleware('parseUserAgent', (req, res) => `${res.locals.userAgent.browser} on ${res.locals.userAgent.os}`));

app.get('/', (req, res) => {
    const middlewareHtml = res.locals.middlewareChain
        .map(m => `
            <div class="middleware">
                <div class="middleware-name">${m.name}</div>
                <div class="middleware-data">${m.data}</div>
            </div>
        `)
        .join('');

    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>${res.locals.appName}</title>
    <style>
        body { font-family: monospace; padding: 2rem; background: #1a1a2e; color: #eee; }
        h1 { color: #00d9ff; }
        h2 { color: #ff6b6b; margin-top: 2rem; }
        .middleware { background: #16213e; padding: 1rem; margin: 0.5rem 0; border-radius: 4px; border-left: 3px solid #00d9ff; }
        .middleware-name { font-weight: bold; color: #00d9ff; }
        .middleware-data { color: #a0a0a0; font-size: 0.9em; margin-top: 0.25rem; }
        .info { background: #16213e; padding: 1rem; border-radius: 4px; margin: 0.5rem 0; }
    </style>
</head>
<body>
    <h1>${res.locals.appName}</h1>
    <div class="info">
        <p>Version: ${res.locals.version}</p>
        <p>Request ID: ${res.locals.requestId}</p>
    </div>

    <h2>Middleware Execution Order:</h2>
    ${middlewareHtml}
</body>
</html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
