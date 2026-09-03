const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

export function getClarityProjectId(): string | null {
	return projectId || null;
}

export function isClarityConfigured(): boolean {
	return getClarityProjectId() !== null;
}
