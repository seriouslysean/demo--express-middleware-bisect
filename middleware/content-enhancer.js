// Content Enhancer Middleware
export function contentEnhancer(req, res, next) {
    res.locals.enhancedContent = {
        greeting: 'Welcome to the demo!',
        // BUG: This should not be here
        debugInfo: '<p>THIS IS A BUG</p>',
    };
    res.locals.middlewareChain?.push({
        name: 'contentEnhancer',
        data: res.locals.enhancedContent.greeting,
    });
    next();
}
