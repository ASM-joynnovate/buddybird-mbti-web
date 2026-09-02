// Firebase web app configuration sourced from NEXT_PUBLIC_* env vars (ADR-0011).
// The values are public identifiers (not secrets) that Next.js inlines into the
// client bundle at build time, which is why every variable below is read through
// a literal property access — dynamic key lookups are never inlined.

export interface FirebaseWebConfig {
	apiKey: string;
	authDomain: string;
	projectId: string;
	storageBucket: string;
	messagingSenderId: string;
	appId: string;
	measurementId: string;
}

const rawConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
	measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} satisfies Record<keyof FirebaseWebConfig, string | undefined>;

// Returns the full config, or null when any key is missing. A null config keeps
// Firebase fully disabled (console analytics adapter, zero Firebase imports), so
// local/CI builds without env behave exactly like the pre-Firebase app.
export function getFirebaseConfig(): FirebaseWebConfig | null {
	if (Object.values(rawConfig).some((value) => !value)) return null;
	return rawConfig as FirebaseWebConfig;
}

export function isFirebaseConfigured(): boolean {
	return getFirebaseConfig() !== null;
}
