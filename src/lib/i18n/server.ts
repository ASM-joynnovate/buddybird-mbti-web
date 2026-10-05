import { locale } from 'next/root-params';

import type { Locale } from './locale';
import { translator } from './translate';

// The proxy picks the `[locale]` segment per country, so pages stay statically rendered.
export async function getLocale(): Promise<Locale> {
	return (await locale()) === 'en' ? 'en' : 'ko';
}

export async function getTranslator() {
	return translator(await getLocale());
}
