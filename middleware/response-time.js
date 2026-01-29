// Response Time Middleware
export function responseTime(req, res, next) {
    const start = performance.now();
    const originalWriteHead = res.writeHead.bind(res);
    res.writeHead = function (statusCode, statusMessage, headers) {
        const duration = (performance.now() - start).toFixed(2);
        res.setHeader('X-Response-Time', `${duration}ms`);
        return originalWriteHead(statusCode, statusMessage, headers);
    };
    res.locals.middlewareChain?.push({
        name: 'responseTime',
        data: 'Timing response...',
    });
    next();
}
