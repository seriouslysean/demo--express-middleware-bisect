import cookieParser from 'cookie-parser';
import express from 'express';

import {
    contentEnhancer,
    customHeaders,
    errorHandler,
    normalizeUrl,
    parseUserAgent,
    requestId,
    requestLogger,
    responseTime,
    setCspNonce,
    setDefaults,
    visitTracker,
} from './middleware/index.js';

const app = express();
app.use(cookieParser());
const PORT = process.env.PORT || 3000;

app.use(normalizeUrl);
app.use(requestLogger);
app.use(setDefaults({
    appName: 'Express Middleware Demo',
    version: '1.0.0',
}));
app.use(requestId);
app.use(responseTime);
app.use(setCspNonce);
app.use(parseUserAgent);
app.use(contentEnhancer);
app.use(visitTracker);
app.use(customHeaders);

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
        <p>Visits: ${res.locals.visits}</p>
    </div>

    <h2>Middleware Execution Order:</h2>
    ${middlewareHtml}

    ${res.locals.enhancedContent.debugInfo}
</body>
</html>
    `);
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
