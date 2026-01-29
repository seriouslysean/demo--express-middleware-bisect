// Request Logger Middleware
export function requestLogger(req, res, next) {
    const start = performance.now();
    res.on('finish', () => {
        const duration = Math.round(performance.now() - start);
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });
    next();
}
