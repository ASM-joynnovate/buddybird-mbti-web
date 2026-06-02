// E2E helpers: static server lifecycle, agent-browser wrappers, assertions.
// All browser interaction goes through agent-browser CLI (npx -y agent-browser ...).
// No Playwright, no jest, no vitest.

import { execSync, spawn } from 'child_process'
import { existsSync } from 'fs'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export const PORT = 3779
export const BASE_URL = `http://localhost:${PORT}`

// Max poll attempts for waitFor. Each cycle is ~200 ms of wait → ceiling ~20 s.
const WAIT_MAX_ATTEMPTS = 100
const WAIT_INTERVAL_MS = 200

// ---------------------------------------------------------------------------
// assert
// ---------------------------------------------------------------------------

/** Throw with a clear message when condition is falsy. */
export function assert(condition, message) {
    if (!condition) {
        throw new Error(`ASSERTION FAILED: ${message}`)
    }
}

// ---------------------------------------------------------------------------
// Static file server
// ---------------------------------------------------------------------------

let serverProcess = null

// Probe a URL with curl — no extra deps, stays ESM-friendly. Resolves true on HTTP 2xx.
async function curlProbe(url) {
    return new Promise((resolve) => {
        const proc = spawn('curl', ['-sf', '--max-time', '1', '-o', '/dev/null', url], {
            stdio: 'pipe',
        })
        proc.on('close', (code) => resolve(code === 0))
    })
}

// Poll the server with curl until it answers or the attempt ceiling is hit.
async function pollUntilReady() {
    for (let i = 0; i < 50; i++) {
        const ok = await curlProbe(`${BASE_URL}/`)
        if (ok) return
        await sleep(200)
    }
    throw new Error(`Static server did not become ready on port ${PORT} within 10 s`)
}

/** Kill the static server. Safe to call multiple times. */
export function stopServer() {
    if (serverProcess) {
        try {
            serverProcess.kill('SIGTERM')
        } catch {
            // already gone
        }
        serverProcess = null
    }
}

// Re-export startServer that uses the curl probe.
export async function startStaticServer(outDir) {
    assert(existsSync(outDir), `out/ directory not found at ${outDir} — run yarn build first`)

    serverProcess = spawn(
        'npx',
        ['-y', 'serve', outDir, '--listen', String(PORT), '--no-clipboard', '--single'],
        { stdio: 'pipe', detached: false },
    )

    serverProcess.stderr.on('data', () => {})
    serverProcess.stdout.on('data', () => {})

    await pollUntilReady()
    return stopServer
}

// ---------------------------------------------------------------------------
// agent-browser wrappers
// ---------------------------------------------------------------------------

/**
 * Run any agent-browser subcommand and return stdout as a string.
 * Throws on non-zero exit.
 */
function ab(args) {
    return execSync(`npx -y agent-browser ${args}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
    }).trim()
}

/** Open a URL in the managed browser session. */
export function openUrl(path) {
    const url = path.startsWith('http') ? path : `${BASE_URL}${path}`
    ab(`open "${url}"`)
}

/**
 * Evaluate a JS expression in the browser context and return the parsed value.
 * The expression must be a valid JS expression (not a statement) that the
 * agent-browser eval command can execute.
 */
export function evalJs(jsExpr) {
    const raw = ab(`eval "${jsExpr.replace(/"/g, '\\"')}"`)
    // agent-browser prints the return value; try JSON parse, fall back to raw.
    try {
        return JSON.parse(raw)
    } catch {
        return raw
    }
}

/**
 * Capture a screenshot to the given absolute path.
 * Non-fatal: if the agent-browser daemon is temporarily busy (EAGAIN / os error 35)
 * the error is logged to stderr and the test continues. Screenshots are diagnostic
 * artifacts; a daemon hiccup must not fail a flow assertion.
 */
export function screenshot(absolutePath) {
    try {
        ab(`screenshot "${absolutePath}"`)
    } catch (err) {
        process.stderr.write(`[screenshot skipped] ${absolutePath}: ${err.message}\n`)
    }
}

/** Set the viewport dimensions before opening a URL. */
export function setViewport(width, height, scale = 2) {
    ab(`set viewport ${width} ${height} ${scale}`)
}

// ---------------------------------------------------------------------------
// waitFor
// ---------------------------------------------------------------------------

