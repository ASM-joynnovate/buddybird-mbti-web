// Microsoft Clarity project id sourced from a NEXT_PUBLIC_* env var (ADR-0015).
// The value is a public identifier (not a secret) that Next.js inlines into the
// client bundle at build time — read through a literal property access because
// dynamic key lookups are never inlined. A missing id keeps Clarity fully
// disabled (zero SDK imports), mirroring shared/firebase/config.ts.

const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

// Returns the Clarity project id, or null when unset — null keeps the whole
// Clarity module dormant so local/CI builds behave exactly like before.
export function getClarityProjectId(): string | null {
	return projectId || null;
}

export function isClarityConfigured(): boolean {
	return getClarityProjectId() !== null;
}
