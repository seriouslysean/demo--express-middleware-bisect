# Express Middleware + Git Bisect Demo

A hands-on demonstration for Slipstream engineers covering two topics:

1. **Express Middleware Patterns** — How middleware chains work, `res.locals` for state passing, and common middleware implementations
2. **Git Bisect** — Binary search through commit history to find when a bug was introduced

---

## Table of Contents

- [Quick Start](#quick-start)
- [What You'll See](#what-youll-see)
- [The Bug](#the-bug)
- [Middleware Deep Dive](#middleware-deep-dive)
- [Git Bisect Tutorial](#git-bisect-tutorial)
- [Project Structure](#project-structure)

---

## Quick Start

```bash
npm install
npm start
```

Open http://localhost:3000 in your browser.

---

## What You'll See

The app renders an HTML page showing:

| Section | Description |
|---------|-------------|
| **Header** | App name and version from `res.locals` |
| **Request Info** | Unique request ID and visit count (cookie-based) |
| **Middleware Chain** | Visual list of every middleware that ran, in order |
| **The Bug** | A `<p>THIS IS A BUG</p>` element that shouldn't be there |

---

## The Bug

### What is it?

The page displays unwanted text: **"THIS IS A BUG"**

### Where is it?

```
middleware/content-enhancer.js
```

```javascript
export function contentEnhancer(req, res, next) {
    res.locals.enhancedContent = {
        greeting: 'Welcome to the demo!',
        // BUG: This should not be here
        debugInfo: '<p>THIS IS A BUG</p>',
    };
    next();
}
```

The `debugInfo` property is rendered in `index.js`:

```javascript
${res.locals.enhancedContent.debugInfo}  // <-- Bug appears here
```

### When was it introduced?

**Commit 9** — `feat: add content enhancer middleware`

Your job is to find this using `git bisect` without looking at the code!

---

## Middleware Deep Dive

### Execution Order

```
Request
   │
   ▼
┌─────────────────┐
│  normalizeUrl   │  Redirects //path → /path
└────────┬────────┘
         ▼
┌─────────────────┐
│  requestLogger  │  Logs: [timestamp] METHOD /url - status (duration)
└────────┬────────┘
         ▼
┌─────────────────┐
│   requestId     │  Generates UUID → req.id, res.locals.requestId
└────────┬────────┘
         ▼
┌─────────────────┐
│  responseTime   │  Sets X-Response-Time header
└────────┬────────┘
         ▼
┌─────────────────┐
│   setDefaults   │  Initializes res.locals (appName, version, middlewareChain)
└────────┬────────┘
         ▼
┌─────────────────┐
│   setCspNonce   │  Generates CSP nonce for inline scripts
└────────┬────────┘
         ▼
┌─────────────────┐
│ parseUserAgent  │  Parses browser/OS from User-Agent header
└────────┬────────┘
         ▼
┌─────────────────┐
│ contentEnhancer │  ⚠️  BUG IS HERE - adds debugInfo to res.locals
└────────┬────────┘
         ▼
┌─────────────────┐
│  visitTracker   │  Reads/writes 'visits' cookie, increments count
└────────┬────────┘
         ▼
┌─────────────────┐
│  customHeaders  │  Sets X-Powered-By, X-Request-Id headers
└────────┬────────┘
         ▼
┌─────────────────┐
│  Route Handler  │  GET / → renders HTML with all res.locals data
└────────┬────────┘
         ▼
┌─────────────────┐
│  errorHandler   │  Catches errors, renders error page
└─────────────────┘
```

### Middleware Reference

| Middleware | File | What It Does | Slipstream Parallel |
|------------|------|--------------|---------------------|
| `normalizeUrl` | `url-normalizer.js` | Redirects `//path` to `/path` (301) | `redirectDoubleSlashes` |
| `requestLogger` | `request-logger.js` | Logs method, URL, status code, and duration on response finish | `logRequestPerformance` |
| `requestId` | `request-id.js` | Generates `crypto.randomUUID()`, attaches to `req.id` and `res.locals.requestId` | Request tracing |
| `responseTime` | `response-time.js` | Measures request duration, sets `X-Response-Time` header | Performance monitoring |
| `setDefaults` | `set-defaults.js` | Factory function returning middleware; initializes `res.locals` with config | `setDefaultsMiddleware` |
| `setCspNonce` | `csp-nonce.js` | Generates 24-byte base64 nonce for Content Security Policy | `setCspNonce` |
| `parseUserAgent` | `user-agent.js` | Parses `User-Agent` header into `{ raw, browser, os }` | Client detection |
| `contentEnhancer` | `content-enhancer.js` | Adds `enhancedContent` to `res.locals` — **contains the bug** | — |
| `visitTracker` | `visit-tracker.js` | Reads `visits` cookie, increments, sets new cookie (24hr expiry) | `contentfulTimeMiddleware` |
| `customHeaders` | `custom-headers.js` | Sets `X-Powered-By` and `X-Request-Id` response headers | Custom headers |
| `errorHandler` | `error-handler.js` | Express error handler (4 params: `err, req, res, next`), logs and renders error page | Error handling |

### Key Patterns Demonstrated

| Pattern | Example | Description |
|---------|---------|-------------|
| **State via `res.locals`** | `res.locals.requestId = req.id` | Pass data between middlewares and to templates |
| **Factory middleware** | `setDefaults(config)` returns `(req, res, next) => {}` | Configurable middleware with closure |
| **Response event hooks** | `res.on('finish', () => {})` | Run code after response is sent (logging, timing) |
| **Error middleware** | `function(err, req, res, next)` | 4-param signature tells Express this handles errors |
| **Barrel exports** | `middleware/index.js` | Re-export all middlewares from single entry point |

---

## Git Bisect Tutorial

Git bisect performs a binary search through your commit history to find which commit introduced a bug. With 16 commits, it finds the culprit in ~4 steps instead of 16.

### Prerequisites

```bash
# Make sure you're on main with a clean working directory
git checkout main
git status  # Should show "nothing to commit"
```

### Step 1: Start Bisect

```bash
git bisect start
```

### Step 2: Mark Current State as Bad

The bug exists now, so mark HEAD as bad:

```bash
git bisect bad
```

### Step 3: Mark a Known Good Commit

Find the first commit (before any features were added):

```bash
# Get the first commit hash
git rev-list --max-parents=0 HEAD
```

Mark it as good (the bug didn't exist then):

```bash
git bisect good <first-commit-hash>
```

### Step 4: Test and Iterate

Git checks out a commit in the middle. Test it:

```bash
npm start
# Open http://localhost:3000
# Look for "THIS IS A BUG" text
```

Then tell git what you found:

```bash
# If you see the bug:
git bisect bad

# If you don't see the bug:
git bisect good
```

**Repeat** until git identifies the first bad commit.

### Step 5: Review the Result

Git will output something like:

```
<commit-hash> is the first bad commit
commit <commit-hash>
Author: ...
Date: ...

    feat: add content enhancer middleware
```

### Step 6: Clean Up

Return to your original branch:

```bash
git bisect reset
```

### Bisect Cheat Sheet

| Command | What It Does |
|---------|--------------|
| `git bisect start` | Begin bisect session |
| `git bisect bad [commit]` | Mark commit as having the bug (defaults to HEAD) |
| `git bisect good <commit>` | Mark commit as not having the bug |
| `git bisect reset` | End session, return to original HEAD |
| `git bisect log` | Show bisect history |
| `git bisect visualize` | Open gitk showing remaining commits |
| `git bisect run <script>` | Automate with a test script |

### Automating Bisect

Instead of manually testing, you can automate with a script that exits 0 (good) or 1 (bad):

```bash
# Create a test script
cat > test-for-bug.sh << 'EOF'
#!/bin/bash
npm start &
PID=$!
sleep 2
RESULT=$(curl -s http://localhost:3000 | grep -c "THIS IS A BUG")
kill $PID 2>/dev/null
exit $RESULT
EOF
chmod +x test-for-bug.sh

# Run automated bisect
git bisect start HEAD $(git rev-list --max-parents=0 HEAD)
git bisect run ./test-for-bug.sh

# Clean up
git bisect reset
rm test-for-bug.sh
```

---

## Project Structure

```
demo--express-middleware-bisect/
├── index.js                    # Express app entry point
│                               # - Registers all middlewares
│                               # - Defines GET / route
│                               # - Renders HTML with res.locals data
│
├── middleware/
│   ├── index.js                # Barrel export (re-exports all middlewares)
│   ├── content-enhancer.js     # ⚠️  Contains the bug
│   ├── csp-nonce.js
│   ├── custom-headers.js
│   ├── error-handler.js
│   ├── request-id.js
│   ├── request-logger.js
│   ├── response-time.js
│   ├── set-defaults.js
│   ├── url-normalizer.js
│   ├── user-agent.js
│   └── visit-tracker.js
│
├── package.json                # type: module (ESM)
├── CLAUDE.md                   # AI assistant context
└── README.md                   # Quick reference
```

---

## Commit History

The project was built incrementally across 16 commits:

| # | Commit Message | What Changed |
|---|----------------|--------------|
| 1 | `feat: initial Express server setup` | Basic Express app, package.json |
| 2 | `feat: add request logger middleware` | Logs requests on finish |
| 3 | `feat: add request ID middleware` | UUID generation |
| 4 | `feat: add response time middleware` | X-Response-Time header |
| 5 | `feat: add defaults middleware` | res.locals initialization |
| 6 | `refactor: enhance HTML to show middleware chain` | Visual middleware display |
| 7 | `feat: add CSP nonce middleware` | Security nonce generation |
| 8 | `feat: add user agent parser middleware` | Browser/OS detection |
| **9** | **`feat: add content enhancer middleware`** | **⚠️ BUG INTRODUCED** |
| 10 | `feat: add visit tracking middleware` | Cookie-based counter |
| 11 | `feat: add custom headers middleware` | X-Powered-By, X-Request-Id |
| 12 | `feat: add URL normalizer middleware` | Double-slash redirect |
| 13 | `feat: add error handler middleware` | Error page rendering |
| 14 | `refactor: move middlewares to separate files` | Code organization |
| 15 | `refactor: add barrel export for middlewares` | Clean imports |
| 16 | `docs: add README with middleware documentation` | Documentation |

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.21.0 | Web framework |
| `cookie-parser` | ^1.4.7 | Parse Cookie header, populate `req.cookies` |

---

## License

MIT
