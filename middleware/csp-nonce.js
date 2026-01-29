import crypto from 'crypto';

// CSP Nonce Middleware
export function setCspNonce(req, res, next) {
    let nonce = '';
    try {
        nonce = crypto.randomBytes(24).toString('base64');
    } catch (e) {
        console.error('Error generating CSP nonce:', e);
    }
    res.locals.cspNonce = nonce;
    next();
}
