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
export function parseUserAgent(req, res, next) {
    const ua = req.get('User-Agent') || 'Unknown';
    res.locals.userAgent = {
        raw: ua,
        browser: extractBrowser(ua),
        os: extractOS(ua),
    };
    next();
}
