export type Locale = 'ko' | 'en';

// Missing country data (including local development) preserves the Korean site.
export function localeFromCountry(country: string | null): Locale {
	const code = country?.trim().toUpperCase();
	return code && /^[A-Z]{2}$/.test(code) && code !== 'KR' && code !== 'XX' ? 'en' : 'ko';
}
