// Response Time Middleware
export function responseTime(req, res, next) {
    const start = performance.now();
    res.on('finish', () => {
        const duration = (performance.now() - start).toFixed(2);
        res.setHeader('X-Response-Time', `${duration}ms`);
    });
    next();
}
