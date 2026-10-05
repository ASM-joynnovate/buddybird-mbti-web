'use client';

import { type ReactNode, createContext, use } from 'react';

import type { Locale } from '@/lib/i18n/locale';
import { translator } from '@/lib/i18n/translate';

const LocaleContext = createContext<Locale>('ko');
const translators = { ko: translator('ko'), en: translator('en') };

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
	return <LocaleContext value={locale}>{children}</LocaleContext>;
}

export function useLocale() {
	return use(LocaleContext);
}

export function useTranslation() {
	return translators[useLocale()];
}
