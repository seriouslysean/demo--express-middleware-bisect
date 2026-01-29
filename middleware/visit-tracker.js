// Visit Tracker Middleware
export function visitTracker(req, res, next) {
    const visits = parseInt(req.cookies?.visits || '0', 10) + 1;
    res.cookie('visits', visits.toString(), { maxAge: 86400000 });
    res.locals.visits = visits;
    next();
}