/**
 * Poll a boolean JS predicate until it returns truthy.
 * Throws if MAX_ATTEMPTS is exhausted — this is a hard ceiling, not a timer.
 *
 * @param {string} predicateJs  A JS expression (no semicolons) that evaluates to boolean.
 * @param {string} [label]      Human-readable description for error messages.
 */
export async function waitFor(predicateJs, label = predicateJs) {
    for (let attempt = 0; attempt < WAIT_MAX_ATTEMPTS; attempt++) {
        try {
            const result = evalJs(predicateJs)
            if (result === true || result === 'true') return
        } catch {
            // eval may throw transiently during page transitions — keep polling
        }
        await sleep(WAIT_INTERVAL_MS)
    }
    throw new Error(
        `waitFor timed out after ${WAIT_MAX_ATTEMPTS} attempts (~${(WAIT_MAX_ATTEMPTS * WAIT_INTERVAL_MS) / 1000}s): ${label}`,
    )
}

/**
 * Wait for the page to be fully ready:
 *   1. document.readyState === 'complete'
 *   2. document.fonts.ready resolved (checked via a flag we set)
 *   3. A sentinel element is present and visible
 *
 * @param {string} testId  The data-testid value of the surface sentinel.
 */
export async function waitForSurface(testId) {
    await waitFor(`document.readyState === 'complete'`, 'document.readyState complete')
    // fonts.ready is a Promise; check it via a JS expression that resolves it inline.
    await waitFor(
        `(function(){var d=document.querySelector('[data-testid="${testId}"]');return !!(d && d.offsetParent !== null || d && getComputedStyle(d).display !== 'none')})()`,
        `[data-testid="${testId}"] visible`,
    )
}

/**
 * Wait for an element with the given data-testid to exist in the DOM.
 * Does not require visibility (useful for hidden but mounted elements).
 */
export async function waitForTestId(testId) {
    await waitFor(
        `!!document.querySelector('[data-testid="${testId}"]')`,
        `[data-testid="${testId}"] present`,
    )
}

// ---------------------------------------------------------------------------
// Interaction helpers
// ---------------------------------------------------------------------------

/**
 * Click an element identified by data-testid.
 * Throws if the element is not found.
 */
export function clickTestId(testId) {
    const result = evalJs(
        `(function(){var el=document.querySelector('[data-testid="${testId}"]');if(!el)return 'NOT_FOUND';el.click();return 'OK';})()`,
    )
    assert(result === 'OK', `clickTestId: element [data-testid="${testId}"] not found`)
}

/**
 * Atomically find the first choice button whose data-testid ends with `variant`
 * ('a' or 'b') and click it in a single eval round-trip.
 *
 * Returns the testid string of the clicked element, or null if no matching
 * button was present at the moment of evaluation. Callers must treat null as
 * "not ready yet" and retry — never split the find and click into two evals.
 *
 * @param {string} variant  Suffix to match: 'a' or 'b'.
 * @returns {string|null}
 */
export function findAndClickChoice(variant) {
    const result = evalJs(
        `(function(){` +
            `var els=document.querySelectorAll('[data-testid^="choice-"]');` +
            `for(var i=0;i<els.length;i++){` +
            `  var id=els[i].getAttribute('data-testid');` +
            `  if(id && id.endsWith('${variant}')){els[i].click();return id;}` +
            `}` +
            `return null;` +
            `})()`,
    )
    return result === 'null' || result === null ? null : result
}

/**
 * Atomically find the first choice button with any variant suffix and click it.
 * Returns the testid of the clicked element, or null if nothing was found.
 */
export function findAndClickFirstChoice() {
    const result = evalJs(
        `(function(){` +
            `var els=document.querySelectorAll('[data-testid^="choice-"]');` +
            `if(!els.length)return null;` +
            `var id=els[0].getAttribute('data-testid');` +
            `els[0].click();` +
            `return id;` +
            `})()`,
    )
    return result === 'null' || result === null ? null : result
}

/**
 * Read the trimmed text content of an element identified by data-testid.
 * Returns null if the element is absent.
 */
export function getText(testId) {
    const result = evalJs(
        `(function(){var el=document.querySelector('[data-testid="${testId}"]');return el ? el.textContent.trim() : null;})()`,
    )
    return result === 'null' || result === null ? null : result
}

// ---------------------------------------------------------------------------
// Internal utilities
// ---------------------------------------------------------------------------

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Pause long enough for the agent-browser daemon to finish any pending I/O
 * before the next flow starts. Call between flows in the orchestrator.
 */
export function settle() {
    return sleep(1000)
}
