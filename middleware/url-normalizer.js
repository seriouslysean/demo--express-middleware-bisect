// URL Normalizer Middleware
export function normalizeUrl(req, res, next) {
    if (req.path.includes('//')) {
        const normalized = req.path.replace(/\/+/g, '/');
        return res.redirect(301, normalized);
    }
    next();
}
