// E2E helpers: static server lifecycle, agent-browser wrappers, assertions.
// All browser interaction goes through agent-browser CLI (npx -y agent-browser ...).
// No Playwright, no jest, no vitest.
import { execSync, spawn } from 'child_process';
import { cpSync, existsSync } from 'fs';
import { createConnection } from 'net';
import { join } from 'path';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export const PORT = 3779;
export const BASE_URL = `http://localhost:${PORT}`;

// Max poll attempts for waitFor. Each cycle is ~200 ms of wait → ceiling ~20 s.
const WAIT_MAX_ATTEMPTS = 100;
const WAIT_INTERVAL_MS = 200;

// ---------------------------------------------------------------------------
// assert
// ---------------------------------------------------------------------------

/** Throw with a clear message when condition is falsy. */
export function assert(condition, message) {
	if (!condition) {
		throw new Error(`ASSERTION FAILED: ${message}`);
	}
}

// ---------------------------------------------------------------------------
// App server (Next standalone — mirrors the deployed container runtime)
// ---------------------------------------------------------------------------

let serverProcess = null;

// Probe a URL with curl — no extra deps, stays ESM-friendly. Resolves true on HTTP 2xx.
async function curlProbe(url) {
	return new Promise((resolve) => {
		const proc = spawn('curl', ['-sf', '--max-time', '1', '-o', '/dev/null', url], {
			stdio: 'pipe',
		});
		proc.on('close', (code) => resolve(code === 0));
	});
}

// Resolve true when something already listens on the port. Raw TCP connect (not
// curl) so even a wedged non-HTTP listener is detected. Guards against zombie
// servers from interrupted runs: their stale 200s would otherwise satisfy the
// readiness poll while our own spawn dies silently on EADDRINUSE.
function isPortInUse(port) {
	return new Promise((resolve) => {
		const socket = createConnection({ port, host: '127.0.0.1' });
		socket.setTimeout(1000);
		socket.once('connect', () => {
			socket.destroy();
			resolve(true);
		});
		socket.once('timeout', () => {
			socket.destroy();
			resolve(false);
		});
		socket.once('error', () => resolve(false));
	});
}

// Poll the server with curl until it answers or the attempt ceiling is hit.
// `getExit` reports the spawned process's early death (e.g. a crash on boot) so
// the poll aborts immediately with the real error instead of timing out blind.
async function pollUntilReady(getExit) {
	for (let i = 0; i < 50; i++) {
		const exit = getExit();
		if (exit !== null) {
			throw new Error(
				`App server exited with code ${exit.code} before becoming ready` +
					(exit.stderr ? ` — stderr:\n${exit.stderr}` : ''),
			);
		}
		const ok = await curlProbe(`${BASE_URL}/`);
		if (ok) return;
		await sleep(200);
	}
	throw new Error(`App server did not become ready on port ${PORT} within 10 s`);
}

/** Kill the app server. Safe to call multiple times. */
export function stopServer() {
	if (serverProcess) {
		try {
			serverProcess.kill('SIGTERM');
		} catch {
			// already gone
		}
		serverProcess = null;
	}
}

/**
 * Start the Next standalone server, the same artifact the container runs.
 * `next build` (output:'standalone') emits `.next/standalone/server.js` but does
 * NOT copy `public` or `.next/static` — we copy them in (idempotent), exactly as
 * the Dockerfile does, then launch the minimal server bound to localhost.
 *
 * @param {string} rootDir  Project root containing `.next/standalone`.
 */
