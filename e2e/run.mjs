// E2E orchestrator: build is expected to have already run (yarn build).
// Starts the static server, runs all flows in sequence, stops the server,
// exits 1 if any flow failed.
//
// Usage:
//   node e2e/run.mjs          (after yarn build)
//   yarn e2e                  (runs yarn build then this file)
//   yarn e2e:run              (this file only, assumes prior build)

import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { run as runAccessibility } from './flows/accessibility.mjs'
import { run as runAnalyticsEvents } from './flows/analytics-events.mjs'
import { run as runDeckOverlay } from './flows/deck-overlay.mjs'
import { run as runFullNavigation } from './flows/full-navigation.mjs'
import { run as runFunnelEvents } from './flows/funnel-events.mjs'
import { run as runIntroCarousel } from './flows/intro-carousel.mjs'
import { run as runKnownAnswerType } from './flows/known-answer-type.mjs'
import { run as runResponsive } from './flows/responsive.mjs'
import { settle, setViewport, startAppServer, stopServer } from './helpers.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ---------------------------------------------------------------------------
// Flow registry
// ---------------------------------------------------------------------------

const FLOWS = [
    { name: 'full-navigation', fn: runFullNavigation },
    { name: 'known-answer-type', fn: runKnownAnswerType },
    { name: 'analytics-events', fn: runAnalyticsEvents },
    { name: 'intro-carousel', fn: runIntroCarousel },
    { name: 'deck-overlay', fn: runDeckOverlay },
    { name: 'funnel-events', fn: runFunnelEvents },
    { name: 'accessibility', fn: runAccessibility },
    { name: 'responsive', fn: runResponsive },
]

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

async function main() {
    console.log('='.repeat(60))
    console.log('BuddyBird MBTI — E2E Test Suite')
    console.log('='.repeat(60))

    // Set a consistent mobile viewport before any flow opens a URL.
    setViewport(390, 844, 2)

    try {
        console.log(`\nStarting Next standalone server on port 3779 ...`)
        await startAppServer(ROOT)
        console.log('Server ready.\n')
    } catch (err) {
        console.error(`FATAL: could not start app server — ${err.message}`)
        process.exit(1)
    }

    const results = []

    for (let i = 0; i < FLOWS.length; i++) {
        // Give the agent-browser daemon a moment to settle between flows.
        if (i > 0) await settle()
        const flow = FLOWS[i]
        process.stdout.write(`  Running flow: ${flow.name} ... `)
        try {
            const data = await flow.fn()
            const summary = JSON.stringify(data)
            console.log(`PASS  ${summary}`)
            results.push({ name: flow.name, passed: true, data })
        } catch (err) {
            console.log(`FAIL`)
            console.error(`    ${err.message}`)
            results.push({ name: flow.name, passed: false, error: err.message })
        }
    }

    // Always stop the server.
    stopServer()

    // ---------------------------------------------------------------------------
    // Summary
    // ---------------------------------------------------------------------------

    console.log('\n' + '='.repeat(60))
    console.log('Results')
    console.log('='.repeat(60))

    let anyFailed = false
    for (const r of results) {
        const label = r.passed ? 'PASS' : 'FAIL'
        console.log(`  ${label}  ${r.name}`)
        if (!r.passed) {
            console.log(`        ${r.error}`)
            anyFailed = true
        }
    }

    console.log('='.repeat(60))

    if (anyFailed) {
        console.error('\nOne or more flows failed.')
        process.exit(1)
    } else {
        console.log('\nAll flows passed.')
        process.exit(0)
    }
}

main().catch((err) => {
    stopServer()
    console.error('Unexpected orchestrator error:', err)
    process.exit(1)
})
