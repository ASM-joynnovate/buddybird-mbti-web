// Stateless liveness probe for the Docker HEALTHCHECK and the Caddy reverse
// proxy. Returns 200 only; it reads and stores no user data (ADR-0002).
// `force-dynamic` keeps it from being statically cached so the healthcheck
// always exercises the running server.
export const dynamic = 'force-dynamic'

export function GET(): Response {
    return Response.json({ status: 'ok' })
}
