// Custom Headers Middleware
export function customHeaders(req, res, next) {
    res.set('X-Powered-By', 'Express Middleware Demo');
    res.set('X-Request-Id', res.locals.requestId);
    res.locals.middlewareChain?.push({
        name: 'customHeaders',
        data: 'X-Powered-By, X-Request-Id',
    });
    next();
}
