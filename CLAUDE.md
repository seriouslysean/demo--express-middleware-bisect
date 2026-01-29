# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This is a demo project for teaching Express middleware patterns and git bisect workflow. It intentionally contains a bug (`<p>THIS IS A BUG</p>` in HTML output) introduced in the `contentEnhancer` middleware for bisect practice.

## Commands

```bash
npm install    # Install dependencies
npm start      # Start server at http://localhost:3000
```

## Code Style

- ESM modules (`"type": "module"` in package.json)
- 4-space indentation
- Single quotes
- Trailing commas

## Architecture

**Entry point:** `index.js` - Express app that registers middlewares and serves an HTML page visualizing the middleware chain.

**Middleware pattern:** Each middleware is a separate file in `middleware/` exporting a single function. The barrel export (`middleware/index.js`) re-exports all middlewares.

**Request flow:** `normalizeUrl` → `requestLogger` → `requestId` → `responseTime` → `setDefaults` → `setCspNonce` → `parseUserAgent` → `contentEnhancer` → `visitTracker` → `customHeaders` → route handler → `errorHandler`

**State passing:** Middlewares communicate via `res.locals` (app state) and `req.id` (request ID). The `trackMiddleware` helper in `index.js` records execution for the visualization.