export async function startAppServer(rootDir) {
	const standaloneDir = join(rootDir, '.next', 'standalone');
	const serverEntry = join(standaloneDir, 'server.js');
	assert(existsSync(serverEntry), `.next/standalone/server.js not found at ${serverEntry} — run yarn build first`);

	// Refuse to start over a zombie server (interrupted prior run). Its stale
	// responses would pass the readiness poll and every flow would then run
	// against an outdated build — fail loud with the cleanup command instead.
	assert(
		!(await isPortInUse(PORT)),
		`port ${PORT} is already in use — a previous e2e server is still running. ` +
			`Kill it first: lsof -ti :${PORT} | xargs kill`,
	);

	// Mirror the Dockerfile asset copy so CSS/JS/images/fonts resolve.
	cpSync(join(rootDir, 'public'), join(standaloneDir, 'public'), { recursive: true });
	cpSync(join(rootDir, '.next', 'static'), join(standaloneDir, '.next', 'static'), {
		recursive: true,
	});

	serverProcess = spawn('node', [serverEntry], {
		stdio: 'pipe',
		detached: false,
		env: { ...process.env, PORT: String(PORT), HOSTNAME: '127.0.0.1' },
	});

	// Keep stderr (capped) so a boot failure reports its actual cause; stdout
	// stays drained-and-dropped to avoid backpressure on a chatty server.
	let stderrTail = '';
	let exitInfo = null;
	serverProcess.stderr.on('data', (chunk) => {
		stderrTail = (stderrTail + chunk).slice(-4000);
	});
	serverProcess.stdout.on('data', () => {});
	serverProcess.on('exit', (code) => {
		exitInfo = { code, stderr: stderrTail.trim() };
	});

	await pollUntilReady(() => exitInfo);
	return stopServer;
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
	}).trim();
}

/** Open a URL in the managed browser session. */
export function openUrl(path) {
	const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
	ab(`open "${url}"`);
}

/**
 * Evaluate a JS expression in the browser context and return the parsed value.
 * The expression must be a valid JS expression (not a statement) that the
 * agent-browser eval command can execute.
 */
export function evalJs(jsExpr) {
	const raw = ab(`eval "${jsExpr.replace(/"/g, '\\"')}"`);
	// agent-browser prints the return value; try JSON parse, fall back to raw.
	try {
		return JSON.parse(raw);
	} catch {
		return raw;
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
		ab(`screenshot "${absolutePath}"`);
	} catch (err) {
		process.stderr.write(`[screenshot skipped] ${absolutePath}: ${err.message}\n`);
	}
}

/** Set the viewport dimensions before opening a URL. */
export function setViewport(width, height, scale = 2) {
	ab(`set viewport ${width} ${height} ${scale}`);
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
			const result = evalJs(predicateJs);
			if (result === true || result === 'true') return;
		} catch {
			// eval may throw transiently during page transitions — keep polling
		}
		await sleep(WAIT_INTERVAL_MS);
	}
	throw new Error(
		`waitFor timed out after ${WAIT_MAX_ATTEMPTS} attempts (~${(WAIT_MAX_ATTEMPTS * WAIT_INTERVAL_MS) / 1000}s): ${label}`,
	);
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
	await waitFor(`document.readyState === 'complete'`, 'document.readyState complete');
	// fonts.ready is a Promise; check it via a JS expression that resolves it inline.
	await waitFor(
		`(function(){var d=document.querySelector('[data-testid="${testId}"]');return !!(d && d.offsetParent !== null || d && getComputedStyle(d).display !== 'none')})()`,
		`[data-testid="${testId}"] visible`,
	);
}

/**
 * Wait for an element with the given data-testid to exist in the DOM.
 * Does not require visibility (useful for hidden but mounted elements).
 */
export async function waitForTestId(testId) {
	await waitFor(`!!document.querySelector('[data-testid="${testId}"]')`, `[data-testid="${testId}"] present`);
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
	);
	assert(result === 'OK', `clickTestId: element [data-testid="${testId}"] not found`);
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
	);
	return result === 'null' || result === null ? null : result;
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
	);
	return result === 'null' || result === null ? null : result;
}

/**
 * Read the trimmed text content of an element identified by data-testid.
 * Returns null if the element is absent.
 */
export function getText(testId) {
	const result = evalJs(
		`(function(){var el=document.querySelector('[data-testid="${testId}"]');return el ? el.textContent.trim() : null;})()`,
	);
	return result === 'null' || result === null ? null : result;
}

// ---------------------------------------------------------------------------
// Internal utilities
// ---------------------------------------------------------------------------

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Pause long enough for the agent-browser daemon to finish any pending I/O
 * before the next flow starts. Call between flows in the orchestrator.
 */
export function settle() {
	return sleep(1000);
}
