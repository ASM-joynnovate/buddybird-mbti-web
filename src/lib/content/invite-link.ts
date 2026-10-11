import type { Locale } from '@/lib/i18n/locale';
import { localizedPath } from '@/lib/i18n/path';

export const RESULT_COPY_REF = 'result_copy';

export function resultCopyUrl(locale: Locale): string {
	return `https://mbti.buddybird.xyz${localizedPath('/', locale)}?ref=${RESULT_COPY_REF}`;
}

export function isResultCopyReferral(search: string): boolean {
	return new URLSearchParams(search).get('ref') === RESULT_COPY_REF;
}
