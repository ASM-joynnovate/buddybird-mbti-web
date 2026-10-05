import en from './en.json';
import type { Locale } from './locale';

export function translator(locale: Locale) {
	return (text: string): string => (locale === 'en' ? ((en as Record<string, string>)[text] ?? text) : text);
}
