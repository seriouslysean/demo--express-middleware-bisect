# Express Middleware + Git Bisect Demo

A demonstration project showcasing Express middleware patterns and git bisect workflow for finding bugs.

## Quick Start

```bash
npm install
npm start
```

Visit `http://localhost:3000` to see the middleware chain visualization.

## The Bug

This project intentionally contains a bug that displays `<p>THIS IS A BUG</p>` in the HTML output. Your task is to find which commit introduced the bug using `git bisect`.

## Middlewares

| Middleware | File | Description |
|------------|------|-------------|
| `normalizeUrl` | `url-normalizer.js` | Redirects double slashes (`//path` → `/path`) |
| `requestLogger` | `request-logger.js` | Logs request method, URL, status, and duration |
| `requestId` | `request-id.js` | Attaches unique UUID to `req.id` and `res.locals.requestId` |
| `responseTime` | `response-time.js` | Sets `X-Response-Time` header |
| `setDefaults` | `set-defaults.js` | Initializes `res.locals` with app config |
| `setCspNonce` | `csp-nonce.js` | Generates CSP nonce for script security |
| `parseUserAgent` | `user-agent.js` | Parses User-Agent into browser/OS info |
| `contentEnhancer` | `content-enhancer.js` | Enhances content (contains the bug!) |
| `visitTracker` | `visit-tracker.js` | Cookie-based visit counting |
| `customHeaders` | `custom-headers.js` | Sets `X-Powered-By` and `X-Request-Id` headers |
| `errorHandler` | `error-handler.js` | Express error handler (4-param middleware) |

## Git Bisect Demo

### Step 1: Identify the bug

```bash
npm start
# Open http://localhost:3000
# Notice "THIS IS A BUG" text in the page
```

### Step 2: Start bisect

```bash
git bisect start
```

### Step 3: Mark current commit as bad

```bash
git bisect bad
```

### Step 4: Mark the first commit as good

```bash
# Get the first commit hash
git rev-list --max-parents=0 HEAD

# Mark it as good
git bisect good <first-commit-sha>
```

### Step 5: Test each commit

Git will checkout a middle commit. Test it:

```bash
npm start
# Check if the bug exists
# If bug visible: git bisect bad
# If no bug: git bisect good
```

### Step 6: Repeat until found

After ~4 iterations, git will identify the commit that introduced the bug.

### Step 7: End bisect

```bash
git bisect reset
```

## Automating Bisect

You can automate the bisect with a test script:

```bash
git bisect start HEAD <first-commit-sha>
git bisect run sh -c 'npm start & sleep 2 && curl -s http://localhost:3000 | grep -q "THIS IS A BUG" && exit 1 || exit 0; kill %1'
```

## Project Structure

```
├── index.js              # Main Express app
├── middleware/
│   ├── index.js          # Barrel export
│   ├── content-enhancer.js
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
├── package.json
└── README.md
```

## Dependencies

- `express` - Web framework
- `cookie-parser` - Cookie parsing middleware

## License

MIT
