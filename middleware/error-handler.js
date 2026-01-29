// Error Handler Middleware
export function errorHandler(err, req, res, next) {
    console.error('Error:', { error: err.message, requestId: req.id });
    res.status(500).send(`
<!DOCTYPE html>
<html>
<head>
    <title>Error</title>
    <style>
        body { font-family: monospace; padding: 2rem; background: #1a1a2e; color: #eee; }
        h1 { color: #ff6b6b; }
        .error-box { background: #16213e; padding: 1rem; border-radius: 4px; border-left: 3px solid #ff6b6b; }
    </style>
</head>
<body>
    <h1>Error</h1>
    <div class="error-box">
        <p>${err.message}</p>
        <p>Request ID: ${req.id}</p>
    </div>
</body>
</html>
    `);
}
