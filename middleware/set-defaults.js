// Set Defaults Middleware
export function setDefaults(config) {
    return (req, res, next) => {
        res.locals.appName = config.appName;
        res.locals.version = config.version;
        res.locals.middlewareChain = [];
        next();
    };
}
