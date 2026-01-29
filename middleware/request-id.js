import crypto from 'crypto';

// Request ID Middleware
export function requestId(req, res, next) {
    req.id = crypto.randomUUID();
    res.locals.requestId = req.id;
    next();
}
